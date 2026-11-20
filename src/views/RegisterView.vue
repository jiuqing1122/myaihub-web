<script setup>
import { ref } from 'vue'

// F0 骨架：仅占位表单，注册接口与校验在 F1 接入
const form = ref({ username: '', password: '', nickname: '' })
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

        <el-form label-position="top" @submit.prevent>
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="4–32 位，注册后不可修改" autocomplete="username" />
          </el-form-item>
          <el-form-item label="密码">
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
          <el-button type="primary" class="auth-submit" disabled>注册</el-button>
        </el-form>

        <p class="auth-switch">已有账号？<router-link to="/login">登录</router-link></p>
        <p class="dev-note">F0 工程骨架 · 注册逻辑在 F1 接入</p>
      </div>
    </section>
  </div>
</template>