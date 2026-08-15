<script setup lang="ts">
// ============================================================
// ATOM - Play video button
// ============================================================

defineProps<{
  disabled?: boolean
  active?: boolean
}>()

defineEmits<{
  (e: 'play'): void
}>()
</script>

<template>
  <button
    type="button"
    @click.stop="$emit('play')"
    :disabled="disabled"
    :class="[
      'w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-colors duration-150',
      'focus:outline-none focus:ring-2 focus:ring-amber-400/50',
      active
        ? 'bg-amber-600 text-white'
        : 'bg-amber-100 text-amber-700 hover:bg-amber-200',
      disabled && 'opacity-40 cursor-not-allowed hover:bg-amber-100',
    ]"
    :title="disabled ? 'Sin video disponible' : (active ? 'Ocultar video' : 'Ver video')"
  >
    <svg v-if="!active" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
    <svg v-else class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  </button>
</template>
