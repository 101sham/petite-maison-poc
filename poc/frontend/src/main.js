import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Keycloak from 'keycloak-js'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'petitemaison',
  clientId: 'poc-app',
})

keycloak.init({ onLoad: 'check-sso' })
  .then(authenticated => {
    const app = createApp(App)
    const pinia = createPinia()
    app.use(pinia)
    app.use(router)

    const authStore = useAuthStore()
    if (authenticated) {
      authStore.setToken(keycloak.token)
      authStore.setUser({
        id: keycloak.subject,
        name: keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username,
        email: keycloak.tokenParsed?.email,
      })
      setInterval(() => {
        keycloak.updateToken(60).then(refreshed => {
          if (refreshed) authStore.setToken(keycloak.token)
        })
      }, 30000)
    }

    app.config.globalProperties.$keycloak = keycloak
    app.mount('#app')
  })
  .catch(err => {
    console.error('Keycloak init failed', err)
    // Monte l'app quand même pour afficher la page de login
    const app = createApp(App)
    const pinia = createPinia()
    app.use(pinia)
    app.use(router)
    app.config.globalProperties.$keycloak = keycloak
    app.mount('#app')
  })