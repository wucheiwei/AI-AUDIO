export type AgentRunStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type AgentRun = {
  id: string;
  status: AgentRunStatus;
  inputFile: {
    originalName: string;
    filename: string;
    mimetype: string;
    size: number;
    path: string;
  };
  result?: {
    outputPath?: string;
    message?: string;
  };
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
};