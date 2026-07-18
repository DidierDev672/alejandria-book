<script setup>
import { computed } from 'vue'
import CustomVideoPlayer from '@/utils/components/CustomVideoPlayer.vue'
import ExerciseVideoCard from '@/features/exercise/presentation/components/molecules/ExerciseVideoCard.vue'

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
        :transition="{ duration: 0.25 }" class="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
        @click="emit('close')" />

      <div class="flex min-h-full items-center justify-center p-4">
        <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 20 }" :enter="{ opacity: 1, scale: 1, y: 0 }"
          :leave="{ opacity: 0, scale: 0.95, y: 20 }" :transition="{ duration: 0.3, ease: 'easeOut' }"
          class="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20 flex flex-col">

          <!-- Accent line -->
          <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

          <!-- Header -->
          <div class="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="rounded-xl bg-white/20 p-2">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-serif text-lg font-bold text-white">Ejercicios del Equipo</h3>
                <p class="text-amber-100 text-xs">{{ exercises.length }} ejercicio{{ exercises.length !== 1 ? 's' : '' }} disponible{{ exercises.length !== 1 ? 's' : '' }}</p>
              </div>
            </div>
            <button @click="emit('close')"
              class="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body: Sidebar + Video -->
          <div class="flex-1 flex min-h-0 overflow-hidden">
            <!-- Sidebar: Exercise list -->
            <div class="w-72 flex-shrink-0 border-r border-stone-100 overflow-y-auto bg-stone-50/50 p-3 space-y-1.5">
              <ExerciseVideoCard
                v-for="exercise in exercises"
                :key="exercise.id"
                :exercise="exercise"
                :is-selected="selectedExercise?.id === exercise.id"
                :muscle-group-info="getMuscleGroupInfo(exercise.muscle_group)"
                :difficulty-info="getDifficultyInfo(exercise.difficulty)"
                @select="emit('select', exercise)"
              />
            </div>

            <!-- Main: Video + Info -->
            <div class="flex-1 flex flex-col min-w-0 overflow-y-auto">
              <!-- Video Area -->
              <div v-if="selectedExercise" class="flex-shrink-0">
                <div v-if="hasVideo" class="aspect-video bg-stone-950">
                  <CustomVideoPlayer :video-src="videoSrc" />
                </div>
                <!-- No video placeholder -->
                <div v-else class="aspect-video bg-gradient-to-br from-stone-100 to-stone-50 flex flex-col items-center justify-center">
                  <div class="w-16 h-16 bg-stone-200/60 rounded-full flex items-center justify-center mb-3">
                    <svg class="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <p class="text-sm font-medium text-stone-400">Sin video disponible</p>
                  <p class="text-xs text-stone-300 mt-1">Este ejercicio no tiene video asociado</p>
                </div>
              </div>

              <!-- Exercise Info -->
              <div v-if="selectedExercise" v-motion
                :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
                :transition="{ delay: 0.1 }"
                class="flex-shrink-0 px-6 py-5 space-y-4 border-t border-stone-100">

                <!-- Name -->
                <h4 class="font-serif text-xl font-bold text-stone-800">{{ selectedExercise.name }}</h4>

                <!-- Badges -->
                <div class="flex items-center gap-2.5 flex-wrap">
                  <!-- Muscle Group Badge -->
                  <span v-if="muscleGroupInfo" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-sm font-medium text-amber-700">
                    <span>{{ muscleGroupInfo.icon }}</span>
                    <span>{{ muscleGroupInfo.label }}</span>
                  </span>

                  <!-- Difficulty Badge -->
                  <span v-if="difficultyInfo" :class="['inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-sm font-medium', difficultyInfo.colorClass]">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>{{ difficultyInfo.label }}</span>
                  </span>

                  <!-- Video status badge -->
                  <span :class="[
                    'inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-sm font-medium',
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
              <div v-else class="flex-1 flex items-center justify-center">
                <div class="text-center">
                  <div class="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div class="bg-amber-50/40 border-t border-amber-100 px-6 py-3 flex justify-end flex-shrink-0">
            <button @click="emit('close')"
              class="inline-flex justify-center items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-stone-600 bg-white border-2 border-stone-200 hover:border-amber-200 hover:bg-amber-50 transition-all duration-200 active:scale-95">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
