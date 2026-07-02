export type Role = 'user' | 'assistant'

interface BaseMessage {
  id: string
  role: Role
  createdAt: number
}

export interface TextMessage extends BaseMessage {
  kind: 'text'
  text: string
}

export type UploadStatus = 'uploading' | 'done' | 'error'

/** 後端 Agent Run 的處理狀態 */
export type AgentRunStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface AudioMessage extends BaseMessage {
  kind: 'audio'
  audioUrl: string
  /** 錄音長度（秒） */
  duration: number
  /** 上傳到後端的狀態 */
  uploadStatus?: UploadStatus
  /** 上傳失敗時的錯誤訊息 */
  uploadError?: string
  /** 對應後端 Agent Run 的 id（上傳成功後取得）*/
  runId?: string
  /** 後端處理狀態（每 2 秒輪詢更新）*/
  runStatus?: AgentRunStatus
  /** 處理完成後的下載網址 */
  downloadUrl?: string
  /** 處理失敗時的錯誤訊息 */
  runError?: string
}

export type Message = TextMessage | AudioMessage
