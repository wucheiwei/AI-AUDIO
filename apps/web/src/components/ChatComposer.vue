<script setup lang="ts">
import { ref } from 'vue'
import { useRecorder, type Recording } from '../composables/useRecorder'

const emit = defineEmits<{
  (e: 'send-text', text: string): void
  (e: 'send-audio', recording: Recording): void
}>()

const props = defineProps<{ disabled?: boolean }>()

const draft = ref('')
const {
  isSupported,
  isRecording,
  elapsedLabel,
  error,
  start,
  stop,
  cancel,
} = useRecorder()

function sendText() {
  const text = draft.value.trim()
  if (!text || props.disabled) return
  emit('send-text', text)
  draft.value = ''
}

function onEnter(event: KeyboardEvent) {
  // Enter 送出、Shift+Enter 換行
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendText()
  }
}

async function toggleRecording() {
  if (isRecording.value) {
    const recording = await stop()
    if (recording && recording.duration > 0) {
      emit('send-audio', recording)
    }
  } else {
    await start()
  }
}
</script>

<template>
  <div class="composer">
    <p v-if="error" class="hint error">{{ error }}</p>

    <!-- 錄音中的狀態列 -->
    <div v-if="isRecording" class="recording-bar">
      <span class="pulse" aria-hidden="true" />
      <span class="rec-label">錄音中</span>
      <span class="rec-time">{{ elapsedLabel }}</span>
      <div class="rec-actions">
        <button type="button" class="ghost" @click="cancel">取消</button>
        <button type="button" class="send" @click="toggleRecording">
          送出語音
        </button>
      </div>
    </div>

    <!-- 一般輸入列 -->
    <div v-else class="input-bar">
      <button
        type="button"
        class="mic"
        :disabled="!isSupported || disabled"
        :title="isSupported ? '按住錄音' : '此瀏覽器不支援錄音'"
        aria-label="開始錄音"
        @click="toggleRecording"
      >
        🎙️
      </button>

      <textarea
        v-model="draft"
        class="field"
        rows="1"
        placeholder="輸入訊息，或點麥克風錄音…"
        :disabled="disabled"
        @keydown="onEnter"
      />

      <button
        type="button"
        class="send"
        :disabled="!draft.trim() || disabled"
        aria-label="送出"
        @click="sendText"
      >
        送出
      </button>
    </div>
  </div>
</template>

<style scoped>
.composer {
  border-top: 1px solid var(--border);
  padding: 14px 20px calc(14px + env(safe-area-inset-bottom, 0px));
  background: var(--bg);
}

.hint {
  margin: 0 0 8px;
  font-size: 13px;
}
.hint.error {
  color: #e5484d;
}

.input-bar {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.field {
  flex: 1;
  resize: none;
  max-height: 140px;
  min-height: 44px;
  padding: 11px 14px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--code-bg);
  color: var(--text-h);
  font: inherit;
  font-size: 16px;
  line-height: 140%;
  outline: none;
  box-sizing: border-box;
  field-sizing: content;
}
.field:focus-visible {
  border-color: var(--accent-border);
}
.field::placeholder {
  color: var(--text);
  opacity: 0.7;
}

.mic,
.send,
.ghost {
  flex: 0 0 auto;
  height: 44px;
  border-radius: 14px;
  border: 1px solid transparent;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
  transition:
    background 0.2s,
    opacity 0.2s,
    box-shadow 0.2s;
}

.mic {
  width: 44px;
  font-size: 20px;
  background: var(--code-bg);
  border-color: var(--border);
}
.mic:hover:not(:disabled) {
  box-shadow: var(--shadow);
}

.send {
  padding: 0 18px;
  color: #fff;
  background: var(--accent);
}
.send:hover:not(:disabled) {
  box-shadow: var(--shadow);
}

.ghost {
  padding: 0 16px;
  background: transparent;
  border-color: var(--border);
  color: var(--text-h);
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.recording-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 14px;
  background: var(--accent-bg);
  border: 1px solid var(--accent-border);
}
.rec-label {
  color: var(--accent);
  font-weight: 600;
}
.rec-time {
  font-variant-numeric: tabular-nums;
  color: var(--text-h);
}
.rec-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.pulse {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e5484d;
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.75);
  }
}
</style>
