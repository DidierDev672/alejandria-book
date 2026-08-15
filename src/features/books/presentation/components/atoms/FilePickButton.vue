<script setup lang="ts">
defineProps<{
  label: string
  hint?: string
  variant?: 'image' | 'pdf'
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="w-full py-6 px-4 border-2 border-dashed rounded-2xl transition-all duration-300
           flex flex-col items-center justify-center gap-2 font-medium
           border-amber-400 text-amber-800 hover:border-amber-600 hover:bg-amber-50"
    @click="$emit('click')"
  >
    <svg
      v-if="variant === 'pdf'"
      class="w-7 h-7 text-amber-700"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.8"
        d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"
      />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M14 3v5h5" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 13h6M9 17h4" />
    </svg>
    <svg
      v-else
      class="w-7 h-7 text-amber-700"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.8"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
    <span class="text-sm font-semibold">{{ label }}</span>
    <span v-if="hint" class="text-xs text-amber-600/80">{{ hint }}</span>
  </button>
</template>
