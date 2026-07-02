import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AgentRunsService } from '../agent-runs/agent-runs.service';
import { AudioProcessingService } from '../audio-processing/audio-processing.service';
@Controller('recordings')
export class RecordingsController {
  constructor(
    private readonly agentRunsService: AgentRunsService,
    private readonly audioProcessingService: AudioProcessingService,
  ) {}
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          const uploadPath = 'uploads/recordings';

          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          callback(null, uploadPath);
        },
        filename: (_req, file, callback) => {
          const fileExt = extname(file.originalname) || '.webm';
          const filename = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${fileExt}`;

          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 30 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = [
          'audio/webm',
          'audio/wav',
          'audio/mpeg',
          'audio/mp4',
          'audio/ogg',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(`不支援的音檔格式：${file.mimetype}`),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadRecording(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('沒有收到錄音檔案');
    }
    const run = this.agentRunsService.createFromRecording(file);
    this.audioProcessingService.processRun(run.id);
    return {
      message: '錄音上傳成功，已建立 Agent Run',
      run,
    };
  }
}
