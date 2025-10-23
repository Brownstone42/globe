import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { useAuthStore } from './stores/auth'

import App from './App.vue'
import './css/layout.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')