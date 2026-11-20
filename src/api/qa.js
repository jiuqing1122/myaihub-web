import { http } from './http'
import { USE_MOCK, mockQaList, mockQaDetail, mockQaDelete } from './mock'

// 历史记录：列表支持 page/pageSize/keyword/status/docId 过滤
export function listRecords(params) {
  if (USE_MOCK) return mockQaList(params)
  return http.get('/qa-records', { params })
}

export function getRecord(id) {
  if (USE_MOCK) return mockQaDetail(id)
  return http.get(`/qa-records/${id}`)
}

export function deleteRecord(id) {
  if (USE_MOCK) return mockQaDelete(id)
  return http.delete(`/qa-records/${id}`)
}