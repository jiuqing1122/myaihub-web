import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'

// 页面按需加载；布局内页面共用 AppLayout（侧边导航 + 状态条）
const routes = [
  {
    path: '/login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/register',
    component: () => import('../views/RegisterView.vue'),
    meta: { title: '注册', public: true }
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', redirect: '/chat' },
      { path: 'chat', component: () => import('../views/ChatView.vue'), meta: { title: '问答' } },
      { path: 'history', component: () => import('../views/HistoryView.vue'), meta: { title: '历史记录' } },
      { path: 'documents', component: () => import('../views/DocumentsView.vue'), meta: { title: '文档管理' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/chat' }
]

export default createRouter({
  history: createWebHistory(),
  routes
})