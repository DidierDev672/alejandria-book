<script setup lang="ts">
// ============================================================
// MOLECULE - Chat input box (prompt del entrenador)
// ============================================================

import { ref } from 'vue'
import ChatSendButton from '../atoms/ChatSendButton.vue'

const props = defineProps<{
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'send', prompt: string): void
}>()

const draft = ref('')

function submit() {
  const prompt = draft.value.trim()
  if (!prompt || props.disabled) return
  emit('send', prompt)
  draft.value = ''
}

function onKeydown(event: KeyboardEvent) {
  // Enter envía; Shift+Enter agrega salto de línea
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    submit()
  }
}
</script>

<template>
  <form
    class="flex items-end gap-2 bg-white border border-amber-200 rounded-2xl p-2 pl-4
           shadow-sm focus-within:ring-2 focus-within:ring-amber-500/40 transition-shadow"
    @submit.prevent="submit"
  >
    <textarea
      v-model="draft"
      rows="1"
      :disabled="disabled"
      placeholder="Pídeme una rutina, series, técnica de un ejercicio..."
      class="flex-1 resize-none bg-transparent text-sm text-stone-800 placeholder-stone-400
             focus:outline-none py-2.5 max-h-32 disabled:opacity-60"
      @keydown="onKeydown"
    />
    <ChatSendButton :disabled="disabled || !draft.trim()" :loading="loading" />
  </form>
</template>
