import { computed, onUnmounted, ref } from 'vue'

export interface Recording {
  blob: Blob
  url: string
  /** 錄音長度（秒） */
  duration: number
  mimeType: string
}

/** 挑選瀏覽器支援的音訊格式 */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg',
  ]
  return candidates.find((type) => MediaRecorder.isTypeSupported(type))
}

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * 封裝瀏覽器 MediaRecorder 的錄音邏輯。
 * 提供 start / stop / cancel，以及錄音狀態與計時。
 */
export function useRecorder() {
  const isSupported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'

  const isRecording = ref(false)
  const elapsed = ref(0)
  const error = ref<string | null>(null)

  const elapsedLabel = computed(() => formatDuration(elapsed.value))

  let mediaRecorder: MediaRecorder | null = null
  let stream: MediaStream | null = null
  let chunks: Blob[] = []
  let timer: ReturnType<typeof setInterval> | null = null
  let startedAt = 0

  function cleanup() {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
    stream?.getTracks().forEach((track) => track.stop())
    stream = null
    mediaRecorder = null
    chunks = []
  }

  async function start(): Promise<void> {
    error.value = null
    if (!isSupported) {
      error.value = '此瀏覽器不支援錄音功能'
      return
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = pickMimeType()
      mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      )
      chunks = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      mediaRecorder.start()

      isRecording.value = true
      elapsed.value = 0
      startedAt = performance.now()
      timer = setInterval(() => {
        elapsed.value = Math.floor((performance.now() - startedAt) / 1000)
      }, 200)
    } catch {
      error.value = '無法存取麥克風，請確認已授權麥克風權限'
      cleanup()
    }
  }

  function stop(): Promise<Recording | null> {
    return new Promise((resolve) => {
      if (!mediaRecorder || !isRecording.value) {
        resolve(null)
        return
      }
      const duration = elapsed.value
      const recorder = mediaRecorder
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunks, { type: mimeType })
        const url = URL.createObjectURL(blob)
        cleanup()
        resolve({ blob, url, duration, mimeType })
      }
      recorder.stop()
      isRecording.value = false
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
    })
  }

  function cancel(): void {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.onstop = null
      try {
        mediaRecorder.stop()
      } catch {
        // ignore
      }
    }
    cleanup()
    isRecording.value = false
    elapsed.value = 0
  }

  onUnmounted(cleanup)

  return {
    isSupported,
    isRecording,
    elapsed,
    elapsedLabel,
    error,
    start,
    stop,
    cancel,
  }
}
