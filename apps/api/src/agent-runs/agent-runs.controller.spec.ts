import { Test, TestingModule } from '@nestjs/testing';
import { AgentRunsController } from './agent-runs.controller';

describe('AgentRunsController', () => {
  let controller: AgentRunsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentRunsController],
    }).compile();

    controller = module.get<AgentRunsController>(AgentRunsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
