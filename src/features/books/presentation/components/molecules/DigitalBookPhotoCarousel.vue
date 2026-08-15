<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CoverFadeImage from '../atoms/CoverFadeImage.vue'

const props = defineProps<{
  photos: string[]
  bookName: string
}>()

const index = ref(0)
const hasMany = computed(() => props.photos.length > 1)
const currentSrc = computed(() => props.photos[index.value] ?? '')

watch(
  () => props.photos,
  () => {
    index.value = 0
  },
)

function go(delta: number) {
  const total = props.photos.length
  if (total < 2) return
  index.value = (index.value + delta + total) % total
}
</script>

<template>
  <div class="relative mx-auto w-full max-w-md">
    <div
      :key="index"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { duration: 0.45 } }"
      class="overflow-hidden rounded-2xl border-2 border-amber-200 shadow-xl shadow-amber-500/20"
    >
      <CoverFadeImage
        v-if="currentSrc"
        :src="currentSrc"
        :alt="`Imagen ${index + 1} de ${bookName}`"
      />
      <div
        v-else
        class="flex aspect-[3/4] items-center justify-center bg-amber-100 text-amber-700"
      >
        <span class="text-sm font-medium">Sin imágenes de este libro</span>
      </div>
    </div>

    <template v-if="hasMany">
      <button
        type="button"
        class="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center
               rounded-full bg-white/90 text-amber-800 shadow-md
               hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label="Imagen anterior"
        @click="go(-1)"
      >
        ‹
      </button>
      <button
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center
               rounded-full bg-white/90 text-amber-800 shadow-md
               hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label="Imagen siguiente"
        @click="go(1)"
      >
        ›
      </button>
      <div class="mt-3 flex justify-center gap-1.5">
        <button
          v-for="(_, dot) in photos"
          :key="dot"
          type="button"
          class="h-2 w-2 rounded-full transition-colors"
          :class="dot === index ? 'bg-amber-600' : 'bg-amber-200'"
          :aria-label="`Ir a la imagen ${dot + 1}`"
          @click="index = dot"
        />
      </div>
    </template>
  </div>
</template>
