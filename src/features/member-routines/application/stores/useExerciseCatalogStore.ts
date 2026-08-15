// ============================================================
// APPLICATION STORE - Exercise Catalog Pinia Store
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { HttpExerciseRepository } from '../../infrastructure/http/HttpExerciseRepository'
import type { Exercise } from '../../domain/entities/Exercise.types'

export const useExerciseCatalogStore = defineStore('exerciseCatalog', () => {
  // ============================================================
  // STATE
  // ============================================================

  const exercises = ref<Exercise[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ============================================================
  // REPOSITORY (adapter inyectado en el composition root)
  // ============================================================

  const repository = new HttpExerciseRepository()

  // ============================================================
  // GETTERS
  // ============================================================

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  // Solo se ofrecen ejercicios activos como base de asignación
  const activeExercises = computed(() =>
    exercises.value.filter((exercise) => exercise.status === 'active'),
  )
  const hasExercises = computed(() => activeExercises.value.length > 0)

  // ============================================================
  // ACTIONS
  // ============================================================

  async function fetchExercises(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const result = await repository.findAll()
      exercises.value = result.items
    } catch (e: any) {
      error.value = e.message || 'Error al cargar los ejercicios'
      console.error('[ExerciseCatalogStore] Error fetching exercises:', e)
    } finally {
      loading.value = false
    }
  }

  // ============================================================
  // EXPOSED API
  // ============================================================

  return {
    // State
    exercises,
    loading,
    error,

    // Getters
    isLoading,
    hasError,
    activeExercises,
    hasExercises,

    // Actions
    fetchExercises,
  }
})
