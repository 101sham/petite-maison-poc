<template>
  <div class="login-page">
    <div class="login-card">
      <h1>La Petite Maison<br><span>de l'Épouvante</span></h1>
      <p class="subtitle">Connectez-vous pour accéder au catalogue</p>
      <button class="btn-login" @click="login">Se connecter avec Keycloak</button>
      <p class="hint">Authentification sécurisée via OAuth2 / OIDC</p>
    </div>
  </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const { proxy } = getCurrentInstance()

if (auth.isAuthenticated) router.push('/catalogue')

function login() { proxy.$keycloak.login() }
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 56px); display: flex;
  align-items: center; justify-content: center; background: #f8f9fb;
}
.login-card {
  background: white; border-radius: 12px; padding: 56px 48px;
  text-align: center; box-shadow: 0 4px 24px rgba(29,53,87,0.1); max-width: 420px;
}
h1 { font-size: 28px; color: #1D3557; line-height: 1.3; margin-bottom: 12px; }
h1 span { color: #C9956C; }
.subtitle { color: #7f8c8d; margin-bottom: 32px; font-size: 15px; }
.btn-login {
  background: #1D3557; color: white; border: none; padding: 14px 32px;
  border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer;
  width: 100%; transition: background 0.2s;
}
.btn-login:hover { background: #457B9D; }
.hint { margin-top: 16px; font-size: 12px; color: #b0b8c1; }
</style>
