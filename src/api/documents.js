import { http } from './http'
import { USE_MOCK, mockDocList, mockDocUpload, mockDocDelete } from './mock'

export function listDocuments(params) {
  if (USE_MOCK) return mockDocList(params)
  return http.get('/documents', { params })
}

// multipart 的 Content-Type 由浏览器带 boundary 自动生成，不要手动设置
export function uploadDocument(file) {
  if (USE_MOCK) return mockDocUpload(file)
  const form = new FormData()
  form.append('file', file)
  return http.post('/documents/upload', form)
}

export function deleteDocument(docId) {
  if (USE_MOCK) return mockDocDelete(docId)
  return http.delete(`/documents/${docId}`)
}