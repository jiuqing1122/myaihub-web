<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChatDotRound, Clock, FolderOpened, Fold, Expand, SwitchButton } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import { USE_MOCK } from '../api/mock'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const collapsed = ref(false)

const navs = [
  { path: '/chat', label: '问答', icon: ChatDotRound },
  { path: '/history', label: '历史记录', icon: Clock },
  { path: '/documents', label: '文档管理', icon: FolderOpened }
]

const initial = computed(() => (auth.user?.nickname || auth.user?.username || '?').slice(0, 1))
const roleText = computed(() => ({ ADMIN: '管理员', USER: '普通用户' })[auth.user?.role] || '未登录')

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="shell" :class="{ collapsed }">
    <aside class="sidebar">
      <div class="brand">
        <router-link to="/chat" class="brand-mark" aria-label="返回问答">M</router-link>
        <div class="brand-text">
          <span class="brand-name">MyAIHub</span>
          <span class="brand-sub">知识库问答</span>
        </div>
        <button
          class="icon-btn collapse-btn"
          :title="collapsed ? '展开导航' : '折叠导航'"
          :aria-label="collapsed ? '展开导航' : '折叠导航'"
          @click="collapsed = !collapsed"
        >
          <el-icon><Expand v-if="collapsed" /><Fold v-else /></el-icon>
        </button>
      </div>

      <nav class="nav" aria-label="主导航">
        <router-link
          v-for="item in navs"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :title="collapsed ? item.label : undefined"
          :aria-label="item.label"
        >
          <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="user">
        <span class="avatar" aria-hidden="true">{{ initial }}</span>
        <div class="user-text">
          <span class="user-name">{{ auth.user?.nickname || '未登录' }}</span>
          <span class="user-role">{{ roleText }}</span>
        </div>
        <button class="icon-btn logout-btn" title="退出登录" aria-label="退出登录" @click="logout">
          <el-icon><SwitchButton /></el-icon>
        </button>
      </div>
    </aside>

    <div class="main">
      <header class="statusbar">
        <span class="crumb">{{ route.meta.title }}</span>
        <span class="readout">
          <span class="env" :class="{ mock: USE_MOCK }">{{ USE_MOCK ? 'MOCK' : 'API' }}</span>
          <span>{{ auth.user?.username || 'anonymous' }}</span>
          <span class="sep">/</span>
          <span>{{ roleText }}</span>
        </span>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  min-height: 100%;
}

/* ---------- 侧边栏 ---------- */
.sidebar {
  display: flex;
  flex-direction: column;
  flex: 0 0 232px;
  width: 232px;
  padding: 18px 14px;
  background: var(--ink);
  color: #e9e7e0;
  transition: width 0.18s ease, flex-basis 0.18s ease;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 4px 18px;
  border-bottom: 1px solid rgba(247, 246, 241, 0.1);
}

.brand-mark {
  display: grid;
  place-items: center;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  border: 1px solid rgba(247, 246, 241, 0.35);
  border-radius: 4px;
  font-family: var(--serif);
  font-size: 16px;
  color: #f3f1ea;
}

.brand-mark:hover {
  border-color: rgba(247, 246, 241, 0.7);
  color: #fff;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  min-width: 0;
}

.brand-name {
  font-family: var(--serif);
  font-size: 16px;
  letter-spacing: 0.04em;
}

.brand-sub {
  font-size: 11px;
  color: rgba(247, 246, 241, 0.45);
  letter-spacing: 0.08em;
}

.icon-btn {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin-left: auto;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: rgba(247, 246, 241, 0.55);
  cursor: pointer;
}

.icon-btn:hover {
  background: rgba(247, 246, 241, 0.08);
  color: #f3f1ea;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-left: 2px solid transparent;
  border-radius: 0 4px 4px 0;
  color: rgba(247, 246, 241, 0.62);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
}

.nav-item:hover {
  background: rgba(247, 246, 241, 0.06);
  color: #f3f1ea;
}

.nav-item.router-link-active {
  border-left-color: #9fc0b5;
  background: rgba(159, 192, 181, 0.1);
  color: #f3f1ea;
}

.nav-icon {
  flex: 0 0 auto;
  font-size: 16px;
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding: 14px 6px 2px;
  border-top: 1px solid rgba(247, 246, 241, 0.1);
}

.avatar {
  display: grid;
  place-items: center;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--accent);
  color: #f3f1ea;
  font-size: 13px;
}

.user-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.3;
}

.user-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: rgba(247, 246, 241, 0.42);
}

/* ---------- 折叠态 ---------- */
.collapsed .sidebar {
  flex-basis: 68px;
  width: 68px;
  padding-left: 10px;
  padding-right: 10px;
}

.collapsed .brand {
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
}

.collapsed .brand-text,
.collapsed .nav-label,
.collapsed .user-text {
  display: none;
}

.collapsed .collapse-btn {
  margin-left: 0;
}

.collapsed .nav-item {
  justify-content: center;
  padding: 10px 0;
}

.collapsed .user {
  justify-content: center;
  padding: 14px 0 2px;
}

.collapsed .logout-btn {
  display: none;
}

/* ---------- 主区域 ---------- */
.main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 32px;
  border-bottom: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.55);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.crumb::before {
  content: "§ ";
  color: var(--accent);
}

.readout {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.env {
  padding: 1px 6px;
  border: 1px solid var(--line-strong);
  border-radius: 3px;
  color: var(--muted);
}

.env.mock {
  border-color: #b4d1c9;
  background: var(--accent-tint);
  color: var(--accent-ink);
}

.sep {
  color: var(--line-strong);
}

.content {
  flex: 1;
  min-width: 0;
}

/* ---------- 窄屏：侧栏变顶栏，导航横向排列 ---------- */
@media (max-width: 880px) {
  .shell {
    flex-direction: column;
  }

  .sidebar,
  .collapsed .sidebar {
    flex: none;
    width: 100%;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    overflow-x: auto;
  }

  .brand,
  .collapsed .brand {
    padding: 0;
    border-bottom: 0;
    flex: 0 0 auto;
  }

  .brand-text,
  .collapsed .brand-text {
    display: flex;
  }

  .collapse-btn,
  .collapsed .collapse-btn {
    display: none;
  }

  .nav {
    flex-direction: row;
    gap: 4px;
    padding: 0;
    margin-left: auto;
  }

  .nav-item,
  .collapsed .nav-item {
    padding: 6px 10px;
    border-left: 0;
    border-bottom: 2px solid transparent;
    border-radius: 4px 4px 0 0;
  }

  .nav-item.router-link-active {
    border-bottom-color: #9fc0b5;
    border-left-color: transparent;
  }

  .nav-label {
    display: none;
  }

  .user,
  .collapsed .user {
    margin: 0;
    padding: 0 0 0 8px;
    border-top: 0;
  }

  .user-text {
    display: none;
  }

  .logout-btn {
    display: inline-grid;
    margin-left: 0;
  }

  .statusbar {
    padding: 8px 16px;
  }

  .crumb {
    display: none;
  }

  .readout {
    margin-left: auto;
  }
}
</style>