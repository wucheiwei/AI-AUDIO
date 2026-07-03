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
    outputSize?: number;
    message?: string;
  };
  audioInfo?: {
    duration: number;
    formatNmae?: string;
    foratLongName?: string;
    sampleRate?: number;
    channels?: number;
    bitRate?: number;
  }
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
};