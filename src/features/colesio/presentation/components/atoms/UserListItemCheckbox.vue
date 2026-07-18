<script setup lang="ts">
defineProps<{
  isSelected: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <div class="flex items-center justify-center">
    <button
      type="button"
      @click="$emit('toggle')"
      :class="[
        'w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center',
        isSelected
          ? 'border-amber-500 bg-amber-500'
          : 'border-stone-300 bg-white hover:border-amber-400'
      ]"
    >
      <svg
        v-if="isSelected"
        class="w-4 h-4 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="3"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </button>
  </div>
</template>
