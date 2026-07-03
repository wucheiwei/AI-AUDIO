import { Injectable, Logger } from '@nestjs/common';
import { mkdir, stat } from 'fs/promises';
import { spawn } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import { AgentRunsService } from '../agent-runs/agent-runs.service';

type FfprobeResult = {
    streams?: Array<{
        codec_type?: string;
        sample_rate?: string;
        channels?: number;
        bit_rate?: string;
    }>;
    format?: {
        duration?: string;
        format_name?: string;
        format_long_name?: string;
        bit_rate?: string;
    }
}

type AudioInfo = {
    duration?: number;
    formatName?: string;
    formatLongName?: string;
    sampleRate?: number;
    channels?: number;
    bitRate?: number;
}

@Injectable()
export class AudioProcessingService {
    private readonly logger = new Logger(AudioProcessingService.name);
    constructor(private readonly agentRunsService: AgentRunsService) { }

    processRun(runId: string) {
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
            const audioInfo = await this.probeAudio(outputPath);
            const outputStat = await stat(outputPath);
            this.agentRunsService.markCompleted(runId, {
                outputPath,
                outputSize: outputStat.size,
                audioInfo,
            });
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
        await this.runCommand(this.getFfmpegPath(),[
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
    private async probeAudio(filePath: string): Promise<AudioInfo> {
        const stdout = await this.runCommand(this.getFfprobePath(), [
            '-v',
            'error',
            '-show_format',
            '-show_streams',
            '-print_format',
            'json',
            filePath,
        ])
        const data = JSON.parse(stdout) as FfprobeResult;
        const audioStream = data.streams?.find(
            (stream) => stream.codec_type === 'audio'
        )
        return {
            duration: this.toNumber(data.format?.duration),
            formatName: data.format?.format_name,
            formatLongName: data.format?.format_long_name,
            sampleRate: this.toNumber(audioStream?.sample_rate),
            channels: audioStream?.channels,
            bitRate: this.toNumber(audioStream?.bit_rate),
        }
    }
    private runCommand(command: string, args: string[]) {
        return new Promise<string>((resolve, reject) => {
            const child = spawn(command, args);
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', (chunk) => {
                stdout += chunk.toString();
            });
            child.stderr.on('data', (chunk) => {
                stderr += chunk.toString();
            });
            child.on('error', (error) => {
                reject(error);
            })
            child.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout);
                    return;
                }
                reject(
                    new Error(`Command 執行失敗，exit code: ${code}\n${stderr}`),
                )
            })
        })
    }
    private getFfmpegPath() {
        return ffmpegStatic || process.env.FFMPEG_PATH || 'ffmpeg';
    }
    private getFfprobePath() {
        return ffprobeStatic.path || process.env.FFPROBE_PATH || 'ffprobe';
    }

    private toNumber(value: string | number | undefined) {
        if (value === undefined) {
            return undefined;
        }

        const numberValue = Number(value);

        return Number.isNaN(numberValue) ? undefined : numberValue;
    }
}
