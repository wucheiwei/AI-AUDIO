import type { Recording } from '../composables/useRecorder'
import type { AgentRunStatus } from '../types'

// 後端 API 網址。預設留空 → 相對路徑（同源）；實務上由 .env.local 的
// VITE_API_BASE_URL 指向後端（本機開發／tunnel demo）。
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export interface UploadedFile {
  originalName: string
  filename: string
  mimetype: string
  size: number
  path: string
}

/** 對應後端 AgentRun（JSON 化後日期為字串） */
export interface AgentRun {
  id: string
  status: AgentRunStatus
  inputFile: UploadedFile
  result?: { outputPath?: string; message?: string }
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export interface UploadResponse {
  message: string
  run: AgentRun
}

/** 後端 fileFilter 接受的音檔格式 → 對應副檔名 */
const EXT_BY_TYPE: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
}

/**
 * 把錄音上傳到後端 POST /recordings/upload。
 * 後端以精確字串比對 mimetype，因此這裡先把 `audio/webm;codecs=opus`
 * 這類帶 codec 參數的型別正規化成基本型別，避免被 fileFilter 擋下。
 */
export async function uploadRecording(
  recording: Recording,
): Promise<UploadResponse> {
  const baseType = recording.mimeType.split(';')[0].trim() || 'audio/webm'
  const ext = EXT_BY_TYPE[baseType] ?? 'webm'
  const uploadBlob =
    recording.blob.type === baseType
      ? recording.blob
      : new Blob([recording.blob], { type: baseType })

  const formData = new FormData()
  formData.append('file', uploadBlob, `recording-${Date.now()}.${ext}`)

  const res = await fetch(`${API_BASE}/recordings/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(await readError(res))
  }

  return (await res.json()) as UploadResponse
}

/** 查詢單一 Agent Run 狀態：GET /agent-runs/:id */
export async function getAgentRun(id: string): Promise<AgentRun> {
  const res = await fetch(`${API_BASE}/agent-runs/${id}`)
  if (!res.ok) {
    throw new Error(await readError(res))
  }
  return (await res.json()) as AgentRun
}

/** 組出下載網址：GET /agent-runs/:id/download */
export function agentRunDownloadUrl(id: string): string {
  return `${API_BASE}/agent-runs/${id}/download`
}

/** 盡量從後端回應取出可讀的錯誤訊息 */
async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] }
    if (body?.message) {
      return Array.isArray(body.message) ? body.message.join(', ') : body.message
    }
  } catch {
    // 回應不是 JSON，退回狀態碼
  }
  return `上傳失敗（HTTP ${res.status}）`
}
