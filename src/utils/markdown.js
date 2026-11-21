import { marked } from 'marked'
import DOMPurify from 'dompurify'

// 后端回答常带 Markdown（列表、加粗）；先净化再进 v-html（第 7 章安全约束）
export function renderMarkdown(text) {
  if (!text) return ''
  return DOMPurify.sanitize(marked.parse(text, { breaks: true }))
}