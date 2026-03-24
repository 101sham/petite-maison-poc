import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  function setToken(t) { token.value = t }
  function setUser(u) { user.value = u }
  function logout() { token.value = null; user.value = null }

  return { token, user, isAuthenticated, setToken, setUser, logout }
})
