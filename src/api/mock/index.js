import { USERS, MOCK_ANSWERS } from './fixtures'

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

export function mockMe(token) {
  const id = token?.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : ''
  const user = readUsers().find((u) => u.id === id)
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
  await abortableSleep(500, signal)

  if (question.includes('报错')) {
    const err = new Error('生成回答失败，请稍后重试')
    err.code = 50001
    throw err
  }

  const hit = MOCK_ANSWERS.find((item) => item.keywords.some((k) => question.includes(k)))
  onSources(structuredClone(hit?.sources || []))

  const answer =
    hit?.answer || '知识库里没有找到与这个问题相关的内容。可以换个问法，或联系管理员补充相关文档。'

  for (let i = 0; i < answer.length; i += 4) {
    await abortableSleep(60 + Math.random() * 60, signal)
    onMessage(answer.slice(i, i + 4))
  }
  onDone()
}