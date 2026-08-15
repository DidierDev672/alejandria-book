<script setup lang="ts">
// ============================================================
// ORGANISM - AI Chat Panel
// Historial + estado vacío + indicador de escritura + input
// ============================================================

import { nextTick, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAiRoutineChatStore } from '../../../application/stores/useAiRoutineChatStore'
import AiSparkleIcon from '../atoms/AiSparkleIcon.vue'
import TypingDots from '../atoms/TypingDots.vue'
import ChatMessageBubble from '../molecules/ChatMessageBubble.vue'
import ChatInputBox from '../molecules/ChatInputBox.vue'

const chatStore = useAiRoutineChatStore()
const { messages, isThinking, isBooting, error, hasMessages } = storeToRefs(chatStore)

const scrollArea = ref<HTMLElement | null>(null)

const SUGGESTIONS = [
  'Arma una rutina de fuerza de 3 días para un principiante',
  '¿Cuántas series y repeticiones para hipertrofia de pierna?',
  'Alternativas al press banca sin máquinas',
  'Rutina de 45 minutos para espalda y bíceps',
]

async function scrollToBottom() {
  await nextTick()
  scrollArea.value?.scrollTo({ top: scrollArea.value.scrollHeight, behavior: 'smooth' })
}

watch([() => messages.value.length, isThinking], scrollToBottom)

function handleSend(prompt: string) {
  chatStore.sendPrompt(prompt)
}
</script>

<template>
  <div
    class="flex flex-col overflow-hidden rounded-3xl border border-amber-500/20
           bg-white/80 backdrop-blur-sm shadow-xl shadow-amber-100/60"
    style="height: calc(100vh - 220px); min-height: 420px"
  >
    <!-- ══════════ Historial ══════════ -->
    <div ref="scrollArea" class="flex-1 overflow-y-auto px-5 py-6 space-y-5">
      <!-- Estado vacío -->
      <div
        v-if="!hasMessages"
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }"
        class="h-full flex flex-col items-center justify-center text-center px-6"
      >
        <div
          class="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600
                 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-5"
        >
          <AiSparkleIcon size="lg" />
        </div>
        <h2 class="text-xl font-bold font-serif text-stone-900 mb-2">
          Tu estratega de entrenamiento
        </h2>
        <p class="text-sm text-stone-500 max-w-md leading-relaxed mb-6">
          Pídeme rutinas, series, descansos o técnica de ejercicios y te respondo al instante.
          Solo hablo de entrenamiento: nada de literatura, filosofía, política ni diagnósticos médicos.
        </p>

        <div class="flex flex-wrap justify-center gap-2 max-w-lg">
          <button
            v-for="(suggestion, index) in SUGGESTIONS"
            :key="suggestion"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { delay: 0.15 + index * 0.07, duration: 0.3 },
            }"
            type="button"
            class="px-3.5 py-2 rounded-xl text-xs font-medium text-amber-800
                   bg-amber-50 border border-amber-200
                   hover:bg-amber-100 hover:border-amber-300 transition-colors"
            @click="handleSend(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- Mensajes -->
      <template v-else>
        <ChatMessageBubble
          v-for="(message, index) in messages"
          :key="message.id"
          :message="message"
          :index="index"
        />
      </template>

      <!-- Coach escribiendo -->
      <div v-if="isThinking" class="flex gap-3">
        <div
          class="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-white
                 bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 shadow-sm shadow-orange-500/30"
        >
          <AiSparkleIcon size="sm" />
        </div>
        <div
          class="rounded-2xl rounded-tl-sm bg-white border border-amber-200/70 px-4 py-3.5 shadow-sm
                 flex items-center gap-2"
        >
          <TypingDots />
          <span class="text-xs text-stone-400">
            {{
              isBooting
                ? 'Iniciando el modelo (ollama run llama3)... la primera vez puede tardar'
                : 'Diseñando tu rutina...'
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- ══════════ Error ══════════ -->
    <div v-if="error" class="px-5 pb-2">
      <div
        class="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50
               px-4 py-3 text-sm text-red-700"
      >
        <p class="leading-relaxed">{{ error }}</p>
        <button
          type="button"
          class="shrink-0 text-red-500 hover:text-red-700 transition-colors"
          aria-label="Descartar error"
          @click="chatStore.clearError()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- ══════════ Input ══════════ -->
    <div class="shrink-0 border-t border-amber-100 bg-[#FFFBF5] px-4 py-3">
      <ChatInputBox :disabled="isThinking" :loading="isThinking" @send="handleSend" />
      <p class="text-[11px] text-stone-400 mt-1.5 text-center">
        El Coach AI puede equivocarse: valida siempre las cargas con tu criterio profesional.
      </p>
    </div>
  </div>
</template>
