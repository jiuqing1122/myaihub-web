import axios from 'axios'

// 统一走 Vite 代理 /api；token 注入与 40100 处理在 F1 的拦截器中补全
export const http = axios.create({
  baseURL: '/api',
  timeout: 20000
})