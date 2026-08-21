<script setup lang="ts">
defineProps<{
  isSelected: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    type="button"
    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200"
    :class="isSelected
      ? 'border-amber-500 bg-amber-600 text-white shadow-sm'
      : 'border-stone-300 bg-white text-transparent hover:border-amber-400'"
    :aria-pressed="isSelected"
    @click.stop="$emit('toggle')"
  >
    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </button>
</template>
