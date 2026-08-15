<script setup lang="ts">
import { computed, ref } from 'vue'

interface ExerciseItem {
  id: string
  name: string
  muscle_group: string
  difficulty: string
}

interface AvailableExercise {
  id: string
  name: string
  muscle_group: string
  difficulty: string
}

const showRoutineModal = ref(false)
const showExerciseModal = ref(false)
const selectedRoutineId = ref('')
const exercises = ref<ExerciseItem[]>([])
const exerciseSearchQuery = ref('')
const selectedExercises = ref<Set<string>>(new Set())

const availableExercises = ref<AvailableExercise[]>([
  { id: 'EXR-001', name: 'Press de banca', muscle_group: 'Pecho', difficulty: 'INTERMEDIATE' },
  { id: 'EXR-002', name: 'Sentadilla', muscle_group: 'Piernas', difficulty: 'BEGINNER' },
  { id: 'EXR-003', name: 'Peso muerto', muscle_group: 'Espalda', difficulty: 'ADVANCED' },
  { id: 'EXR-004', name: 'Dominadas', muscle_group: 'Espalda', difficulty: 'INTERMEDIATE' },
  { id: 'EXR-005', name: 'Fondos', muscle_group: 'Pecho', difficulty: 'INTERMEDIATE' },
  { id: 'EXR-006', name: 'Press militar', muscle_group: 'Hombros', difficulty: 'INTERMEDIATE' },
  { id: 'EXR-007', name: 'Curl de bíceps', muscle_group: 'Brazos', difficulty: 'BEGINNER' },
  { id: 'EXR-008', name: 'Remo con barra', muscle_group: 'Espalda', difficulty: 'INTERMEDIATE' },
])

const filteredExercises = computed(() => {
  const q = exerciseSearchQuery.value.toLowerCase().trim()
  if (!q) return availableExercises.value
  return availableExercises.value.filter(
    e => e.name.toLowerCase().includes(q) ||
         e.muscle_group.toLowerCase().includes(q) ||
         e.difficulty.toLowerCase().includes(q)
  )
})

function openRoutineModal() {
  showRoutineModal.value = true
}

function closeRoutineModal() {
  showRoutineModal.value = false
}

function openExerciseModal() {
  selectedExercises.value = new Set(exercises.value.map(e => e.id).filter(Boolean))
  exerciseSearchQuery.value = ''
  showExerciseModal.value = true
}

function closeExerciseModal() {
  showExerciseModal.value = false
}

function toggleExerciseSelection(id: string) {
  const next = new Set(selectedExercises.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedExercises.value = next
}

function confirmExercises() {
  const existingIds = new Set(exercises.value.map(e => e.id).filter(Boolean))
  for (const ex of availableExercises.value) {
    if (selectedExercises.value.has(ex.id) && !existingIds.has(ex.id)) {
      exercises.value.push({ ...ex })
    }
  }
  exercises.value = exercises.value.filter(e => !e.id || selectedExercises.value.has(e.id))
  closeExerciseModal()
}

function removeExercise(index: number) {
  exercises.value.splice(index, 1)
}

function handleOverlayClick(event: MouseEvent, close: () => void) {
  if (event.target === event.currentTarget) close()
}
</script>

<template>
  <div class="min-h-screen bg-stone-100 p-8">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Título -->
      <h1 class="text-2xl font-serif font-bold text-stone-800">
        Crear rutina de miembro
      </h1>

      <!-- Sección Ejercicios -->
      <div class="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div class="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-serif font-bold text-white">Ejercicios</h2>
            <button
              type="button"
              class="px-3 py-1.5 text-sm font-medium text-white bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              @click="openExerciseModal"
            >
              + Agregar
            </button>
          </div>
        </div>
        <div class="px-6 py-4 space-y-3">
          <div
            v-for="(exercise, index) in exercises"
            :key="exercise.id || index"
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: index * 50 } }"
            class="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200"
          >
            <div class="flex-1 grid grid-cols-3 gap-3">
              <input
                v-model="exercise.name"
                type="text"
                placeholder="Nombre del ejercicio"
                class="px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <input
                v-model="exercise.muscle_group"
                type="text"
                placeholder="Grupo muscular"
                class="px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <select
                v-model="exercise.difficulty"
                class="px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="BEGINNER">Principiante</option>
                <option value="INTERMEDIATE">Intermedio</option>
                <option value="ADVANCED">Avanzado</option>
              </select>
            </div>
            <button
              type="button"
              class="p-2 text-stone-400 hover:text-red-500 transition-colors"
              @click="removeExercise(index)"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <p v-if="exercises.length === 0" class="text-stone-400 text-sm text-center py-8">
            No hay ejercicios agregados. Presiona "+ Agregar" para añadir uno.
          </p>
        </div>
      </div>

      <!-- Mensaje motivacional -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }"
        class="text-center py-4"
      >
        <p class="text-stone-500 italic text-sm">
          "Un gran plan se construye ejercicio por ejercicio"
        </p>
      </div>

      <!-- Sección ID de rutina base -->
      <div class="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div class="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
          <h2 class="text-lg font-serif font-bold text-white">ID de rutina base</h2>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div v-if="selectedRoutineId" class="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span class="text-sm font-mono text-amber-800">{{ selectedRoutineId }}</span>
            <button
              type="button"
              class="ml-auto p-1.5 text-amber-400 hover:text-amber-600 transition-colors"
              @click="selectedRoutineId = ''"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            class="w-full px-4 py-3 text-sm font-medium text-stone-600 bg-stone-50 border-2 border-dashed border-stone-300 rounded-xl hover:bg-stone-100 hover:border-orange-400 transition-all duration-200"
            @click="openRoutineModal"
          >
            <span v-if="!selectedRoutineId">Seleccionar rutina base</span>
            <span v-else>Cambiar rutina base</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Seleccionar ejercicios -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showExerciseModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click="handleOverlayClick($event, closeExerciseModal)"
        >
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div
              v-if="showExerciseModal"
              class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
            >
              <!-- Header -->
              <div
                v-motion
                :initial="{ opacity: 0, y: -20 }"
                :enter="{ opacity: 1, y: 0, transition: { duration: 400, ease: [0.16, 1, 0.3, 1] } }"
                class="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 px-6 py-5"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      v-motion
                      :initial="{ scale: 0, rotate: -90 }"
                      :enter="{ scale: 1, rotate: 0, transition: { delay: 150, duration: 400, ease: [0.16, 1, 0.3, 1] } }"
                      class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                    >
                      <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h2
                        v-motion
                        :initial="{ opacity: 0, x: -20 }"
                        :enter="{ opacity: 1, x: 0, transition: { delay: 200, duration: 400 } }"
                        class="text-lg font-serif font-bold text-white"
                      >
                        Seleccionar ejercicios
                      </h2>
                      <p
                        v-motion
                        :initial="{ opacity: 0 }"
                        :enter="{ opacity: 1, transition: { delay: 300, duration: 400 } }"
                        class="text-orange-100 text-xs"
                      >
                        Elige los ejercicios para la rutina del miembro
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    @click="closeExerciseModal"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Search -->
              <div class="px-6 py-4 border-b border-stone-200">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    v-model="exerciseSearchQuery"
                    type="text"
                    placeholder="Buscar por nombre, grupo muscular o dificultad..."
                    class="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-stone-200 bg-stone-50 text-stone-800 placeholder:text-stone-400 transition-all duration-200 focus:outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <!-- Lista de ejercicios -->
              <div class="px-6 py-4 max-h-72 overflow-y-auto space-y-2">
                <div
                  v-for="exercise in filteredExercises"
                  :key="exercise.id"
                  v-motion
                  :initial="{ opacity: 0, x: -12 }"
                  :enter="{ opacity: 1, x: 0, transition: { delay: 50 } }"
                  class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200"
                  :class="selectedExercises.has(exercise.id)
                    ? 'bg-orange-50 border-orange-300'
                    : 'bg-stone-50 border-stone-200 hover:border-orange-200 hover:bg-orange-50/50'"
                  @click="toggleExerciseSelection(exercise.id)"
                >
                  <div
                    class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
                    :class="selectedExercises.has(exercise.id)
                      ? 'bg-orange-500 border-orange-500'
                      : 'border-stone-300'"
                  >
                    <svg v-if="selectedExercises.has(exercise.id)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-stone-800 truncate">{{ exercise.name }}</p>
                    <p class="text-xs text-stone-500">{{ exercise.muscle_group }} · {{ exercise.difficulty }}</p>
                  </div>
                </div>
                <p v-if="filteredExercises.length === 0" class="text-stone-400 text-sm text-center py-8">
                  No se encontraron ejercicios con ese criterio.
                </p>
              </div>

              <!-- Footer -->
              <div class="px-6 py-4 border-t border-stone-200 bg-stone-50 flex justify-end gap-3">
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-stone-700 bg-white border-2 border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all duration-200"
                  @click="closeExerciseModal"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                  @click="confirmExercises"
                >
                  Agregar seleccionados
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Seleccionar rutina base -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showRoutineModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click="handleOverlayClick($event, closeRoutineModal)"
        >
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div
              v-if="showRoutineModal"
              class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
            >
              <div
                v-motion
                :initial="{ opacity: 0, y: -20 }"
                :enter="{ opacity: 1, y: 0, transition: { duration: 400, ease: [0.16, 1, 0.3, 1] } }"
                class="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 px-6 py-5"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      v-motion
                      :initial="{ scale: 0, rotate: -90 }"
                      :enter="{ scale: 1, rotate: 0, transition: { delay: 150, duration: 400, ease: [0.16, 1, 0.3, 1] } }"
                      class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                    >
                      <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h2
                        v-motion
                        :initial="{ opacity: 0, x: -20 }"
                        :enter="{ opacity: 1, x: 0, transition: { delay: 200, duration: 400 } }"
                        class="text-lg font-serif font-bold text-white"
                      >
                        Seleccionar rutina base
                      </h2>
                      <p
                        v-motion
                        :initial="{ opacity: 0 }"
                        :enter="{ opacity: 1, transition: { delay: 300, duration: 400 } }"
                        class="text-orange-100 text-xs"
                      >
                        Elige la plantilla para la rutina del miembro
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    @click="closeRoutineModal"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="px-6 py-8">
                <p class="text-stone-600 text-center">
                  Selecciona una rutina de la lista para usarla como base.
                </p>
              </div>
              <div class="px-6 py-4 border-t border-stone-200 bg-stone-50 flex justify-end gap-3">
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-stone-700 bg-white border-2 border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all duration-200"
                  @click="closeRoutineModal"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
