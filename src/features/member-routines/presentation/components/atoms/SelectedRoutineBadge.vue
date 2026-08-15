<script setup lang="ts">
// ============================================================
// ATOM - Selected routine badge (chromatic orange gradient)
// ============================================================

defineProps<{
  name: string
  disabled?: boolean
}>()

defineEmits<{
  (e: 'clear'): void
}>()
</script>

<template>
  <span
    class="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full
           bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600
           text-white text-xs font-semibold shadow-md shadow-orange-500/30
           max-w-full"
  >
    <svg class="w-3.5 h-3.5 shrink-0 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>

    <span class="truncate">{{ name }}</span>

    <button
      type="button"
      @click="$emit('clear')"
      :disabled="disabled"
      class="w-5 h-5 shrink-0 rounded-full flex items-center justify-center
             bg-white/20 hover:bg-white/35 transition-colors
             disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Quitar rutina seleccionada"
      title="Quitar rutina seleccionada"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
</template>
