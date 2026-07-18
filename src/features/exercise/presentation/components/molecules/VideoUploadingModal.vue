<script setup lang="ts">
import { computed } from 'vue'
import type { ExerciseVideoUploadState } from '../../application/composables/useExerciseVideoUpload'

const props = defineProps<{
  state: ExerciseVideoUploadState
  fileName?: string
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const formattedPercentage = computed(() => `${props.state.progress.percentage}%`)

const formattedSize = computed(() => {
  const { loaded, total } = props.state.progress
  if (total === 0) return '—'
  return `${formatBytes(loaded)} / ${formatBytes(total)}`
})

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="state.phase === 'uploading'"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />

        <!-- Modal -->
        <div
          class="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20 border border-amber-200/60"
          v-motion
          :initial="{ opacity: 0, scale: 0.95, y: 10 }"
          :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 250, ease: [0.16, 1, 0.3, 1] } }"
        >
          <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

          <!-- Header -->
          <div class="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5 text-center">
            <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <svg class="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
            <h2 class="font-serif text-lg font-bold text-white">Subiendo video</h2>
            <p class="text-xs text-amber-100/80 mt-1">Tu video se está almacenando en Supabase</p>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-5">
            <!-- File info -->
            <div v-if="fileName" class="flex items-center gap-3 bg-amber-50/60 border border-amber-200 rounded-2xl px-4 py-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-sm shadow-amber-300/30">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-stone-800 truncate">{{ fileName }}</p>
                <p class="text-xs text-stone-400">{{ formattedSize }}</p>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-stone-500">Progreso</span>
                <span class="text-sm font-bold text-amber-600">{{ formattedPercentage }}</span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 ease-out"
                  :style="{ width: `${state.progress.percentage}%` }"
                />
              </div>
            </div>

            <!-- Tip -->
            <div class="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
              <svg class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-xs text-blue-700 leading-relaxed">
                No cierres esta ventana mientras se completa la subida.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-stone-50/60 border-t border-stone-100 flex justify-center">
            <button
              @click="emit('cancel')"
              class="inline-flex items-center gap-2 border-2 border-stone-200 text-stone-500 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar subida
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
