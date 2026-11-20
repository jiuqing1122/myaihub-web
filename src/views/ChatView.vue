<script setup>
import { nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import { streamChat } from '../api/rag'
import MessageBubble from '../components/MessageBubble.vue'

const suggestions = ['员工年假有几天？', '报销流程是什么？', '信息安全培训怎么参加？']

// shortcut: 会话只存在组件内，切到其他页再回来会清空；需要跨页保留时迁到 Pinia chat store
const messages = ref([])
const input = ref('')
const streaming = ref(false)
const scroller = ref(null)
let controller = null
let seq = 0

function isNearBottom() {
  const el = scroller.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < 96
}

function stickToBottom() {
  nextTick(() => {
    const el = scroller.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

async function send(text) {
  const question = (text ?? input.value).trim()
  if (!question || streaming.value) return
  input.value = ''

  messages.value.push({ id: ++seq, role: 'user', content: question })
  const assistant = reactive({
    id: ++seq,
    role: 'assistant',
    content: '',
    sources: undefined,
    state: 'streaming',
    error: ''
  })
  messages.value.push(assistant)

  streaming.value = true
  const ctrl = new AbortController()
  controller = ctrl
  stickToBottom()

  try {
    await streamChat({
      question,
      signal: ctrl.signal,
      onSources: (sources) => {
        assistant.sources = sources
        stickToBottom()
      },
      onMessage: (chunk) => {
        const stick = isNearBottom()
        assistant.content += chunk
        if (stick) stickToBottom()
      },
      onDone: () => {
        assistant.state = 'done'
        stickToBottom()
      }
    })
    if (assistant.state === 'streaming') assistant.state = 'done'
  } catch (err) {
    if (ctrl.signal.aborted) {
      assistant.state = 'stopped'
    } else {
      assistant.state = 'error'
      assistant.error = err.message || '生成回答失败'
    }
  } finally {
    streaming.value = false
    if (controller === ctrl) controller = null
    stickToBottom()
  }
}

function stop() {
  controller?.abort()
}

// Enter 发送，Shift + Enter 换行；输入法组合中不拦截
function onKeydown(e) {
  if (e.key !== 'Enter' || e.isComposing || e.shiftKey) return
  e.preventDefault()
  send()
}

onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <div class="chat">
    <div ref="scroller" class="chat-scroll">
      <div class="chat-inner">
        <div v-if="!messages.length" class="empty">
          <p class="eyebrow">混合检索 · 重排序 · 引用溯源</p>
          <h1>把问题交给知识库。</h1>
          <p class="lede">答案会附上出处，可以逐条核对。</p>
          <div class="suggestions">
            <button
              v-for="q in suggestions"
              :key="q"
              type="button"
              class="suggestion"
              @click="send(q)"
            >
              {{ q }}
            </button>
          </div>
        </div>

        <div v-else class="messages">
          <MessageBubble v-for="m in messages" :key="m.id" :message="m" />
        </div>
      </div>
    </div>

    <footer class="composer">
      <div class="composer-inner">
        <el-input
          v-model="input"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 5 }"
          resize="none"
          placeholder="输入问题…"
          aria-label="输入问题"
          @keydown="onKeydown"
        />
        <el-button v-if="streaming" type="danger" plain class="action" @click="stop">停止</el-button>
        <el-button v-else type="primary" class="action" :disabled="!input.trim()" @click="send()">
          发送
        </el-button>
      </div>
      <p class="composer-hint">Enter 发送 · Shift + Enter 换行 · 回答仅供参考，请核对引用原文</p>
    </footer>
  </div>
</template>

<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.chat-scroll {
  flex: 1;
  overflow-y: auto;
}

.chat-inner {
  max-width: 820px;
  margin: 0 auto;
  padding: 32px 32px 28px;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ---------- 空态 ---------- */
.empty {
  max-width: 560px;
  margin: 0 auto;
  padding-top: clamp(24px, 9vh, 88px);
}

.eyebrow {
  margin: 0 0 14px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--accent);
}

.empty h1 {
  margin: 0 0 10px;
  font-family: var(--serif);
  font-size: clamp(26px, 3vw, 34px);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.lede {
  margin: 0 0 26px;
  color: var(--muted);
  font-size: 13.5px;
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion {
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: var(--paper-raised);
  color: var(--text-2);
  font-family: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.suggestion::before {
  content: "→ ";
  color: var(--accent);
}

.suggestion:hover {
  border-color: var(--accent);
  color: var(--text);
}

/* ---------- 输入区 ---------- */
.composer {
  border-top: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.65);
  padding: 14px 32px 12px;
}

.composer-inner {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  max-width: 820px;
  margin: 0 auto;
}

.composer-inner .el-input {
  flex: 1;
}

.composer-inner :deep(.el-textarea__inner) {
  padding: 8px 12px;
  line-height: 1.7;
  box-shadow: 0 0 0 1px var(--line-strong) inset;
}

.action {
  flex: 0 0 auto;
  height: 36px;
  padding: 0 18px;
}

.composer-hint {
  max-width: 820px;
  margin: 8px auto 0;
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--muted);
}

@media (max-width: 640px) {
  .chat-inner {
    padding: 20px 16px;
  }

  .composer {
    padding: 10px 16px 8px;
  }

  .composer-hint {
    display: none;
  }

  .messages {
    gap: 22px;
  }
}
</style>