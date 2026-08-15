<script setup lang="ts">
defineProps<{
  accent?: 'success' | 'error'
}>()
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, scale: 0.72, y: -36 }"
    :enter="{
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 420,
        damping: 14,
        mass: 0.75,
      },
    }"
    :class="[
      'w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border',
      accent === 'error' ? 'border-rose-200' : 'border-emerald-200',
    ]"
    role="dialog"
    aria-modal="true"
  >
    <div
      :class="[
        'h-1.5',
        accent === 'error'
          ? 'bg-gradient-to-r from-rose-400 via-red-500 to-rose-600'
          : 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600',
      ]"
    />
    <div class="px-6 py-8 text-center space-y-4 modal-rebote">
      <slot />
    </div>
  </div>
</template>

<style scoped>
@keyframes modal-rebote {
  0%,
  100% {
    transform: translateY(0);
  }
  35% {
    transform: translateY(-5px);
  }
  65% {
    transform: translateY(2px);
  }
}

.modal-rebote {
  animation: modal-rebote 1.8s ease-in-out infinite;
}
</style>
