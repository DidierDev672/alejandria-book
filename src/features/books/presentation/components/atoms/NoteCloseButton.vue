<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'on-dark' | 'on-light'
  }>(),
  { tone: 'on-dark' },
)

defineEmits<{
  close: []
}>()
</script>

<template>
  <button
    type="button"
    class="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C547]"
    :class="
      tone === 'on-light'
        ? 'text-[#1C1408] hover:bg-[#1C1408]/10'
        : 'text-[#F5E6A3] hover:bg-white/10'
    "
    aria-label="Cerrar"
    @click="$emit('close')"
  >
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</template>
