<script setup lang="ts">
import { watch, ref } from 'vue'

const props = defineProps<{
  src: string
  title?: string
}>()

defineEmits<{
  remove: []
}>()

const bounceKey = ref(0)

watch(
  () => props.src,
  () => {
    bounceKey.value += 1
  },
)
</script>

<template>
  <div
    v-if="src"
    :key="bounceKey"
    v-motion
    :initial="{ opacity: 0, scale: 0.55, y: -28 }"
    :enter="{
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 420,
        damping: 12,
        mass: 0.7,
      },
    }"
    class="relative mx-auto w-40 sm:w-48 aspect-[3/4] rounded-2xl overflow-hidden
           border-2 border-amber-300 shadow-xl shadow-amber-500/25 bg-amber-50"
  >
    <img
      :src="src"
      :alt="title || 'Portada del libro'"
      class="w-full h-full object-cover cover-bounce"
    />
    <button
      type="button"
      class="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-600 text-white
             flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors"
      aria-label="Quitar portada"
      @click="$emit('remove')"
    >
      ×
    </button>
    <div
      class="absolute inset-x-0 bottom-0 px-3 py-2 bg-gradient-to-t from-stone-900/70 to-transparent
             text-white text-xs font-medium truncate"
    >
      Vista previa
    </div>
  </div>
</template>

<style scoped>
@keyframes cover-rebote {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  40% {
    transform: translateY(-6px) scale(1.02);
  }
  70% {
    transform: translateY(2px) scale(0.99);
  }
}

.cover-bounce {
  animation: cover-rebote 1.6s ease-in-out infinite;
  transform-origin: center bottom;
}
</style>
