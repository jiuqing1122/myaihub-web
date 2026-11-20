import axios from 'axios'

// 统一走 Vite 代理 /api；响应拦截器解包 {code,message,data}，失败时抛出带 code 的 Error
export const http = axios.create({
  baseURL: '/api',
  timeout: 20000
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body && body.code === 200) return body.data
    return rejectWith(res)
  },
  (err) => rejectWith(err.response)
)

function rejectWith(res) {
  const body = res?.data
  const code = body?.code ?? res?.status ?? 0
  const message =
    body?.message ||
    (res ? `请求失败（${res.status}）` : '网络异常，请确认后端服务已启动')

  if (code === 40100 || res?.status === 401) handleUnauthorized()

  const error = new Error(message)
  error.code = code
  return Promise.reject(error)
}

// 仅在已登录状态收到 401 时清 token 并回登录页；登录页输错密码不会触发
function handleUnauthorized() {
  if (!localStorage.getItem('token')) return
  localStorage.removeItem('token')
  window.location.assign('/login')
}