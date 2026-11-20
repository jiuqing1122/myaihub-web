import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
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

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 守卫：无 token 去登录页；有 token 不进登录/注册页；刷新后回填用户信息
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.token) {
    return to.meta.public ? true : { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.public) return '/chat'

  if (!auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      auth.logout()
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }
})

// 浏览器标签页标题跟随路由，方便多标签时辨认
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · MyAIHub` : 'MyAIHub 知识库问答'
})

export default router