<script setup lang="ts">
defineProps<{
  variant: 'success' | 'error'
}>()
</script>

<template>
  <div
    :class="[
      'w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg',
      variant === 'success'
        ? 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-emerald-500/30'
        : 'bg-gradient-to-br from-rose-400 to-red-600 shadow-rose-500/30',
    ]"
  >
    <svg
      v-if="variant === 'success'"
      class="w-8 h-8 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2.5"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <svg
      v-else
      class="w-8 h-8 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2.5"
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  </div>
</template>
