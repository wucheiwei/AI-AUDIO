import { Injectable, Logger } from '@nestjs/common';
import { mkdir, copyFile } from 'fs/promises';
import { spawn } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';
import { AgentRunsService } from '../agent-runs/agent-runs.service';
@Injectable()
export class AudioProcessingService {
    private readonly logger = new Logger(AudioProcessingService.name);
    constructor(private readonly agentRunsService: AgentRunsService) { }

    async processRun(runId: string) {
        void this.processRunInternal(runId);
    }
    private async processRunInternal(runId: string) {
        try {
            const run = this.agentRunsService.findOne(runId);
            this.agentRunsService.updateStatus(runId, 'processing');
            this.logger.log(`開始處理音訊任務: ${runId}`);

            await mkdir('uploads/outputs', {
                recursive: true,
            });
            const outputPath = `uploads/outputs/${run.id}-processed.wav`;
            await this.convertToWav(run.inputFile.path, outputPath);
            this.agentRunsService.markCompleted(runId, outputPath);
            this.logger.log(`音訊任務處理完成：${runId}`)
        } catch (error) {
            const message = error instanceof Error ? error.message : '未知錯誤';
            this.logger.error(`音訊任務處理失敗：${runId}`, message);
            try {
                this.agentRunsService.markFailed(runId, message);
            } catch {
                // 如果連 run 都不存在，就不要再丟第二個錯誤
            }
        }
    }
    private async convertToWav(inputPath: string, outputPath: string) {
        await this.runFfmpeg([
            '-y',
            '-i',
            inputPath,
            '-vn',
            '-acodec',
            'pcm_s24le',
            '-ar',
            '48000',
            '-ac',
            '1',
            outputPath,
        ]);
    }
    private runFfmpeg(args: string[]) {
        return new Promise<void>((resolve, reject) => {
            const ffmpegPath = ffmpegStatic || process.env.FFMPEG_PATH || 'ffmpeg';
            const child = spawn(ffmpegPath, args);
            let stderr = '';
            child.stderr.on('data', (chunk) => {
                stderr += chunk.toString();
            });
            child.on('error', (error) => {
                reject(error);
            })
            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                    return;
                }
                reject(
                    new Error(`FFmpeg 執行失敗，exit code: ${code}\n${stderr}`)
                )
            })
        })
    }
}
