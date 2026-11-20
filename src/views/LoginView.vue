<script setup>
import { ref } from 'vue'

// F0 骨架：仅占位表单，登录接口与校验在 F1 接入
const form = ref({ username: '', password: '' })
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

        <el-form label-position="top" @submit.prevent>
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="4–32 位用户名" autocomplete="username" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="8–64 位，含字母和数字"
              show-password
              autocomplete="current-password"
            />
          </el-form-item>
          <el-button type="primary" class="auth-submit" disabled>登录</el-button>
        </el-form>

        <p class="auth-switch">还没有账号？<router-link to="/register">注册</router-link></p>
        <p class="dev-note">F0 工程骨架 · 登录逻辑在 F1 接入</p>
      </div>
    </section>
  </div>
</template>