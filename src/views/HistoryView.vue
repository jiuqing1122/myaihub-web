<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteRecord, getRecord, listRecords } from '../api/qa'
import SourceCard from '../components/SourceCard.vue'
import { useIsNarrow } from '../composables/useIsNarrow'

const narrow = useIsNarrow()

const STATUS = {
  SUCCESS: { text: '成功', cls: 'success' },
  ERROR: { text: '失败', cls: 'error' },
  DISCONNECTED: { text: '断开', cls: 'disconnected' }
}

const pageSize = 10
const page = ref(1)
const total = ref(0)
const records = ref([])
const loading = ref(false)
const filters = reactive({ keyword: '', status: '', docId: '' })
const drawer = reactive({ open: false, loading: false, record: null })

const seconds = (ms) => (ms == null ? '—' : `${(ms / 1000).toFixed(1)}s`)

async function fetchList() {
  loading.value = true
  try {
    const data = await listRecords({
      page: page.value,
      pageSize,
      keyword: filters.keyword.trim(),
      status: filters.status,
      docId: filters.docId.trim()
    })
    records.value = data.items
    total.value = data.total

    // 删掉最后一页的最后一条后回退一页
    if (!data.items.length && page.value > 1) {
      page.value -= 1
      await fetchList()
    }
  } catch (err) {
    ElMessage.error(err.message)
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  fetchList()
}

function reset() {
  filters.keyword = ''
  filters.status = ''
  filters.docId = ''
  search()
}

async function openDetail(row) {
  drawer.open = true
  drawer.loading = true
  drawer.record = null
  try {
    drawer.record = await getRecord(row.id)
  } catch (err) {
    drawer.open = false
    ElMessage.error(err.message)
  } finally {
    drawer.loading = false
  }
}

// 列表已按本人可见范围过滤（USER 仅本人），所以可见记录都可删除
async function remove(row) {
  try {
    await ElMessageBox.confirm(`删除记录「${row.question}」？删除后不可恢复。`, '删除记录', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  try {
    await deleteRecord(row.id)
    ElMessage.success('已删除')
    if (drawer.record?.id === row.id) drawer.open = false
    fetchList()
  } catch (err) {
    ElMessage.error(err.message)
  }
}

onMounted(fetchList)
</script>

<template>
  <div class="page">
    <header class="page-head">
      <h1 class="page-title">历史记录</h1>
      <span class="page-desc">共 {{ total }} 条 · 点击行查看来源</span>
    </header>

    <div class="filters">
      <el-input
        v-model="filters.keyword"
        placeholder="搜索问题或回答"
        clearable
        class="f-keyword"
        @keyup.enter="search"
      />
      <el-select v-model="filters.status" placeholder="全部状态" clearable class="f-status">
        <el-option v-for="(item, key) in STATUS" :key="key" :label="item.text" :value="key" />
      </el-select>
      <el-input
        v-model="filters.docId"
        placeholder="文档 ID"
        clearable
        class="f-doc"
        @keyup.enter="search"
      />
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="records"
      class="records-table"
      @row-click="openDetail"
    >
      <el-table-column label="问题" :min-width="narrow ? 160 : 300" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="question-cell">
            <span class="question-text">{{ row.question }}</span>
            <span v-if="narrow" class="question-meta">
              {{ row.createTime }} · {{ row.sources?.length ?? 0 }} 来源
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" :width="narrow ? 76 : 96">
        <template #default="{ row }">
          <span class="state" :class="STATUS[row.status]?.cls">{{ STATUS[row.status]?.text || row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="!narrow" label="来源" width="72" align="right">
        <template #default="{ row }">{{ row.sources?.length ?? 0 }}</template>
      </el-table-column>
      <el-table-column v-if="!narrow" label="耗时" width="88" align="right">
        <template #default="{ row }">{{ seconds(row.latencyMs) }}</template>
      </el-table-column>
      <el-table-column v-if="!narrow" label="时间" prop="createTime" width="170" />
      <el-table-column label="操作" :width="narrow ? 100 : 120" align="right">
        <template #default="{ row }">
          <el-button link type="primary" @click.stop="openDetail(row)">查看</el-button>
          <el-button link type="danger" @click.stop="remove(row)">删除</el-button>
        </template>
      </el-table-column>

      <template #empty>
        <p class="table-empty">没有符合条件的记录。<router-link to="/chat">去提问</router-link></p>
      </template>
    </el-table>

    <div class="pager">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        background
        @current-change="fetchList"
      />
    </div>
  </div>

  <el-drawer
    v-model="drawer.open"
    title="记录详情"
    size="min(520px, 100%)"
    append-to-body
    class="record-drawer"
  >
    <div v-loading="drawer.loading" class="drawer-body">
      <template v-if="drawer.record">
        <div class="detail-meta">
          <span class="state" :class="STATUS[drawer.record.status]?.cls">
            {{ STATUS[drawer.record.status]?.text || drawer.record.status }}
          </span>
          <span>{{ drawer.record.createTime }}</span>
          <span>耗时 {{ seconds(drawer.record.latencyMs) }}</span>
        </div>

        <h2 class="detail-question">{{ drawer.record.question }}</h2>
        <p class="detail-answer">{{ drawer.record.answer || '（无回答）' }}</p>

        <section v-if="drawer.record.sources?.length" class="detail-sources">
          <p class="sources-label">引用来源 · {{ drawer.record.sources.length }}</p>
          <SourceCard
            v-for="(source, i) in drawer.record.sources"
            :key="i"
            :source="source"
            :index="i + 1"
          />
        </section>
        <p v-else class="detail-empty">这条记录没有引用来源。</p>
      </template>
    </div>
  </el-drawer>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.f-keyword {
  width: 240px;
}

.f-status {
  width: 140px;
}

.f-doc {
  width: 160px;
}

/* ---------- 表格 ---------- */
.records-table {
  --el-table-border-color: var(--line);
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: transparent;
  --el-table-row-hover-bg-color: #f2f0e8;
  font-size: 13px;
}

.records-table :deep(th.el-table__cell) {
  padding: 8px 0;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: var(--muted);
  background: transparent;
}

.records-table :deep(td.el-table__cell) {
  padding: 11px 0;
  color: var(--text-2);
}

.records-table :deep(.el-table__row) {
  cursor: pointer;
}

.records-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

/* 链接按钮去掉默认内边距，窄列里「查看 / 删除」能并排 */
.records-table :deep(.el-button.is-link) {
  height: auto;
  padding: 0;
}

.records-table :deep(.el-button + .el-button) {
  margin-left: 10px;
}

/* 状态胶囊 */
.state {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 3px;
  font-family: var(--mono);
  font-size: 11px;
}

.state.success {
  background: var(--accent-tint);
  color: var(--accent-ink);
}

.state.error {
  background: #f6e6e2;
  color: var(--danger);
}

.state.disconnected {
  background: #eeece5;
  color: var(--muted);
}

.question-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.question-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.question-meta {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--muted);
}

.table-empty {
  margin: 0;
  padding: 12px 0;
  color: var(--muted);
  font-size: 13px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* ---------- 详情抽屉 ---------- */
.drawer-body {
  min-height: 160px;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
}

.detail-question {
  margin: 18px 0 12px;
  font-family: var(--serif);
  font-size: 21px;
  font-weight: 600;
  line-height: 1.5;
}

.detail-answer {
  margin: 0;
  font-size: 14px;
  line-height: 1.9;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-word;
}

.detail-sources {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.sources-label {
  margin: 0 0 2px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.detail-empty {
  margin: 20px 0 0;
  font-size: 13px;
  color: var(--muted);
}

@media (max-width: 640px) {
  .f-keyword,
  .f-status,
  .f-doc {
    width: calc(50% - 5px);
  }

  .pager {
    justify-content: center;
  }
}
</style>