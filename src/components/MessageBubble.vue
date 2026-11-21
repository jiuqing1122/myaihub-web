<script setup>
import { computed, ref } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import SourceCard from './SourceCard.vue'
import { renderMarkdown } from '../utils/markdown'

const props = defineProps({
  message: { type: Object, required: true }
})

const rendered = computed(() => renderMarkdown(props.message.content))
// 引用来源默认折叠，按需展开
const showSources = ref(false)
</script>

<template>
  <div class="msg" :class="message.role">
    <div v-if="message.role === 'user'" class="user-bubble">{{ message.content }}</div>

    <div v-else class="answer">
      <div
        class="answer-text"
        :class="{ streaming: message.state === 'streaming' }"
        v-html="rendered"
      ></div>

      <p v-if="message.state === 'streaming' && !message.content" class="hint">正在检索知识库…</p>

      <!-- 回答结束后才出现来源；默认折叠，用户自行展开 -->
      <section
        v-if="message.sources?.length && message.state !== 'streaming'"
        class="sources-block"
      >
        <button
          type="button"
          class="sources-toggle"
          :aria-expanded="showSources"
          :aria-controls="`sources-${message.id}`"
          @click="showSources = !showSources"
        >
          <el-icon class="chevron" :class="{ open: showSources }"><ArrowRight /></el-icon>
          <span>引用来源 · {{ message.sources.length }}</span>
        </button>

        <div v-if="showSources" :id="`sources-${message.id}`" class="sources">
          <SourceCard
            v-for="(source, i) in message.sources"
            :key="i"
            :source="source"
            :index="i + 1"
          />
        </div>
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
  word-break: break-word;
  min-height: 1.4em;
}

.answer-text :deep(p) {
  margin: 0 0 10px;
}

.answer-text :deep(p:last-child) {
  margin-bottom: 0;
}

.answer-text :deep(ul),
.answer-text :deep(ol) {
  margin: 0 0 10px;
  padding-left: 1.4em;
}

.answer-text :deep(li) {
  margin: 2px 0;
}

.answer-text :deep(strong) {
  font-weight: 600;
  color: var(--text);
}

.answer-text :deep(code) {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--accent-tint);
  font-family: var(--mono);
  font-size: 0.9em;
}

/* 流式光标：挂在最后一个块元素末尾，细方块呼吸 */
.answer-text.streaming > :deep(:last-child)::after {
  content: "";
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

.sources-block {
  margin-top: 14px;
}

.sources-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 4px 8px 4px 0;
  border: 0;
  background: none;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  cursor: pointer;
}

.sources-toggle:hover {
  color: var(--accent-ink);
}

.chevron {
  font-size: 11px;
  transition: transform 0.18s ease;
}

.chevron.open {
  transform: rotate(90deg);
}

.sources {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
  animation: sources-in 0.2s ease;
}

@keyframes sources-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
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