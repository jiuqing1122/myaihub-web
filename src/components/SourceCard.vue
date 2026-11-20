<script setup>
import { computed } from 'vue'

const props = defineProps({
  source: { type: Object, required: true },
  index: { type: Number, required: true }
})

// 实时问答是 snake_case，历史记录是 camelCase，这里统一归一化
const item = computed(() => {
  const s = props.source || {}
  const meta = s.metadata || {}
  return {
    file: s.sourceFile ?? meta.source ?? '未知文档',
    page: s.page ?? meta.page ?? null,
    similarity: s.similarity ?? null,
    chunk: s.chunk ?? ''
  }
})

const similarityText = computed(() =>
  item.value.similarity == null ? '—' : `${Math.round(item.value.similarity * 100)}%`
)
</script>

<template>
  <article class="source-card">
    <header class="source-head">
      <span class="rank">{{ index }}</span>
      <div class="source-meta">
        <span class="file">{{ item.file }}</span>
        <span class="sub">
          <template v-if="item.page !== null">第 {{ item.page }} 页 · </template>
          相似度 {{ similarityText }}
        </span>
      </div>
    </header>

    <div v-if="item.similarity != null" class="meter" aria-hidden="true">
      <span :style="{ width: similarityText }"></span>
    </div>

    <p class="chunk" :title="item.chunk">{{ item.chunk }}</p>
  </article>
</template>

<style scoped>
.source-card {
  position: relative;
  padding: 10px 12px 10px 14px;
  border: 1px solid var(--line);
  border-left: 2px solid var(--accent);
  border-radius: 0 4px 4px 0;
  background: var(--paper-raised);
}

.source-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.rank {
  flex: 0 0 auto;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--accent);
}

.source-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  min-width: 0;
}

.file {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
}

.meter {
  height: 2px;
  margin: 8px 0 7px;
  background: var(--line);
  overflow: hidden;
}

.meter span {
  display: block;
  height: 100%;
  background: var(--accent);
}

.chunk {
  margin: 6px 0 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--text-2);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>