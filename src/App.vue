<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getActivePinia } from 'pinia'
import LoadingView from '@/utils/loading/presentation/components/LoadingView.vue'

const router = useRouter()
const isAppReady = ref(false)

async function initializeApp() {
  const authUser = localStorage.getItem('auth_user')
  if (authUser) {
    const pinia = getActivePinia()
    if (pinia) {
      const { useChatStore } = await import('@/stores/chatStore')
      const chatStore = useChatStore(pinia)
      await chatStore.loadFromCloud()
    }
  }

  await router.isReady()
}

onMounted(async () => {
  try {
    await initializeApp()
  } finally {
    isAppReady.value = true
  }
})
</script>

<template>
  <LoadingView
    :is-loading="!isAppReady"
    title="Alejandría"
    description="Preparando la biblioteca imperial..."
  />
  <RouterView v-if="isAppReady" />
</template>
