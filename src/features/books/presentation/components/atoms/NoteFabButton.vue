<script setup lang="ts">
defineEmits<{
  create: []
}>()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 rounded-full
           bg-[#1C1408] text-[#F5E6A3] text-sm font-semibold
           px-4 py-2.5 shadow-lg shadow-[#1C1408]/30
           hover:bg-[#2A1C0C] transition-colors
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C547]"
    @click="$emit('create')"
  >
    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
    </svg>
    Crear nota
  </button>
</template>
