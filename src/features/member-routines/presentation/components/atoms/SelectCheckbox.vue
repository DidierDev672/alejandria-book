<script setup lang="ts">
// ============================================================
// ATOM - Selection checkbox with design-system styling
// ============================================================

defineProps<{
  checked: boolean
  disabled?: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="checked"
    :disabled="disabled"
    @click.stop="$emit('toggle')"
    :class="[
      'w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center',
      'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400/50',
      checked
        ? 'bg-amber-600 border-amber-600'
        : 'bg-white border-amber-300 hover:border-amber-500',
      disabled && 'opacity-50 cursor-not-allowed',
    ]"
  >
    <svg
      v-if="checked"
      class="w-3 h-3 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
    </svg>
  </button>
</template>
