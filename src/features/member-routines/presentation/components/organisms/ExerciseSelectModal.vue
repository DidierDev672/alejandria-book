<script setup lang="ts">
// ============================================================
// ORGANISM - Exercise Select Modal (multi-selección + preview de video)
// ============================================================

import { ref, computed, watch } from 'vue'
import { useExerciseCatalogStore } from '../../../application/stores/useExerciseCatalogStore'
import type { Exercise } from '../../../domain/entities/Exercise.types'
import ExerciseListItem from '../molecules/ExerciseListItem.vue'
import CustomVideoPlayer from '@/utils/components/CustomVideoPlayer.vue'

const props = defineProps<{
  visible: boolean
  /** IDs de los ejercicios ya asignados a la rutina, para preseleccionarlos */
  selectedIds?: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', exercises: Exercise[]): void
}>()

const catalogStore = useExerciseCatalogStore()

const pendingSelection = ref<Map<string, Exercise>>(new Map())
const previewExerciseId = ref<string | null>(null)
const searchQuery = ref('')

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const filteredExercises = computed(() => {
  const query = normalizeText(searchQuery.value)
  if (!query) return catalogStore.activeExercises

  return catalogStore.activeExercises.filter((exercise) => {
    return (
      normalizeText(exercise.name).includes(query) ||
      normalizeText(exercise.muscleGroup).includes(query) ||
      normalizeText(exercise.equipmentId).includes(query) ||
      normalizeText(exercise.difficulty).includes(query) ||
      normalizeText(exercise.id).includes(query)
    )
  })
})

const hasSearchResults = computed(() => filteredExercises.value.length > 0)
const isSearching = computed(() => searchQuery.value.trim().length > 0)

// Al abrir: cargar catálogo y preseleccionar los ejercicios ya asignados
watch(
  () => props.visible,
  (isVisible) => {
    if (!isVisible) return
    previewExerciseId.value = null
    searchQuery.value = ''

    catalogStore.fetchExercises().then(() => {
      const preselected = new Map<string, Exercise>()
      const ids = new Set(props.selectedIds ?? [])
      for (const exercise of catalogStore.activeExercises) {
        if (ids.has(exercise.id)) preselected.set(exercise.id, exercise)
      }
      pendingSelection.value = preselected
    })
  },
)

function toggleExercise(exercise: Exercise) {
  const next = new Map(pendingSelection.value)
  if (next.has(exercise.id)) {
    next.delete(exercise.id)
  } else {
    next.set(exercise.id, exercise)
  }
  pendingSelection.value = next
}

function togglePreview(exerciseId: string) {
  previewExerciseId.value = previewExerciseId.value === exerciseId ? null : exerciseId
}

function confirmSelection() {
  emit('confirm', Array.from(pendingSelection.value.values()))
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div
          class="w-full max-w-xl bg-white rounded-2xl border border-amber-200 shadow-2xl
                 flex flex-col max-h-[85vh] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exercise-select-title"
        >
          <!-- ══════════ Header ══════════ -->
          <div class="px-6 py-4 border-b border-amber-100 flex items-center justify-between shrink-0">
            <div>
              <h2 id="exercise-select-title" class="text-lg font-semibold font-serif text-stone-900">
                Seleccionar ejercicios
              </h2>
              <p class="text-xs text-stone-400 mt-0.5">
                Elige uno o varios ejercicios del catálogo del Coliseo
              </p>
            </div>
            <button
              type="button"
              @click="emit('close')"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400
                     hover:bg-amber-50 hover:text-stone-600 transition-colors"
              aria-label="Cerrar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- ══════════ Search ══════════ -->
          <div
            v-if="!catalogStore.isLoading && catalogStore.hasExercises"
            class="px-6 py-3 border-b border-amber-100 shrink-0"
          >
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Buscar por nombre, músculo, equipo o dificultad..."
                class="w-full pl-10 pr-4 py-2.5 bg-amber-50/40 border border-amber-200/60 rounded-xl
                       text-sm text-stone-700 placeholder-stone-400
                       focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400
                       focus:bg-white transition-all duration-200"
              />
            </div>
            <p v-if="isSearching" class="text-xs text-stone-400 mt-2">
              {{ filteredExercises.length }} resultado{{ filteredExercises.length === 1 ? '' : 's' }}
            </p>
          </div>

          <!-- ══════════ Body ══════════ -->
          <div class="flex-1 overflow-y-auto">
            <!-- Loading -->
            <div v-if="catalogStore.isLoading" class="flex items-center justify-center py-12">
              <div class="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
              <span class="ml-3 text-sm text-stone-500">Cargando ejercicios...</span>
            </div>

            <!-- Error -->
            <div v-else-if="catalogStore.hasError" class="m-4 bg-red-50 border border-red-200 rounded-xl p-5">
              <p class="text-sm font-medium text-red-700">{{ catalogStore.error }}</p>
              <button
                type="button"
                @click="catalogStore.fetchExercises()"
                class="mt-2 text-xs font-medium text-amber-700 hover:underline"
              >
                Reintentar
              </button>
            </div>

            <!-- Empty catalog -->
            <div
              v-else-if="!catalogStore.hasExercises"
              class="flex flex-col items-center justify-center py-12 text-center px-6"
            >
              <div class="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-base font-semibold font-serif text-stone-700 mb-1">
                No hay ejercicios registrados
              </h3>
              <p class="text-sm text-stone-400 max-w-xs">
                Registra ejercicios en el catálogo del Coliseo para poder asignarlos.
              </p>
            </div>

            <!-- Empty search results -->
            <div
              v-else-if="!hasSearchResults"
              class="flex flex-col items-center justify-center py-12 text-center px-6"
            >
              <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p class="text-sm font-semibold text-stone-700 mb-1">Sin resultados</p>
              <p class="text-xs text-stone-400">
                Ningún ejercicio coincide con "{{ searchQuery.trim() }}"
              </p>
            </div>

            <!-- List -->
            <ul v-else class="divide-y divide-amber-50">
              <template v-for="exercise in filteredExercises" :key="exercise.id">
                <ExerciseListItem
                  :exercise="exercise"
                  :selected="pendingSelection.has(exercise.id)"
                  :previewing="previewExerciseId === exercise.id"
                  @toggle="toggleExercise(exercise)"
                  @preview="togglePreview(exercise.id)"
                />
                <li v-if="previewExerciseId === exercise.id" class="px-4 pb-4 bg-stone-50">
                  <CustomVideoPlayer :video-src="exercise.videoUrl" />
                </li>
              </template>
            </ul>
          </div>

          <!-- ══════════ Footer ══════════ -->
          <div class="px-6 py-4 bg-amber-50/60 border-t border-amber-100
                      flex items-center justify-between gap-3 shrink-0">
            <p class="text-xs text-stone-500">
              <template v-if="pendingSelection.size > 0">
                <span class="font-semibold text-stone-700">{{ pendingSelection.size }}</span>
                ejercicio{{ pendingSelection.size === 1 ? '' : 's' }} seleccionado{{ pendingSelection.size === 1 ? '' : 's' }}
              </template>
              <template v-else>Ningún ejercicio seleccionado</template>
            </p>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="emit('close')"
                class="border border-amber-600 text-amber-700 hover:bg-amber-50
                       text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                @click="confirmSelection"
                :disabled="pendingSelection.size === 0"
                class="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium
                       px-4 py-2 rounded-lg transition-colors shadow-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar seleccionados
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
