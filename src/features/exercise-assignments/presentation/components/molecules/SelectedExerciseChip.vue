<script setup lang="ts">
defineProps<{
  name: string
}>()

defineEmits<{
  remove: []
}>()
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 px-3 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-orange-300/70"
  >
    {{ name }}
    <button
      type="button"
      class="rounded-full p-0.5 text-white/80 transition hover:bg-white/20 hover:text-white"
      aria-label="Quitar ejercicio"
      @click="$emit('remove')"
    >
      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
</template>
