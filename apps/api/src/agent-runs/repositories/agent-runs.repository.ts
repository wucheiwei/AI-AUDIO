import { Injectable } from '@nestjs/common';
import { AgentRun } from '../types/agent-run.type';

@Injectable()
export class AgentRunsRepository {
  private readonly runs: AgentRun[] = [];

  create(run: AgentRun) {
    this.runs.push(run);
    return run;
  }

  findAll() {
    return this.runs;
  }

  findById(id: string) {
    return this.runs.find((run) => run.id === id);
  }

  update(id: string, data: Partial<AgentRun>) {
    const run = this.findById(id);

    if (!run) {
      return null;
    }

    Object.assign(run, data, {
      updatedAt: new Date(),
    });

    return run;
  }
}