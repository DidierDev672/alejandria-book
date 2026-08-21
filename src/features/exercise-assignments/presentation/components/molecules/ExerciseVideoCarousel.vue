<script setup lang="ts">
import CustomVideoPlayer from '@/utils/components/CustomVideoPlayer.vue'
import { computed, onUnmounted, ref, watch } from 'vue'
import type { CatalogExercise } from '../../../domain/entities/ExerciseAssignment.types'
import AssignmentSwitch from '../atoms/AssignmentSwitch.vue'

const AUTOPLAY_MS = 7000

const props = defineProps<{
  exercises: CatalogExercise[]
}>()

const currentIndex = ref(0)
const isAutoplayOn = ref(false)
const slideDirection = ref<'next' | 'prev'>('next')
const prefersReducedMotion = ref(false)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

const total = computed(() => props.exercises.length)
const currentExercise = computed(() => props.exercises[currentIndex.value] ?? null)
const canNavigate = computed(() => total.value > 1)
const videoSrc = computed(() => currentExercise.value?.video_url?.trim() ?? '')

function clampIndex(index: number): number {
  if (total.value === 0) return 0
  return (index + total.value) % total.value
}

function goTo(index: number, direction: 'next' | 'prev' = 'next'): void {
  if (!canNavigate.value) return
  slideDirection.value = direction
  currentIndex.value = clampIndex(index)
  restartAutoplay()
}

function next(): void {
  goTo(currentIndex.value + 1, 'next')
}

function prev(): void {
  goTo(currentIndex.value - 1, 'prev')
}

function stopAutoplayTimer(): void {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

function startAutoplayTimer(): void {
  stopAutoplayTimer()
  if (!isAutoplayOn.value || !canNavigate.value || prefersReducedMotion.value) return
  autoplayTimer = setInterval(() => {
    next()
  }, AUTOPLAY_MS)
}

function restartAutoplay(): void {
  if (isAutoplayOn.value) startAutoplayTimer()
}

function onCarouselKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    next()
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    prev()
  }
}

watch(
  () => props.exercises.map((exercise) => exercise.id).join('|'),
  () => {
    currentIndex.value = 0
    slideDirection.value = 'next'
  },
)

watch([isAutoplayOn, canNavigate], () => {
  if (isAutoplayOn.value && canNavigate.value) {
    startAutoplayTimer()
    return
  }
  stopAutoplayTimer()
})

if (typeof window !== 'undefined') {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onUnmounted(() => {
  stopAutoplayTimer()
})
</script>

<template>
  <div
    class="space-y-3"
    role="region"
    aria-roledescription="carrusel"
    aria-label="Videos de los ejercicios asignados"
    tabindex="0"
    @keydown="onCarouselKeydown"
    @mouseenter="stopAutoplayTimer"
    @mouseleave="restartAutoplay"
  >
    <div v-if="currentExercise" class="relative overflow-hidden rounded-xl border border-amber-200 bg-stone-950 shadow-sm">
      <Transition :name="slideDirection === 'next' ? 'reel-next' : 'reel-prev'" mode="out-in">
        <div :key="currentExercise.id" class="space-y-0">
          <CustomVideoPlayer :video-src="videoSrc" />
          <div class="border-t border-amber-500/20 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 px-4 py-3">
            <p class="font-serif text-base font-semibold text-amber-50">
              {{ currentExercise.name }}
            </p>
            <p class="mt-0.5 text-xs font-medium uppercase tracking-wide text-stone-400">
              {{ currentExercise.muscle_group || 'Grupo muscular' }}
              <span class="mx-1.5 text-amber-700">·</span>
              {{ currentExercise.difficulty || '—' }}
            </p>
          </div>
        </div>
      </Transition>

      <button
        v-if="canNavigate"
        type="button"
        class="absolute top-1/2 left-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-amber-600/90 text-white shadow-md shadow-amber-900/40 transition-colors hover:bg-amber-500 focus:ring-2 focus:ring-amber-300 focus:outline-none"
        aria-label="Ejercicio anterior"
        @click="prev"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        v-if="canNavigate"
        type="button"
        class="absolute top-1/2 right-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-amber-600/90 text-white shadow-md shadow-amber-900/40 transition-colors hover:bg-amber-500 focus:ring-2 focus:ring-amber-300 focus:outline-none"
        aria-label="Ejercicio siguiente"
        @click="next"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <div v-if="canNavigate" class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center justify-center gap-2" role="tablist" aria-label="Posición del carrusel">
        <button
          v-for="(exercise, index) in exercises"
          :key="exercise.id"
          type="button"
          role="tab"
          class="h-2.5 rounded-full transition-all duration-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          :class="index === currentIndex
            ? 'w-6 bg-amber-600'
            : 'w-2.5 bg-amber-200 hover:bg-amber-400'"
          :aria-label="`Ir al video ${index + 1} de ${total}: ${exercise.name}`"
          :aria-selected="index === currentIndex"
          @click="goTo(index, index > currentIndex ? 'next' : 'prev')"
        />
      </div>

      <label class="inline-flex items-center gap-2 text-xs font-medium text-stone-500">
        <AssignmentSwitch v-model="isAutoplayOn" />
        Avance automático
      </label>
    </div>

    <p v-if="currentExercise" class="text-center text-xs text-stone-400">
      {{ currentIndex + 1 }} / {{ total }}
    </p>
  </div>
</template>

<style scoped>
.reel-next-enter-active,
.reel-next-leave-active,
.reel-prev-enter-active,
.reel-prev-leave-active {
  transition: opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
}

.reel-next-enter-from {
  opacity: 0;
  transform: translateX(28px);
}

.reel-next-leave-to {
  opacity: 0;
  transform: translateX(-28px);
}

.reel-prev-enter-from {
  opacity: 0;
  transform: translateX(-28px);
}

.reel-prev-leave-to {
  opacity: 0;
  transform: translateX(28px);
}

@media (prefers-reduced-motion: reduce) {
  .reel-next-enter-active,
  .reel-next-leave-active,
  .reel-prev-enter-active,
  .reel-prev-leave-active {
    transition: opacity 0.01ms;
  }

  .reel-next-enter-from,
  .reel-next-leave-to,
  .reel-prev-enter-from,
  .reel-prev-leave-to {
    transform: none;
  }
}
</style>
