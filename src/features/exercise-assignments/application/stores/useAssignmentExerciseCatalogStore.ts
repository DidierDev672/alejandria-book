import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CatalogExercise } from '../../domain/entities/ExerciseAssignment.types'
import type { ExerciseCatalogRepository } from '../../domain/repositories/ExerciseCatalogRepository'
import { ExerciseAssignmentDomainService } from '../../domain/services/ExerciseAssignmentDomainService'
import { HttpExerciseCatalogRepository } from '../../infrastructure/http/HttpExerciseCatalogRepository'

export const useAssignmentExerciseCatalogStore = defineStore('assignmentExerciseCatalog', () => {
  const repository: ExerciseCatalogRepository = new HttpExerciseCatalogRepository()
  const exercises = ref<CatalogExercise[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  const filteredExercises = computed(() =>
    ExerciseAssignmentDomainService.filterExercises(exercises.value, searchQuery.value),
  )

  async function fetchExercises(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      exercises.value = await repository.findAll()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Error al cargar ejercicios'
    } finally {
      isLoading.value = false
    }
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  function findByIds(ids: string[]): CatalogExercise[] {
    const idSet = new Set(ids)
    return exercises.value.filter((exercise) => idSet.has(exercise.id))
  }

  return {
    exercises,
    isLoading,
    error,
    searchQuery,
    filteredExercises,
    fetchExercises,
    setSearchQuery,
    findByIds,
  }
})
