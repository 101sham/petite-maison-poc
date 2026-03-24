<template>
  <div>
    <div class="page-header">
      <h2>Mon Panier</h2>
    </div>

    <div v-if="cart.loading" class="loading">Chargement...</div>

    <div v-else-if="cart.items.length === 0" class="empty">
      <p>Votre panier est vide.</p>
      <router-link to="/catalogue" class="btn-catalog">Voir le catalogue</router-link>
    </div>

    <div v-else class="cart-layout">
      <div class="cart-items">
        <div v-for="item in cart.items" :key="item.id" class="cart-item">
          <img :src="item.image_url" :alt="item.title" class="item-img" />
          <div class="item-info">
            <h3>{{ item.title }}</h3>
            <span class="item-category">{{ item.category }}</span>
          </div>
          <div class="item-qty">x{{ item.quantity }}</div>
          <div class="item-price">{{ (parseFloat(item.price) * item.quantity).toFixed(2) }} €</div>
          <button class="btn-remove" @click="remove(item.id)">✕</button>
        </div>
      </div>

      <div class="cart-summary">
        <h3>Récapitulatif</h3>
        <div class="summary-line">
          <span>Articles ({{ cart.count }})</span>
          <span>{{ cart.total }} €</span>
        </div>
        <div class="summary-line shipping">
          <span>Livraison</span>
          <span>Calculée à la commande</span>
        </div>
        <div class="summary-total">
          <span>Total</span>
          <span>{{ cart.total }} €</span>
        </div>
        <button class="btn-checkout">Passer commande</button>
        <router-link to="/catalogue" class="btn-continue">Continuer mes achats</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()

onMounted(() => cart.fetchCart())

async function remove(itemId) {
  await cart.removeFromCart(itemId)
}
</script>

<style scoped>
.page-header { margin-bottom: 28px; }
.page-header h2 { font-size: 26px; color: #1D3557; font-weight: 700; }
.loading { text-align: center; color: #7f8c8d; padding: 60px; }
.empty { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 1px solid #DDE4ED; }
.empty p { color: #7f8c8d; margin-bottom: 20px; font-size: 16px; }
.btn-catalog { background: #1D3557; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }

.cart-layout { display: grid; grid-template-columns: 1fr 320px; gap: 28px; align-items: start; }

.cart-items { display: flex; flex-direction: column; gap: 12px; }
.cart-item {
  display: flex; align-items: center; gap: 16px;
  background: white; border-radius: 10px; padding: 16px; border: 1px solid #DDE4ED;
}
.item-img { width: 64px; height: 64px; object-fit: cover; border-radius: 6px; }
.item-info { flex: 1; }
.item-info h3 { font-size: 14px; color: #1D3557; font-weight: 600; margin-bottom: 4px; }
.item-category { font-size: 12px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 0.5px; }
.item-qty { color: #7f8c8d; font-size: 14px; min-width: 30px; text-align: center; }
.item-price { font-size: 15px; font-weight: 700; color: #1D3557; min-width: 80px; text-align: right; }
.btn-remove { background: none; border: none; color: #DDE4ED; cursor: pointer; font-size: 16px; padding: 4px 8px; }
.btn-remove:hover { color: #C9956C; }

.cart-summary { background: white; border-radius: 12px; padding: 24px; border: 1px solid #DDE4ED; }
.cart-summary h3 { font-size: 16px; font-weight: 700; color: #1D3557; margin-bottom: 20px; }
.summary-line { display: flex; justify-content: space-between; font-size: 14px; color: #7f8c8d; margin-bottom: 12px; }
.shipping span:last-child { font-size: 12px; }
.summary-total { display: flex; justify-content: space-between; font-size: 17px; font-weight: 700; color: #1D3557; padding-top: 16px; border-top: 1px solid #DDE4ED; margin-top: 8px; margin-bottom: 20px; }
.btn-checkout { width: 100%; background: #1D3557; color: white; border: none; padding: 14px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 12px; }
.btn-checkout:hover { background: #457B9D; }
.btn-continue { display: block; text-align: center; color: #457B9D; font-size: 13px; text-decoration: none; }
</style>
