import { Injectable, Logger } from '@nestjs/common';
import { mkdir, copyFile } from 'fs/promises';
import { extname } from 'path';
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
            await this.sleep(3000);
            await mkdir('uploads/outputs', {
                recursive: true,
            });
            const fileExt = extname(run.inputFile.path) || '.webm';
            const outputPath = `uploads/outputs/${run.id}-processed${fileExt}`;
            await copyFile(run.inputFile.path, outputPath);
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
    private sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}
