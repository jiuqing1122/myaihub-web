import { http } from './http'
import { USE_MOCK, mockLogin, mockRegister, mockMe } from './mock'

export function login(payload) {
  if (USE_MOCK) return mockLogin(payload)
  return http.post('/auth/login', payload)
}

export function register(payload) {
  if (USE_MOCK) return mockRegister(payload)
  return http.post('/auth/register', payload)
}

export function me() {
  if (USE_MOCK) return mockMe(localStorage.getItem('token'))
  return http.get('/auth/me')
}