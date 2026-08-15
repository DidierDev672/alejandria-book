<script setup lang="ts">
// ============================================================
// ATOM - Send prompt button
// ============================================================

defineProps<{
  disabled?: boolean
  loading?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    type="submit"
    :disabled="disabled"
    class="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white
           bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600
           shadow-md shadow-orange-500/30
           hover:from-orange-500 hover:via-amber-600 hover:to-orange-700
           transition-all duration-200
           disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
    :aria-label="loading ? 'Enviando...' : 'Enviar mensaje'"
    @click="$emit('click')"
  >
    <svg v-if="loading" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
      />
    </svg>
  </button>
</template>
