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

export interface AudioMessage extends BaseMessage {
  kind: 'audio'
  audioUrl: string
  /** 錄音長度（秒） */
  duration: number
}

export type Message = TextMessage | AudioMessage
