import { Module } from '@nestjs/common';
import { AudioProcessingService } from './audio-processing.service';
import { AgentRunsModule } from '../agent-runs/agent-runs.module';

@Module({
  imports: [AgentRunsModule],
  providers: [AudioProcessingService],
  exports: [AudioProcessingService]
})
export class AudioProcessingModule {}
