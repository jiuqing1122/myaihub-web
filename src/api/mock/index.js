import { USERS } from './fixtures'

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