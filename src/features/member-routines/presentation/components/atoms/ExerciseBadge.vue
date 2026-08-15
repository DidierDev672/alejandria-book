<script setup lang="ts">
// ============================================================
// ATOM - Assigned exercise badge
// ============================================================

defineProps<{
  name: string
  muscleGroup?: string
  disabled?: boolean
}>()

defineEmits<{
  (e: 'remove'): void
}>()
</script>

<template>
  <span
    class="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full
           bg-amber-100 border border-amber-200 text-amber-800
           text-xs font-semibold max-w-full"
  >
    <svg class="w-3.5 h-3.5 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>

    <span class="truncate">
      {{ name }}
      <span v-if="muscleGroup" class="text-amber-500 font-normal">· {{ muscleGroup }}</span>
    </span>

    <button
      type="button"
      @click="$emit('remove')"
      :disabled="disabled"
      class="w-5 h-5 shrink-0 rounded-full flex items-center justify-center
             text-amber-600 hover:bg-amber-200 transition-colors
             disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Quitar ejercicio"
      title="Quitar ejercicio"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
</template>
