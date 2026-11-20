import { fetchEventSource } from '@microsoft/fetch-event-source'
import { USE_MOCK, mockChatStream } from './mock'
import { onUnauthorized } from './http'

// 流式问答：sources → message×N → done；error 事件以异常抛出，停止靠 AbortController
export function streamChat({ question, signal, onSources, onMessage, onDone }) {
  if (USE_MOCK) return mockChatStream({ question, signal, onSources, onMessage, onDone })

  return fetchEventSource('/api/rag/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    },
    body: JSON.stringify({ question }),
    signal,
    openWhenHidden: true,
    onopen(res) {
      if (res.status === 401) {
        onUnauthorized()
        throw new Error('登录已过期，请重新登录')
      }
      if (!res.ok) throw new Error(`连接失败（${res.status}）`)
    },
    onmessage(ev) {
      let data
      try {
        data = JSON.parse(ev.data)
      } catch {
        return
      }
      const type = ev.event || data.type
      if (type === 'sources') onSources(data.sources || [])
      else if (type === 'message') onMessage(data.content || '')
      else if (type === 'done') onDone()
      else if (type === 'error') {
        const err = new Error(data.message || '生成回答失败')
        err.code = data.code
        throw err
      }
    },
    onerror(err) {
      throw err // 禁止自动重连，避免重复提问、重复落库
    }
  })
}