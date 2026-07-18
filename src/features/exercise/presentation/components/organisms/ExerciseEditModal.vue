<script setup lang="ts">
import { ref, watch } from 'vue'
import CustomVideoPlayer from '@/utils/components/CustomVideoPlayer.vue'
import { useExerciseEdit } from '@/features/exercise/application/composables/useExerciseEdit'
import type { Exercise } from '@/features/exercise/infrastructure/services/exerciseService'

const props = defineProps<{
  exercise?: Exercise
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const {
  state,
  muscleGroupOptions,
  difficultyOptions,
  currentVideoUrl,
  hasVideo,
  isFormValid,
  getMuscleGroupBadgeStyle,
  getDifficultyBadgeStyle,
  getDifficultyLabel,
  openModal,
  closeModal,
  onVideoFileChange,
  removeVideoFile,
  saveExercise,
} = useExerciseEdit()

const fileInputRef = ref<HTMLInputElement | null>(null)

watch(() => props.exercise, (ex) => {
  if (ex) openModal(ex)
})

const handleClose = () => {
  closeModal()
  emit('close')
}

const handleSave = () => {
  saveExercise(() => emit('saved'))
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="state.isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="handleClose"
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1 }"
          :leave="{ opacity: 0 }"
        />

        <!-- Modal Panel -->
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.9, y: 30 }"
          :enter="{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }"
          :leave="{ opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }"
          class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden z-10"
        >
          <!-- Header -->
          <div
            class="sticky top-0 bg-white/80 backdrop-blur-md border-b border-stone-100 px-6 py-4 flex items-center justify-between"
            v-motion
            :initial="{ opacity: 0, y: -10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-stone-800">Editar Ejercicio</h2>
                <p class="text-xs text-stone-400">Actualiza la informacion del ejercicio</p>
              </div>
            </div>
            <button
              @click="handleClose"
              class="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all duration-200 active:scale-95"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
            <!-- Error -->
            <div
              v-if="state.error"
              v-motion
              :initial="{ opacity: 0, y: -10 }"
              :enter="{ opacity: 1, y: 0 }"
              class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            >
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ state.error }}
            </div>

            <!-- Nombre -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 15 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.05 } }"
            >
              <label class="block text-sm font-semibold text-stone-600 mb-2">
                Nombre del Ejercicio
              </label>
              <input
                v-model="state.form.name"
                type="text"
                class="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-200 text-stone-800 placeholder-stone-300"
                placeholder="Ej: Press de banca con barra"
              />
            </div>

            <!-- Grupo Muscular + Dificultad -->
            <div
              class="grid grid-cols-2 gap-4"
              v-motion
              :initial="{ opacity: 0, y: 15 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
            >
              <div>
                <label class="block text-sm font-semibold text-stone-600 mb-2">
                  Grupo Muscular
                </label>
                <select
                  v-model="state.form.muscle_group"
                  class="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-200 text-stone-800 bg-white appearance-none"
                  style="background-image: url(&quot;data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e&quot;); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-right: 2.5rem;"
                >
                  <option value="">Seleccionar...</option>
                  <option v-for="group in muscleGroupOptions" :key="group" :value="group">{{ group }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-stone-600 mb-2">
                  Dificultad
                </label>
                <select
                  v-model="state.form.difficulty"
                  class="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-200 text-stone-800 bg-white appearance-none"
                  style="background-image: url(&quot;data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e&quot;); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-right: 2.5rem;"
                >
                  <option v-for="opt in difficultyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </div>
            </div>

            <!-- Video -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 15 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.15 } }"
            >
              <label class="block text-sm font-semibold text-stone-600 mb-3">
                Video del Ejercicio
              </label>

              <!-- Video Preview -->
              <div v-if="hasVideo" class="space-y-3">
                <div class="aspect-video rounded-xl overflow-hidden border border-stone-200 bg-stone-50 shadow-inner">
                  <CustomVideoPlayer
                    :video-src="currentVideoUrl"
                  />
                </div>

                <div class="flex gap-2">
                  <button
                    @click="triggerFileInput"
                    class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200 rounded-xl hover:from-amber-100 hover:to-orange-100 hover:border-amber-300 transition-all duration-200 text-sm font-medium active:scale-[0.98]"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Cambiar video
                  </button>
                  <button
                    @click="removeVideoFile"
                    class="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-50 text-stone-500 border border-stone-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 text-sm font-medium active:scale-[0.98]"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Quitar
                  </button>
                </div>
              </div>

              <!-- Empty State -->
              <div
                v-else
                class="border-2 border-dashed border-stone-200 rounded-xl p-10 text-center hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-300 cursor-pointer group"
                @click="triggerFileInput"
              >
                <div class="w-16 h-16 rounded-2xl bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                  <svg class="w-8 h-8 text-stone-300 group-hover:text-amber-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-sm font-medium text-stone-500 group-hover:text-stone-700 transition-colors">Sin video asociado</p>
                <p class="text-xs text-stone-400 mt-1">Haz clic para subir un video desde tu dispositivo</p>
              </div>
            </div>

            <!-- Badges Preview -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 15 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
              class="flex items-center gap-3 pt-4 border-t border-stone-100"
            >
              <span class="text-xs text-stone-400 font-medium">Vista previa:</span>
              <span
                v-motion
                :key="'mg-' + state.form.muscle_group"
                :initial="{ scale: 0.8, opacity: 0 }"
                :enter="{ scale: 1, opacity: 1 }"
                :class="[
                  'px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r shadow-md',
                  getMuscleGroupBadgeStyle(state.form.muscle_group)
                ]"
              >
                {{ state.form.muscle_group || 'Sin grupo' }}
              </span>
              <span
                v-motion
                :key="'df-' + state.form.difficulty"
                :initial="{ scale: 0.8, opacity: 0 }"
                :enter="{ scale: 1, opacity: 1 }"
                :class="[
                  'px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r shadow-md',
                  getDifficultyBadgeStyle(state.form.difficulty)
                ]"
              >
                {{ getDifficultyLabel(state.form.difficulty) }}
              </span>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-stone-100 px-6 py-4 flex items-center justify-between"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 0.25 } }"
          >
            <p v-if="state.hasChanges" class="text-xs text-amber-600 font-medium flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cambios sin guardar
            </p>
            <div v-else />

            <div class="flex gap-3">
              <button
                @click="handleClose"
                class="px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-all duration-200 active:scale-[0.97]"
              >
                Cancelar
              </button>
              <button
                @click="handleSave"
                :disabled="!isFormValid || state.isSaving || state.isUploading"
                :class="[
                  'px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 active:scale-[0.97]',
                  isFormValid && !state.isSaving && !state.isUploading
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40'
                    : 'bg-stone-300 cursor-not-allowed'
                ]"
              >
                <span v-if="state.isSaving || state.isUploading" class="flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {{ state.isUploading ? 'Subiendo video...' : 'Guardando...' }}
                </span>
                <span v-else class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Cambios
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Hidden file input -->
        <input
          ref="fileInputRef"
          type="file"
          accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
          class="hidden"
          @change="onVideoFileChange"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
