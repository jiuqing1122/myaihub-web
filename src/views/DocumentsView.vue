<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { deleteDocument, listDocuments, uploadDocument } from '../api/documents'
import { useIsNarrow } from '../composables/useIsNarrow'

const auth = useAuthStore()
const narrow = useIsNarrow()

const pageSize = 20
const page = ref(1)
const total = ref(0)
const docs = ref([])
const loading = ref(false)
const uploading = ref(false)

const bytes = (n) => {
  if (n == null) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

const dateText = (s) => (s ? s.replace('T', ' ').slice(0, 16) : '—')

async function fetchList() {
  loading.value = true
  try {
    const data = await listDocuments({ page: page.value, pageSize })
    docs.value = data.items
    total.value = data.total
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

async function doUpload({ file }) {
  uploading.value = true
  try {
    await uploadDocument(file)
    ElMessage.success('上传成功')
    page.value = 1
    await fetchList()
  } catch (err) {
    ElMessage.error(err.message)
  } finally {
    uploading.value = false
  }
}

async function remove(row) {
  try {
    await ElMessageBox.confirm(`删除文档「${row.filename}」？删除后将从知识库移除。`, '删除文档', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  try {
    await deleteDocument(row.docId)
    ElMessage.success('已删除')
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
      <div>
        <h1 class="page-title">文档管理</h1>
        <p class="page-sub">
          共 {{ total }} 份文档
          <template v-if="!auth.isAdmin"> · 只有管理员可以上传或删除文档</template>
        </p>
      </div>

      <el-upload
        v-if="auth.isAdmin"
        action="#"
        accept=".pdf,.doc,.docx,.txt,.md"
        :show-file-list="false"
        :http-request="doUpload"
        :disabled="uploading"
      >
        <el-button type="primary" :loading="uploading">上传文档</el-button>
      </el-upload>
    </header>

    <el-table v-loading="loading" :data="docs" class="data-table documents-table">
      <el-table-column label="文件名" :min-width="narrow ? 200 : 340">
        <template #default="{ row }">
          <div class="file-cell">
            <span class="ext">{{ (row.ext || 'doc').toUpperCase() }}</span>
            <span class="file-name" :title="row.filename">{{ row.filename }}</span>
            <span v-if="narrow" class="file-meta">
              {{ bytes(row.size) }} · {{ row.chunkCount ?? '—' }} 片段 · {{ dateText(row.uploadTime) }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column v-if="!narrow" label="大小" width="100" align="right">
        <template #default="{ row }">{{ bytes(row.size) }}</template>
      </el-table-column>

      <el-table-column v-if="!narrow" label="片段" width="90" align="right">
        <template #default="{ row }">{{ row.chunkCount ?? '—' }}</template>
      </el-table-column>

      <el-table-column v-if="!narrow" label="上传时间" width="160">
        <template #default="{ row }">{{ dateText(row.uploadTime) }}</template>
      </el-table-column>

      <el-table-column v-if="auth.isAdmin" label="操作" width="90" align="right">
        <template #default="{ row }">
          <el-button link type="danger" @click.stop="remove(row)">删除</el-button>
        </template>
      </el-table-column>

      <template #empty>
        <p class="table-empty">
          知识库还没有文档。<template v-if="auth.isAdmin">点击右上角「上传文档」开始。</template>
        </p>
      </template>
    </el-table>

    <div v-if="total > pageSize" class="pager">
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
</template>

<style scoped>
.documents-table :deep(.el-table__row) {
  cursor: default;
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.ext {
  flex: 0 0 auto;
  padding: 0 5px;
  border: 1px solid var(--line-strong);
  border-radius: 2px;
  font-family: var(--mono);
  font-size: 10px;
  line-height: 16px;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text);
}

.file-meta {
  flex-basis: 100%;
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

.page-head {
  align-items: flex-start;
}

@media (max-width: 700px) {
  .file-cell {
    flex-wrap: wrap;
    gap: 2px 8px;
  }
}
</style>