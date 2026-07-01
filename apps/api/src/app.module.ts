import { Module } from '@nestjs/common';
import { RecordingsController } from './recordings/recordings.controller';
import { RecordingsService } from './recordings/recordings.service';

@Module({
  imports: [],
  controllers: [RecordingsController],
  providers: [RecordingsService],
})
export class AppModule {}
