<template>
  <div>
    <div class="page-header">
      <h2>Catalogue</h2>
      <p>{{ total }} produit{{ total > 1 ? 's' : '' }} disponible{{ total > 1 ? 's' : '' }}</p>
    </div>

    <!-- Filtres catégorie -->
    <div class="filters">
      <button
        v-for="cat in categories" :key="cat.value"
        :class="['filter-btn', { active: activeCategory === cat.value }]"
        @click="setCategory(cat.value)"
      >{{ cat.label }}</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Chargement...</div>

    <!-- Grid produits -->
    <div v-else-if="products.length > 0" class="product-grid">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @add-to-cart="addToCart"
      />
    </div>

    <!-- Vide -->
    <div v-else class="empty">
      <p>Aucun produit dans cette catégorie.</p>
    </div>

    <!-- Toast notification -->
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import ProductCard from '../components/ProductCard.vue'

const auth = useAuthStore()
const cart = useCartStore()

const products = ref([])
const loading = ref(false)
const total = ref(0)
const activeCategory = ref('all')
const toast = ref(null)

const categories = [
  { value: 'all', label: 'Tous' },
  { value: 'films', label: 'Films' },
  { value: 'figurines', label: 'Figurines' },
  { value: 'jeux', label: 'Jeux' },
  { value: 'fanzines', label: 'Fanzines' },
  { value: 'goodies', label: 'Goodies' },
]

async function fetchProducts() {
  loading.value = true
  try {
    const params = activeCategory.value !== 'all' ? { category: activeCategory.value } : {}
    const { data } = await axios.get('/api/products', {
      params,
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    products.value = data.products
    total.value = data.total
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function setCategory(cat) {
  activeCategory.value = cat
  fetchProducts()
}

async function addToCart(productId) {
  try {
    await cart.addToCart(productId)
    showToast('Article ajouté au panier !')
  } catch (e) {
    showToast('Erreur lors de l\'ajout au panier')
  }
}

function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 2500)
}

onMounted(fetchProducts)
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-header h2 { font-size: 26px; color: #1D3557; font-weight: 700; }
.page-header p { color: #7f8c8d; font-size: 14px; margin-top: 4px; }

.filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
.filter-btn {
  padding: 8px 18px; border-radius: 20px; border: 1px solid #DDE4ED;
  background: white; cursor: pointer; font-size: 13px; color: #457B9D;
  transition: all 0.15s;
}
.filter-btn.active { background: #1D3557; color: white; border-color: #1D3557; }
.filter-btn:hover:not(.active) { border-color: #457B9D; }

.product-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;
}
.loading { text-align: center; color: #7f8c8d; padding: 60px; }
.empty { text-align: center; color: #7f8c8d; padding: 60px; background: white; border-radius: 8px; }

.toast {
  position: fixed; bottom: 28px; right: 28px; background: #1D3557; color: white;
  padding: 14px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2); animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; } }
</style>
