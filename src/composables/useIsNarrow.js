import { onBeforeUnmount, ref } from 'vue'

// 窄屏判断：表格隐藏次要列，把信息并进主列（纯 CSS 隐藏会让 el-table 列错位）
export function useIsNarrow(query = '(max-width: 700px)') {
  const mql = window.matchMedia(query)
  const narrow = ref(mql.matches)
  const update = (e) => {
    narrow.value = e.matches
  }
  mql.addEventListener('change', update)
  onBeforeUnmount(() => mql.removeEventListener('change', update))
  return narrow
}