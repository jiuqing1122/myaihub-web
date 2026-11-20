import { USERS, MOCK_ANSWERS, QA_RECORDS, DOCUMENTS } from './fixtures'

// 开发期 mock 开关；F5 后保留目录但不启用（.env.production 中为 false）
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// 模拟成功响应：延迟后返回 data（形状与 axios 拦截器解包后一致）
export async function mockResolve(data, ms = 300) {
  await sleep(ms)
  return structuredClone(data)
}

// 模拟业务错误：抛出带 code 的 Error，页面统一展示 message
export async function mockReject(code, message, ms = 300) {
  await sleep(ms)
  const err = new Error(message)
  err.code = code
  throw err
}

export { sleep }

/* ============ 认证 ============ */

const TOKEN_PREFIX = 'mock-token-'
// 注册出来的 mock 用户存 localStorage，刷新后 /me 还能认出来
const USER_STORE = 'mock_users'

const readUsers = () => [...USERS, ...JSON.parse(localStorage.getItem(USER_STORE) || '[]')]
const publicUser = ({ password, ...user }) => user
const makeToken = (user) => TOKEN_PREFIX + user.id

function currentUser() {
  const token = localStorage.getItem('token')
  const id = token?.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : ''
  return readUsers().find((u) => u.id === id) || null
}

export function mockLogin({ username, password }) {
  const user = readUsers().find((u) => u.username === username)
  if (!user || user.password !== password) return mockReject(40000, '用户名或密码错误')
  return mockResolve({ token: makeToken(user), user: publicUser(user) })
}

export function mockRegister({ username, password, nickname }) {
  if (readUsers().some((u) => u.username === username)) {
    return mockReject(40900, '用户名已存在')
  }
  const saved = JSON.parse(localStorage.getItem(USER_STORE) || '[]')
  const user = {
    id: String(100 + saved.length),
    username,
    password,
    nickname: nickname || username,
    role: 'USER'
  }
  localStorage.setItem(USER_STORE, JSON.stringify([...saved, user]))
  return mockResolve({ token: makeToken(user), user: publicUser(user) })
}

export function mockMe() {
  const user = currentUser()
  if (!user) return mockReject(40100, '登录已过期，请重新登录')
  return mockResolve(publicUser(user))
}

/* ============ 流式问答 ============ */

const abortError = () => new DOMException('Aborted', 'AbortError')

// 可被 AbortSignal 打断的延迟，保证「停止」立即生效
function abortableSleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(abortError())
      },
      { once: true }
    )
  })
}

// 按 sources → message×N → done 的顺序逐字产出，问句中含「报错」模拟 error 事件
export async function mockChatStream({ question, signal, onSources, onMessage, onDone }) {
  const startedAt = Date.now()
  await abortableSleep(500, signal)

  if (question.includes('报错')) {
    const err = new Error('生成回答失败，请稍后重试')
    err.code = 50001
    throw err
  }

  const hit = MOCK_ANSWERS.find((item) => item.keywords.some((k) => question.includes(k)))
  const sources = structuredClone(hit?.sources || [])
  onSources(sources)

  const answer =
    hit?.answer || '知识库里没有找到与这个问题相关的内容。可以换个问法，或联系管理员补充相关文档。'

  for (let i = 0; i < answer.length; i += 4) {
    await abortableSleep(60 + Math.random() * 60, signal)
    onMessage(answer.slice(i, i + 4))
  }

  // shortcut: 只有完整结束的回答落历史记录；中断/报错的不生成记录（真实后端会落 DISCONNECTED/ERROR）
  addRecord(question, answer, sources, Date.now() - startedAt)
  onDone()
}

/* ============ 问答记录 ============ */

const DELETED_STORE = 'mock_qa_deleted'
const EXTRA_STORE = 'mock_qa_extra'

const deletedIds = () => new Set(JSON.parse(localStorage.getItem(DELETED_STORE) || '[]'))
const readExtras = () => JSON.parse(localStorage.getItem(EXTRA_STORE) || '[]')
const publicRecord = ({ userId, ...record }) => record

function timeText(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
}

function visibleRecords() {
  const deleted = deletedIds()
  return [...readExtras(), ...QA_RECORDS].filter((r) => !deleted.has(r.id))
}

function addRecord(question, answer, sources, latencyMs) {
  const user = currentUser()
  if (!user) return
  const record = {
    id: String(Date.now()),
    userId: user.id,
    question,
    answer,
    status: 'SUCCESS',
    latencyMs: Math.round(latencyMs),
    createTime: timeText(),
    sources: sources.map((s, i) => ({
      docId: s.doc_id,
      sourceFile: s.metadata?.source ?? '',
      page: s.metadata?.page ?? null,
      chunk: s.chunk,
      similarity: s.similarity,
      rank: i + 1
    }))
  }
  localStorage.setItem(EXTRA_STORE, JSON.stringify([record, ...readExtras()]))
}

export function mockQaList({ page = 1, pageSize = 10, keyword = '', status = '', docId = '' } = {}) {
  const user = currentUser()
  if (!user) return mockReject(40100, '登录已过期，请重新登录')

  const kw = String(keyword).trim()
  const list = visibleRecords().filter((r) => {
    if (user.role !== 'ADMIN' && r.userId !== user.id) return false
    if (status && r.status !== status) return false
    if (kw && !r.question.includes(kw) && !r.answer.includes(kw)) return false
    if (docId && !r.sources.some((s) => s.docId === docId)) return false
    return true
  })

  const p = Number(page)
  const size = Number(pageSize)
  const start = (p - 1) * size
  return mockResolve({
    items: list.slice(start, start + size).map(publicRecord),
    total: list.length,
    page: p,
    pageSize: size
  })
}

export function mockQaDetail(id) {
  const user = currentUser()
  if (!user) return mockReject(40100, '登录已过期，请重新登录')

  const record = visibleRecords().find((r) => r.id === String(id))
  if (!record) return mockReject(40400, '记录不存在或已删除')
  if (user.role !== 'ADMIN' && record.userId !== user.id) {
    return mockReject(40300, '无权限查看该记录')
  }
  return mockResolve(publicRecord(record))
}

export function mockQaDelete(id) {
  const user = currentUser()
  if (!user) return mockReject(40100, '登录已过期，请重新登录')

  const record = visibleRecords().find((r) => r.id === String(id))
  if (!record) return mockReject(40400, '记录不存在或已删除')
  if (user.role !== 'ADMIN' && record.userId !== user.id) {
    return mockReject(40300, '无权限删除该记录')
  }

  localStorage.setItem(DELETED_STORE, JSON.stringify([...deletedIds(), record.id]))
  return mockResolve({ deleted: true })
}

/* ============ 文档 ============ */

const UPLOADED_DOCS = 'mock_docs_uploaded'
const DELETED_DOCS = 'mock_docs_deleted'

const readUploadedDocs = () => JSON.parse(localStorage.getItem(UPLOADED_DOCS) || '[]')
const deletedDocs = () => new Set(JSON.parse(localStorage.getItem(DELETED_DOCS) || '[]'))

function visibleDocs() {
  const deleted = deletedDocs()
  return [...readUploadedDocs(), ...DOCUMENTS].filter((d) => !deleted.has(d.docId))
}

export function mockDocList({ page = 1, pageSize = 20, keyword = '' } = {}) {
  const user = currentUser()
  if (!user) return mockReject(40100, '登录已过期，请重新登录')

  const kw = String(keyword).trim()
  const list = visibleDocs().filter((d) => !kw || d.filename.includes(kw))
  const p = Number(page)
  const size = Number(pageSize)
  const start = (p - 1) * size
  return mockResolve(
    { items: list.slice(start, start + size), total: list.length, page: p, pageSize: size },
    250
  )
}

export function mockDocUpload(file = {}) {
  const user = currentUser()
  if (!user) return mockReject(40100, '登录已过期，请重新登录')
  if (user.role !== 'ADMIN') return mockReject(40300, '仅管理员可上传文档')

  const name = file.name || '未命名文档'
  const size = file.size || 0
  const doc = {
    docId: 'u' + Date.now(),
    filename: name,
    originalFilename: name,
    size,
    contentType: file.type || 'application/octet-stream',
    uploadTime: new Date().toISOString().slice(0, 19),
    chunkCount: Math.max(1, Math.ceil(size / 40000)),
    pageCount: Math.max(1, Math.ceil(size / 60000)),
    ext: name.includes('.') ? name.split('.').pop().toLowerCase() : '',
    status: 'ready'
  }
  localStorage.setItem(UPLOADED_DOCS, JSON.stringify([doc, ...readUploadedDocs()]))
  return mockResolve(doc, 700)
}

export function mockDocDelete(docId) {
  const user = currentUser()
  if (!user) return mockReject(40100, '登录已过期，请重新登录')
  if (user.role !== 'ADMIN') return mockReject(40300, '仅管理员可删除文档')

  const id = String(docId)
  const existed = visibleDocs().some((d) => d.docId === id)
  localStorage.setItem(DELETED_DOCS, JSON.stringify([...deletedDocs(), id]))
  return mockResolve({ docId: id, existed })
}