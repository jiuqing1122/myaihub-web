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