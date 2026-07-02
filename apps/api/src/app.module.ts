import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RecordingsController } from './recordings/recordings.controller';
import { RecordingsService } from './recordings/recordings.service';
import { AgentRunsModule } from './agent-runs/agent-runs.module';
import { AudioProcessingModule } from './audio-processing/audio-processing.module';

@Module({
  imports: [
    AgentRunsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AudioProcessingModule,
  ],
  controllers: [RecordingsController],
  providers: [RecordingsService],
})
export class AppModule {}
