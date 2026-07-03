import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AgentRun } from './types/agent-run.type';
import { AgentRunsRepository } from './repositories/agent-runs.repository';

@Injectable()
export class AgentRunsService {
    constructor(private readonly agentRunsRepository: AgentRunsRepository) { }
    createFromRecording(file: Express.Multer.File) {
        const now = new Date();
        const run: AgentRun = {
            id: randomUUID(),
            status: 'pending',
            inputFile: {
                originalName: file.originalname,
                filename: file.filename,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path,
            },
            createdAt: now,
            updatedAt: now,
        };

        return this.agentRunsRepository.create(run);;
    }
    findAll() {
        return this.agentRunsRepository.findAll();
    }
    findOne(id: string) {
        const run = this.agentRunsRepository.findById(id);
        if (!run) {
            throw new NotFoundException(`找不到任務：${id}`);
        }
        return run;
    }
    updateStatus(id: string, status: AgentRun['status']) {
        const run = this.agentRunsRepository.update(id, {
            status,
        });
        if (!run) {
            throw new NotFoundException(`找不到任務：${id}`);
        }

        return run;
    }
    markFailed(id: string, errorMessage: string) {
        const run = this.agentRunsRepository.update(id, {
            status: 'failed',
            errorMessage,
        });

        if (!run) {
            throw new NotFoundException(`找不到任務：${id}`);
        }

        return run;
    }
    markCompleted(
        id: string, 
        result: {
            outputPath: string;
            outputSize?: number;
            audioInfo?: {
                duration?: number;
                formatName?: string;
                formatLongName?: string;
                sampleRate?: number;
                channels?: number;
                bitRate?: number;
            }
        }
    ) {
        const run = this.agentRunsRepository.update(id, {
            status: 'completed',
            result: {
                ...result,
                message: '音訊處理完成',
            },
        });

        if (!run) {
            throw new NotFoundException(`找不到任務：${id}`);
        }

        return run;
    }
    getDownloadPath(id: string) {
        const run = this.findOne(id);
        if (run.status != 'completed') {
            throw new BadRequestException('任務尚未完成，無法下載');
        }
        if (!run.result?.outputPath) {
            throw new NotFoundException('找不到輸出檔案');
        }
        return run.result.outputPath;
    }
}
