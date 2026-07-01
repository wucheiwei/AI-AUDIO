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

export interface AudioMessage extends BaseMessage {
  kind: 'audio'
  audioUrl: string
  /** 錄音長度（秒） */
  duration: number
  /** 上傳到後端的狀態 */
  uploadStatus?: UploadStatus
  /** 上傳失敗時的錯誤訊息 */
  uploadError?: string
}

export type Message = TextMessage | AudioMessage
