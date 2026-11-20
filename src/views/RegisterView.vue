<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const formRef = ref()
const loading = ref(false)
const form = reactive({ username: '', password: '', nickname: '' })

const validateUsername = (rule, value, cb) => {
  const name = (value || '').trim()
  if (name.length < 4 || name.length > 32) return cb(new Error('用户名需 4–32 位'))
  cb()
}

const validatePassword = (rule, value, cb) => {
  if (!value) return cb(new Error('请输入密码'))
  if (value.length < 8 || value.length > 64) return cb(new Error('密码需 8–64 位'))
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return cb(new Error('密码需同时包含字母和数字'))
  cb()
}

const rules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }]
}

async function submit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    // 注册成功后端直接返回 token，视为已登录
    await auth.register({
      username: form.username.trim(),
      password: form.password,
      nickname: form.nickname.trim()
    })
    ElMessage.success('注册成功')
    router.replace('/chat')
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
        <p class="auth-eyebrow">一个新账号，一份可查证的回答</p>
        <h1 class="auth-headline">先注册，<br />再<em>提问</em>。</h1>
        <p class="auth-lede">账号用于保存你的问答记录，方便随时回看答案与引用来源。</p>
      </div>

      <p class="auth-foot">基于混合检索与重排序的领域知识库问答系统 · 二期</p>
    </section>

    <section class="auth-body">
      <div class="auth-card">
        <h2>注册</h2>
        <p class="auth-sub">创建账号后自动登录。</p>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submit">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="4–32 位，注册后不可修改" autocomplete="username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="8–64 位，需同时包含字母和数字"
              show-password
              autocomplete="new-password"
            />
          </el-form-item>
          <el-form-item label="昵称（可选）">
            <el-input v-model="form.nickname" placeholder="显示在个人信息的名称" />
          </el-form-item>
          <el-button type="primary" native-type="submit" class="auth-submit" :loading="loading">
            注册
          </el-button>
        </el-form>

        <p class="auth-switch">已有账号？<router-link to="/login">登录</router-link></p>
      </div>
    </section>
  </div>
</template>