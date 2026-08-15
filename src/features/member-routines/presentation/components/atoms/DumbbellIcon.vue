<script setup lang="ts">
// ============================================================
// ATOM - Dumbbell / pesa icon
// ============================================================

withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const sizeClass: Record<string, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-7 h-7',
}
</script>

<template>
  <svg
    :class="sizeClass[size]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Mancuerna / pesa -->
    <path d="M6.5 6.5v11M17.5 6.5v11" />
    <path d="M4 9v6M20 9v6" />
    <path d="M6.5 12h11" />
    <rect x="2" y="8" width="2" height="8" rx="0.5" fill="currentColor" stroke="none" />
    <rect x="20" y="8" width="2" height="8" rx="0.5" fill="currentColor" stroke="none" />
  </svg>
</template>
