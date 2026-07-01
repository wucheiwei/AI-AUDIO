<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '../types'
import { formatDuration } from '../composables/useRecorder'

const props = defineProps<{ message: Message }>()

const isUser = computed(() => props.message.role === 'user')

const time = computed(() =>
  new Date(props.message.createdAt).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
  }),
)
</script>

<template>
  <div class="row" :class="{ user: isUser }">
    <div class="avatar" :class="{ user: isUser }" aria-hidden="true">
      {{ isUser ? '你' : 'AI' }}
    </div>

    <div class="bubble" :class="{ user: isUser }">
      <p v-if="message.kind === 'text'" class="text">{{ message.text }}</p>

      <div v-else class="audio">
        <audio :src="message.audioUrl" controls preload="metadata" />
        <span class="duration">
          🎙️ {{ formatDuration(message.duration) }}
          <template v-if="message.uploadStatus === 'uploading'">· 上傳中…</template>
          <template v-else-if="message.uploadStatus === 'done'">· 已儲存 ✓</template>
        </span>
        <span v-if="message.uploadStatus === 'error'" class="upload-error">
          ⚠️ 上傳失敗：{{ message.uploadError }}
        </span>
      </div>

      <time class="stamp">{{ time }}</time>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  max-width: 100%;
}
.row.user {
  flex-direction: row-reverse;
}

.avatar {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-h);
  background: var(--code-bg);
  border: 1px solid var(--border);
}
.avatar.user {
  color: var(--accent);
  background: var(--accent-bg);
  border-color: var(--accent-border);
}

.bubble {
  position: relative;
  max-width: min(560px, 78%);
  padding: 10px 14px;
  border-radius: 16px;
  background: var(--code-bg);
  border: 1px solid var(--border);
  text-align: left;
}
.bubble.user {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.text {
  font-size: 16px;
  line-height: 150%;
  white-space: pre-wrap;
  word-break: break-word;
  color: inherit;
}
.bubble:not(.user) .text {
  color: var(--text-h);
}

.audio {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.audio audio {
  height: 38px;
  max-width: 260px;
}
.duration {
  font-size: 13px;
  opacity: 0.75;
}
.upload-error {
  font-size: 13px;
  color: #ffd7d7;
}
.bubble:not(.user) .upload-error {
  color: #e5484d;
}

.stamp {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.6;
  text-align: right;
}
</style>
