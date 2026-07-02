import { Module } from '@nestjs/common';
import { AgentRunsService } from './agent-runs.service';
import { AgentRunsController } from './agent-runs.controller';
import { AgentRunsRepository } from './repositories/agent-runs.repository';

@Module({
  controllers: [AgentRunsController],
  providers: [AgentRunsService, AgentRunsRepository],
  exports: [AgentRunsService]
})
export class AgentRunsModule {}
