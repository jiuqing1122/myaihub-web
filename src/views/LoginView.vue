<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { USE_MOCK } from '../api/mock'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const formRef = ref()
const loading = ref(false)
const form = reactive({ username: '', password: '' })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function submit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await auth.login({ username: form.username.trim(), password: form.password })
    ElMessage.success('登录成功')
    router.replace(route.query.redirect || '/chat')
  } catch (err) {
    ElMessage.error(err.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth">
    <section class="auth-panel">
      <div class="auth-brand">
        <span class="auth-mark">M</span>
        <span>MYAIHUB · 知识库问答</span>
      </div>

      <div class="auth-copy">
        <p class="auth-eyebrow">混合检索 · 重排序 · 引用溯源</p>
        <h1 class="auth-headline">把问题交给<br /><em>知识库</em>。</h1>
        <p class="auth-lede">内部制度、流程与手册，一次提问同时给出答案和出处。</p>
      </div>

      <p class="auth-foot">基于混合检索与重排序的领域知识库问答系统 · 二期</p>
    </section>

    <section class="auth-body">
      <div class="auth-card">
        <h2>登录</h2>
        <p class="auth-sub">使用你的账号继续。</p>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submit">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="4–32 位用户名" autocomplete="username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="8–64 位，含字母和数字"
              show-password
              autocomplete="current-password"
            />
          </el-form-item>
          <el-button type="primary" native-type="submit" class="auth-submit" :loading="loading">
            登录
          </el-button>
        </el-form>

        <p class="auth-switch">还没有账号？<router-link to="/register">注册</router-link></p>
        <p v-if="USE_MOCK" class="dev-note">演示账号 demo / demo1234 · 管理员 admin / admin123</p>
      </div>
    </section>
  </div>
</template>