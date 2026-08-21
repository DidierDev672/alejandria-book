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
    class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-3 py-1 text-xs font-semibold text-amber-950 shadow-sm ring-1 ring-amber-300/80"
  >
    {{ name }}
    <button
      type="button"
      class="rounded-full p-0.5 text-amber-900/70 transition hover:bg-white/30 hover:text-amber-950"
      aria-label="Quitar equipo"
      @click="$emit('remove')"
    >
      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
</template>
