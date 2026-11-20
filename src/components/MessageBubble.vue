<script setup>
import SourceCard from './SourceCard.vue'

defineProps({
  message: { type: Object, required: true }
})
</script>

<template>
  <div class="msg" :class="message.role">
    <div v-if="message.role === 'user'" class="user-bubble">{{ message.content }}</div>

    <div v-else class="answer">
      <p class="answer-text">
        {{ message.content }}<span v-if="message.state === 'streaming'" class="caret" aria-hidden="true"></span>
      </p>

      <p v-if="message.state === 'streaming' && !message.content" class="hint">正在检索知识库…</p>

      <section v-if="message.sources?.length" class="sources">
        <p class="sources-label">引用来源 · {{ message.sources.length }}</p>
        <SourceCard
          v-for="(source, i) in message.sources"
          :key="i"
          :source="source"
          :index="i + 1"
        />
      </section>
      <p v-else-if="message.sources && message.state !== 'streaming'" class="hint">未找到相关资料</p>

      <p v-if="message.state === 'error'" class="error-line" role="alert">{{ message.error }}</p>
      <p v-if="message.state === 'stopped'" class="hint">已停止生成</p>
    </div>
  </div>
</template>

<style scoped>
.msg.user {
  display: flex;
  justify-content: flex-end;
}

.user-bubble {
  max-width: min(78%, 560px);
  padding: 10px 14px;
  border-radius: 8px 8px 2px 8px;
  background: var(--accent);
  color: #f4f2ec;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.answer {
  max-width: min(88%, 760px);
  padding-left: 16px;
  border-left: 2px solid var(--accent);
}

.answer-text {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.85;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 1.4em;
}

/* 流式光标：细方块，呼吸效果，减少动效时静止 */
.caret {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 2px;
  vertical-align: -0.15em;
  background: var(--accent);
  animation: blink 1s steps(2, start) infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.sources {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}

.sources-label {
  margin: 0 0 2px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.hint {
  margin: 10px 0 0;
  font-size: 12.5px;
  color: var(--muted);
}

.error-line {
  margin: 10px 0 0;
  padding: 8px 12px;
  border: 1px solid #e6c4bb;
  border-radius: 4px;
  background: #f9ece8;
  font-size: 13px;
  color: var(--danger);
}

@media (max-width: 640px) {
  .user-bubble {
    max-width: 88%;
  }

  .answer {
    max-width: 100%;
  }
}
</style>