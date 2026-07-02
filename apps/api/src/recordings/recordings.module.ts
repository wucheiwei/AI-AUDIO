import { Module } from '@nestjs/common';
import { RecordingsController } from './recordings.controller';
import { RecordingsService } from './recordings.service';
import { AgentRunsModule } from '../agent-runs/agent-runs.module';
import { AudioProcessingModule } from '../audio-processing/audio-processing.module';

@Module({
  imports: [AgentRunsModule, AudioProcessingModule],
  controllers: [RecordingsController],
  providers: [RecordingsService],
})
export class RecordingsModule {}
