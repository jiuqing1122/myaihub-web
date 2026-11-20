import { defineStore } from 'pinia'
import * as authApi from '../api/auth'

// 登录态：token 持久化在 localStorage，用户信息刷新后由 /api/auth/me 回填
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
    isAdmin: (s) => s.user?.role === 'ADMIN'
  },
  actions: {
    async login(form) {
      const data = await authApi.login(form)
      this.setAuth(data)
      return data
    },
    async register(form) {
      const data = await authApi.register(form)
      this.setAuth(data)
      return data
    },
    async fetchMe() {
      this.user = await authApi.me()
      return this.user
    },
    setAuth({ token, user }) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
    }
  }
})