import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(MotionPlugin)
app.use(router)

// Cargar historial del chat si hay una sesión activa.
// Se ejecuta antes de montar la app para que los mensajes
// estén disponibles desde el primer render del chat.
const initApp = async () => {
  const authUser = localStorage.getItem('auth_user')
  if (authUser) {
    const { useChatStore } = await import('@/stores/chatStore')
    const chatStore = useChatStore(pinia)
    await chatStore.loadFromCloud()
  }
  app.mount('#app')
}

initApp()
