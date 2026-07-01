<script setup lang="ts">
import { nextTick, ref } from 'vue'
import ChatComposer from './components/ChatComposer.vue'
import MessageBubble from './components/MessageBubble.vue'
import type { Message } from './types'
import { formatDuration, type Recording } from './composables/useRecorder'

const messages = ref<Message[]>([])
const isThinking = ref(false)
const scroller = ref<HTMLElement | null>(null)

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function scrollToBottom() {
  await nextTick()
  const el = scroller.value
  if (el) el.scrollTop = el.scrollHeight
}

function pushMessage(message: Message) {
  messages.value.push(message)
  scrollToBottom()
}

/**
 * 產生 AI 回覆。目前為前端 mock，之後可替換成呼叫後端 /chat API。
 */
async function replyFromAgent(prompt: string) {
  isThinking.value = true
  await scrollToBottom()
  // 模擬思考 / 串流延遲
  await new Promise((resolve) => setTimeout(resolve, 700 + Math.random() * 600))
  isThinking.value = false
  pushMessage({
    id: newId(),
    role: 'assistant',
    kind: 'text',
    text: prompt,
    createdAt: Date.now(),
  })
}

function handleSendText(text: string) {
  pushMessage({
    id: newId(),
    role: 'user',
    kind: 'text',
    text,
    createdAt: Date.now(),
  })
  replyFromAgent(`（示範回覆）我收到你的訊息了：「${text}」\n之後這裡會接上真正的 AI agent。`)
}

function handleSendAudio(recording: Recording) {
  pushMessage({
    id: newId(),
    role: 'user',
    kind: 'audio',
    audioUrl: recording.url,
    duration: recording.duration,
    createdAt: Date.now(),
  })
  replyFromAgent(
    `（示範回覆）已收到你的語音訊息（長度 ${formatDuration(recording.duration)}）。\n之後會送去做語音辨識並交給 AI 處理。`,
  )
}
</script>

<template>
  <div class="chat">
    <header class="header">
      <div class="brand">
        <span class="logo" aria-hidden="true">🎧</span>
        <div>
          <h1>AI Audio 助理</h1>
          <p class="sub">支援文字與語音輸入的 AI 聊天</p>
        </div>
      </div>
      <span class="status">
        <span class="dot" aria-hidden="true" />
        線上
      </span>
    </header>

    <main ref="scroller" class="messages">
      <div v-if="messages.length === 0" class="empty">
        <span class="empty-icon" aria-hidden="true">💬</span>
        <h2>開始跟 AI 對話</h2>
        <p>輸入文字或點選麥克風錄下你的問題。</p>
      </div>

      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />

      <div v-if="isThinking" class="row typing">
        <div class="avatar" aria-hidden="true">AI</div>
        <div class="dots" aria-label="AI 輸入中">
          <span /><span /><span />
        </div>
      </div>
    </main>

    <ChatComposer @send-text="handleSendText" @send-audio="handleSendAudio" />
  </div>
</template>

<style scoped>
.chat {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  height: 100svh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border-inline: 1px solid var(--border);
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}
.logo {
  font-size: 26px;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--accent-bg);
  border: 1px solid var(--accent-border);
}
.header h1 {
  font-size: 19px;
  margin: 0;
  letter-spacing: -0.2px;
}
.sub {
  font-size: 13px;
  opacity: 0.75;
}
.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text);
}
.status .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #30a46c;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
}

.empty {
  margin: auto;
  text-align: center;
  opacity: 0.85;
}
.empty-icon {
  font-size: 40px;
}
.empty h2 {
  margin: 12px 0 4px;
}
.empty p {
  font-size: 15px;
}

.typing {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}
.typing .avatar {
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
.dots {
  display: inline-flex;
  gap: 5px;
  padding: 14px 16px;
  border-radius: 16px;
  background: var(--code-bg);
  border: 1px solid var(--border);
}
.dots span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text);
  opacity: 0.5;
  animation: blink 1.2s infinite ease-in-out;
}
.dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.dots span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes blink {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
</style>
