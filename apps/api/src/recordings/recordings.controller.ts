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

@Controller('recordings')
export class RecordingsController {
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

    return {
      message: '錄音上傳成功',
      file: {
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      },
    };
  }
}
