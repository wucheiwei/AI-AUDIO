import { Controller, Get, Param, Res } from '@nestjs/common';
import {AgentRunsService} from './agent-runs.service';
import type { Response } from 'express';
@Controller('agent-runs')
export class AgentRunsController {
    constructor(private readonly agentRunsService: AgentRunsService) {}
    @Get()
    findAll() {
        return this.agentRunsService.findAll();
    }
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.agentRunsService.findOne(id);
    }
    @Get(':id/download')
    download(@Param('id') id: string, @Res() res: Response) {
        const outputPath = this.agentRunsService.getDownloadPath(id);
        return res.download(outputPath);
    }
}
