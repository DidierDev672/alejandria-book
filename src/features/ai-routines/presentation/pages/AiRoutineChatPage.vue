<script setup lang="ts">
// ============================================================
// PAGE - Rutinas asistidas por AI (Gurney Halleck / Ollama)
// Precarga inventario: GET /equipment (active) + exercises por equipo
// ============================================================

import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAiRoutineChatStore } from '../../application/stores/useAiRoutineChatStore'
import { useAiRoutineChat } from '../../composables/useAiRoutineChat'
import AiSparkleIcon from '../components/atoms/AiSparkleIcon.vue'
import AiChatPanel from '../components/organisms/AiChatPanel.vue'

const chatStore = useAiRoutineChatStore()
const { contextLoading, contextError } = storeToRefs(chatStore)
const { buildSystemPrompt } = useAiRoutineChat()

onMounted(async () => {
  // Cache de system prompt + inventario (evita latencia en el primer mensaje)
  await Promise.all([
    chatStore.preloadInventoryContext(),
    buildSystemPrompt({ forceRefresh: true }),
  ])
})
</script>

<template>
  <div class="min-h-screen bg-[#FFFBF5] px-6 py-8">
    <!-- Decorative Background -->
    <div class="pointer-events-none fixed right-0 top-0 opacity-10 -z-10">
      <svg width="360" height="260" viewBox="0 0 360 260" fill="none">
        <circle cx="320" cy="-20" r="160" fill="#f59e0b" />
        <circle cx="270" cy="55" r="80" fill="#ea580c" />
      </svg>
    </div>
    <div class="pointer-events-none fixed bottom-0 left-0 opacity-5 -z-10">
      <svg width="240" height="200" viewBox="0 0 240 200" fill="none">
        <circle cx="0" cy="200" r="140" fill="#f59e0b" />
      </svg>
    </div>

    <div class="max-w-4xl mx-auto space-y-6">
      <!-- ══════════ Header ══════════ -->
      <div v-motion :initial="{ opacity: 0, y: 28 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.45 } }"
        class="relative overflow-hidden rounded-3xl px-6 py-5 shadow-xl shadow-orange-500/30
               bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600">
        <div class="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div class="pointer-events-none absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-amber-300/20 blur-2xl" />

        <div class="relative z-10 flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div v-motion :initial="{ scale: 0.85, opacity: 0 }" :enter="{
              scale: 1,
              opacity: 1,
              transition: { type: 'spring', stiffness: 220, damping: 14 },
            }" class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl
                     flex items-center justify-center shadow-lg shadow-orange-600/30 text-white">
              <AiSparkleIcon size="lg" />
            </div>

            <div>
              <h1 class="text-3xl font-bold font-serif text-white drop-shadow-sm">
                Rutinas asistidas por AI
              </h1>
              <p class="text-sm text-orange-100 mt-0.5">
                Gurney Halleck · solo equipos activos y ejercicios registrados
              </p>
            </div>
          </div>

          <button v-if="chatStore.hasMessages" type="button" class="shrink-0 inline-flex items-center gap-2 px-4 py-2.5
                   bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-xl
                   hover:bg-white/30 border border-white/20 transition-all duration-200"
            title="Empezar conversación nueva" @click="chatStore.resetConversation()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Nueva charla
          </button>
        </div>
      </div>

      <!-- Estado de inventario -->
      <div
        v-if="contextLoading"
        class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        Cargando equipos activos y ejercicios del gym…
      </div>
      <div
        v-else-if="contextError"
        class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
      >
        {{ contextError }}
      </div>

      <!-- ══════════ Chat ══════════ -->
      <div v-motion :initial="{ opacity: 0, y: 16 }" :enter="{ opacity: 1, y: 0, transition: { delay: 0.12 } }">
        <AiChatPanel />
      </div>
    </div>
  </div>
</template>
