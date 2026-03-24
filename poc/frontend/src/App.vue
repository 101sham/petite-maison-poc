<template>
  <div id="app-wrapper">
    <nav v-if="auth.isAuthenticated">
      <div class="nav-brand">La Petite Maison de l'Épouvante</div>
      <div class="nav-links">
        <router-link to="/catalogue">Catalogue</router-link>
        <router-link to="/panier" class="cart-link">
          Panier <span v-if="cart.count > 0" class="badge">{{ cart.count }}</span>
        </router-link>
        <span class="user-name">{{ auth.user?.name }}</span>
        <button class="btn-logout" @click="logout">Déconnexion</button>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'

const auth = useAuthStore()
const cart = useCartStore()

onMounted(() => { if (auth.isAuthenticated) cart.fetchCart() })

function logout() {
  auth.logout()
  window.location.href = '/login'
}
</script>

<style>
nav {
  display: flex; align-items: center; justify-content: space-between;
  background: #1D3557; color: white; padding: 0 24px; height: 56px;
  position: sticky; top: 0; z-index: 100;
}
.nav-brand { font-size: 18px; font-weight: 600; }
.nav-links { display: flex; align-items: center; gap: 20px; }
.nav-links a { color: #A8C8E0; text-decoration: none; font-size: 14px; }
.nav-links a.router-link-active { color: white; font-weight: 600; }
.cart-link { position: relative; }
.badge {
  background: #C9956C; color: white; border-radius: 50%;
  width: 18px; height: 18px; font-size: 11px; font-weight: bold;
  display: inline-flex; align-items: center; justify-content: center;
  margin-left: 4px;
}
.user-name { color: #A8C8E0; font-size: 13px; }
.btn-logout {
  background: none; border: 1px solid #A8C8E0; color: #A8C8E0;
  padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;
}
.btn-logout:hover { background: rgba(168,200,224,0.15); }
main { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
</style>
