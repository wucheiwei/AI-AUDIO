import { Test, TestingModule } from '@nestjs/testing';
import { AgentRunsService } from './agent-runs.service';

describe('AgentRunsService', () => {
  let service: AgentRunsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentRunsService],
    }).compile();

    service = module.get<AgentRunsService>(AgentRunsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
