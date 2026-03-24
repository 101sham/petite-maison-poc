import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)

  const total = computed(() => items.value.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0).toFixed(2))
  const count = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))

  function getHeaders() {
    const auth = useAuthStore()
    return { Authorization: `Bearer ${auth.token}` }
  }

  async function fetchCart() {
    loading.value = true
    try {
      const { data } = await axios.get('/api/cart', { headers: getHeaders() })
      items.value = data.items
    } finally {
      loading.value = false
    }
  }

  async function addToCart(productId, quantity = 1) {
    await axios.post('/api/cart', { product_id: productId, quantity }, { headers: getHeaders() })
    await fetchCart()
  }

  async function removeFromCart(itemId) {
    await axios.delete(`/api/cart/${itemId}`, { headers: getHeaders() })
    await fetchCart()
  }

  return { items, loading, total, count, fetchCart, addToCart, removeFromCart }
})
