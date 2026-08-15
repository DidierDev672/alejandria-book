<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  src: string
  alt: string
}>()

const ready = ref(false)
const failed = ref(false)
const reduceMotion = ref(false)
let image: HTMLImageElement | null = null

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function loadCover(src: string) {
  ready.value = false
  failed.value = false
  image = null

  if (!src) {
    failed.value = true
    return
  }

  const next = new Image()
  image = next
  next.onload = () => {
    if (image !== next) return
    ready.value = true
  }
  next.onerror = () => {
    if (image !== next) return
    failed.value = true
  }
  next.src = src
}

onMounted(() => {
  reduceMotion.value = prefersReducedMotion()
  loadCover(props.src)
})

watch(
  () => props.src,
  (src) => loadCover(src),
)

onBeforeUnmount(() => {
  image = null
})
</script>

<template>
  <div class="relative w-full aspect-[3/4] overflow-hidden bg-amber-200">
    <div
      v-if="!ready && !failed"
      class="absolute inset-0 animate-pulse bg-gradient-to-br from-amber-200 to-orange-200"
      aria-hidden="true"
    />

    <img
      v-if="ready"
      :src="src"
      :alt="alt"
      v-motion
      :initial="{ opacity: reduceMotion ? 1 : 0 }"
      :enter="{
        opacity: 1,
        transition: { duration: reduceMotion ? 0 : 0.55 },
      }"
      class="absolute inset-0 h-full w-full object-cover"
    />

    <div
      v-if="failed"
      class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-amber-100 text-amber-700"
    >
      <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <span class="text-[10px] font-medium uppercase tracking-wide">Sin portada</span>
    </div>
  </div>
</template>
