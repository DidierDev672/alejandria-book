<script setup lang="ts">
import ExerciseVideoCard from '@/features/exercise/presentation/components/molecules/ExerciseVideoCard.vue'
import CustomVideoPlayer from '@/utils/components/CustomVideoPlayer.vue'
import { computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  exercises: { type: Array, default: () => [] },
  selectedExercise: { type: Object, default: null },
  getVideoUrl: { type: Function, required: true },
  getMuscleGroupInfo: { type: Function, required: true },
  getDifficultyInfo: { type: Function, required: true },
})

const emit = defineEmits(['close', 'select'])

const videoSrc = computed(() => {
  if (!props.selectedExercise) return ''
  return props.getVideoUrl(props.selectedExercise)
})

const hasVideo = computed(() => !!videoSrc.value)

const muscleGroupInfo = computed(() => {
  if (!props.selectedExercise) return null
  return props.getMuscleGroupInfo(props.selectedExercise.muscle_group)
})

const difficultyInfo = computed(() => {
  if (!props.selectedExercise) return null
  return props.getDifficultyInfo(props.selectedExercise.difficulty)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[52] overflow-y-auto" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :leave="{ opacity: 0 }"
        :transition="{ duration: 0.25, ease: 'easeOut' }" class="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
        @click="emit('close')" />

      <div class="flex min-h-full items-center justify-center p-0 sm:p-4">
        <div v-motion :initial="{ opacity: 0, scale: 0.96, y: 40 }" :enter="{ opacity: 1, scale: 1, y: 0 }"
          :leave="{ opacity: 0, scale: 0.96, y: 40 }" :transition="{ type: 'spring', stiffness: 260, damping: 24 }"
          class="relative w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] overflow-hidden bg-white shadow-2xl shadow-black/20 flex flex-col rounded-none sm:rounded-3xl">

          <!-- Accent line -->
          <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

          <!-- Header -->
          <div
            class="bg-gradient-to-r from-amber-500 to-orange-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div class="rounded-xl bg-white/20 p-1.5 sm:p-2 flex-shrink-0">
                <div v-motion :initial="{ opacity: 0, scale: 0.4, rotate: -90, y: -10 }"
                  :enter="{ opacity: 1, scale: 1, rotate: 0, y: 0, transition: { type: 'spring', stiffness: 320, damping: 16, delay: 0.15 } }"
                  :hovered="{ scale: 1.15, rotate: 12 }" :tapped="{ scale: 0.9, rotate: -6 }"
                  :transition="{ duration: 0.2 }"
                  class="rounded-xl bg-white/20 p-1.5 sm:p-2 flex-shrink-0 cursor-default">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="min-w-0">
                <h3 class="font-serif text-base sm:text-lg font-bold text-white truncate">Ejercicios del Equipo</h3>
                <p class="text-amber-100 text-xs truncate">{{ exercises.length }}
                  ejercicio{{ exercises.length !== 1 ? 's' : '' }} disponible{{ exercises.length !== 1 ? 's' : '' }}</p>
              </div>
            </div>
            <button v-motion :hovered="{ scale: 1.08 }" :tapped="{ scale: 0.92 }" @click="emit('close')"
              class="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-colors flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body: Sidebar + Video -->
          <div class="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            <!-- Sidebar: Exercise list -->
            <div class="w-full lg:w-72 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-stone-100 bg-stone-50/50
                     overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto
                     flex flex-row lg:flex-col gap-3.5 p-3
                     max-h-40 sm:max-h-48 lg:max-h-none">
              <div v-for="(exercise, index) in exercises" :key="exercise.id" v-motion :initial="{ opacity: 0, x: -12 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: index * 0.04 } }"
                class="flex-shrink-0 w-48 lg:w-auto cursor-pointer" @click="emit('select', exercise)">
                <ExerciseVideoCard :exercise="exercise" :is-selected="selectedExercise?.id === exercise.id"
                  :muscle-group-info="getMuscleGroupInfo(exercise.muscle_group)"
                  :difficulty-info="getDifficultyInfo(exercise.difficulty)" @select="emit('select', exercise)" />
              </div>
            </div>

            <!-- Main: Video + Info -->
            <div class="flex-1 flex flex-col min-w-0 overflow-y-auto">
              <!-- Video Area -->
              <div v-if="selectedExercise" class="flex-shrink-0">
                <div v-if="hasVideo" class="aspect-video bg-stone-950">
                  <CustomVideoPlayer :video-src="videoSrc" />
                </div>
                <!-- No video placeholder -->
                <div v-else
                  class="aspect-video bg-gradient-to-br from-stone-100 to-stone-50 flex flex-col items-center justify-center px-4 text-center">
                  <div
                    class="w-12 h-12 sm:w-16 sm:h-16 bg-stone-200/60 rounded-full flex items-center justify-center mb-3">
                    <svg class="w-6 h-6 sm:w-8 sm:h-8 text-stone-400" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <p class="text-sm font-medium text-stone-400">Sin video disponible</p>
                  <p class="text-xs text-stone-300 mt-1">Este ejercicio no tiene video asociado</p>
                </div>
              </div>

              <!-- Exercise Info -->
              <div v-if="selectedExercise" v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
                :transition="{ delay: 0.1 }"
                class="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4 border-t border-stone-100">

                <!-- Name -->
                <h4 class="font-serif text-lg sm:text-xl font-bold text-stone-800">{{ selectedExercise.name }}</h4>

                <!-- Badges -->
                <div class="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <!-- Muscle Group Badge -->
                  <span v-if="muscleGroupInfo"
                    class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm font-medium text-amber-700">
                    <span>{{ muscleGroupInfo.icon }}</span>
                    <span>{{ muscleGroupInfo.label }}</span>
                  </span>

                  <!-- Difficulty Badge -->
                  <span v-if="difficultyInfo"
                    :class="['inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 border rounded-xl text-xs sm:text-sm font-medium', difficultyInfo.colorClass]">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>{{ difficultyInfo.label }}</span>
                  </span>

                  <!-- Video status badge -->
                  <span :class="[
                    'inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 border rounded-xl text-xs sm:text-sm font-medium',
                    hasVideo ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-stone-50 border-stone-200 text-stone-400'
                  ]">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <span>{{ hasVideo ? 'Con video' : 'Sin video' }}</span>
                  </span>
                </div>
              </div>

              <!-- Empty state -->
              <div v-else class="flex-1 flex items-center justify-center px-4 py-8">
                <div class="text-center">
                  <div
                    class="w-10 h-10 sm:w-12 sm:h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6 text-stone-400" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <p class="text-sm text-stone-400">Selecciona un ejercicio para verlo</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-amber-50/40 border-t border-amber-100 px-4 sm:px-6 py-3 flex justify-end flex-shrink-0">
            <button v-motion :hovered="{ scale: 1.03 }" :tapped="{ scale: 0.96 }" :transition="{ duration: 0.15 }"
              @click="emit('close')"
              class="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl px-5 py-2.5 sm:py-2 text-sm font-semibold text-stone-600 bg-white border-2 border-stone-200 hover:border-amber-200 hover:bg-amber-50 transition-all duration-200">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
