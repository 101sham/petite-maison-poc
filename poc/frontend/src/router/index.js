import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import CatalogView from '../views/CatalogView.vue'
import ProductView from '../views/ProductView.vue'
import CartView from '../views/CartView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  { path: '/', redirect: '/catalogue' },
  { path: '/login', component: LoginView },
  { path: '/catalogue', component: CatalogView, meta: { requiresAuth: true } },
  { path: '/produit/:id', component: ProductView, meta: { requiresAuth: true } },
  { path: '/panier', component: CartView, meta: { requiresAuth: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return '/login'
})

export default router
