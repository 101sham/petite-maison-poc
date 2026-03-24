<template>
  <div>
    <router-link to="/catalogue" class="back-link">← Retour au catalogue</router-link>

    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else-if="product" class="product-detail">
      <img :src="product.image_url" :alt="product.title" class="product-img" />
      <div class="product-info">
        <span class="category">{{ product.category }}</span>
        <h1>{{ product.title }}</h1>
        <p class="description">{{ product.description }}</p>
        <div class="price">{{ parseFloat(product.price).toFixed(2) }} €</div>
        <p class="stock" :class="{ low: product.stock < 3 }">
          {{ product.stock > 0 ? `${product.stock} en stock` : 'Épuisé' }}
        </p>
        <button
          class="btn-add"
          :disabled="product.stock < 1 || adding"
          @click="addToCart"
        >
          {{ adding ? 'Ajout...' : product.stock < 1 ? 'Épuisé' : 'Ajouter au panier' }}
        </button>
        <p v-if="success" class="success-msg">✓ Ajouté au panier !</p>
      </div>
    </div>

    <div v-else class="error">Produit introuvable.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()

const product = ref(null)
const loading = ref(true)
const adding = ref(false)
const success = ref(false)

onMounted(async () => {
  try {
    const { data } = await axios.get(`/api/products/${route.params.id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    product.value = data
  } finally {
    loading.value = false
  }
})

async function addToCart() {
  adding.value = true
  await cart.addToCart(product.value.id)
  adding.value = false
  success.value = true
  setTimeout(() => { success.value = false }, 3000)
}
</script>

<style scoped>
.back-link { color: #457B9D; text-decoration: none; font-size: 14px; display: inline-block; margin-bottom: 24px; }
.product-detail { display: grid; grid-template-columns: 380px 1fr; gap: 40px; background: white; border-radius: 12px; padding: 32px; border: 1px solid #DDE4ED; }
.product-img { width: 100%; border-radius: 8px; object-fit: cover; }
.category { font-size: 12px; font-weight: 700; color: #457B9D; text-transform: uppercase; letter-spacing: 1px; }
h1 { font-size: 26px; color: #1D3557; margin: 10px 0 16px; }
.description { color: #7f8c8d; line-height: 1.7; margin-bottom: 24px; }
.price { font-size: 32px; font-weight: 700; color: #1D3557; margin-bottom: 8px; }
.stock { font-size: 13px; color: #6C9A8B; margin-bottom: 24px; }
.stock.low { color: #C9956C; }
.btn-add { background: #1D3557; color: white; border: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; width: 100%; }
.btn-add:hover:not(:disabled) { background: #457B9D; }
.btn-add:disabled { background: #DDE4ED; color: #7f8c8d; cursor: not-allowed; }
.success-msg { margin-top: 12px; color: #6C9A8B; font-weight: 600; }
.loading, .error { text-align: center; padding: 60px; color: #7f8c8d; }
</style>
