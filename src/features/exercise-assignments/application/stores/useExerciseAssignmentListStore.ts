import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  ExerciseAssignment,
  ExerciseAssignmentListItem,
} from '../../domain/entities/ExerciseAssignment.types'
import type { ExerciseAssignmentRepository } from '../../domain/repositories/ExerciseAssignmentRepository'
import { ExerciseAssignmentDomainService } from '../../domain/services/ExerciseAssignmentDomainService'
import { HttpExerciseAssignmentRepository } from '../../infrastructure/http/HttpExerciseAssignmentRepository'
import { useAssignmentEquipmentCatalogStore } from './useAssignmentEquipmentCatalogStore'
import { useAssignmentExerciseCatalogStore } from './useAssignmentExerciseCatalogStore'
import { useAssignmentUserCatalogStore } from './useAssignmentUserCatalogStore'

export const useExerciseAssignmentListStore = defineStore('exerciseAssignmentList', () => {
  const repository: ExerciseAssignmentRepository = new HttpExerciseAssignmentRepository()
  const assignments = ref<ExerciseAssignment[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const deleteError = ref<string | null>(null)

  const cards = computed<ExerciseAssignmentListItem[]>(() => {
    const userStore = useAssignmentUserCatalogStore()
    const exerciseStore = useAssignmentExerciseCatalogStore()
    const equipmentStore = useAssignmentEquipmentCatalogStore()

    return assignments.value.map((assignment, index) =>
      ExerciseAssignmentDomainService.toListItem(
        assignment,
        index,
        userStore.users,
        exerciseStore.exercises,
        equipmentStore.equipment,
      ),
    )
  })

  const filteredCards = computed(() =>
    ExerciseAssignmentDomainService.filterListItems(cards.value, searchQuery.value),
  )

  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  async function fetchAssignments(): Promise<void> {
    const userStore = useAssignmentUserCatalogStore()
    const exerciseStore = useAssignmentExerciseCatalogStore()
    const equipmentStore = useAssignmentEquipmentCatalogStore()

    isLoading.value = true
    error.value = null

    try {
      assignments.value = await repository.findAll()
      await Promise.allSettled([
        userStore.users.length === 0 ? userStore.fetchUsers() : Promise.resolve(),
        exerciseStore.exercises.length === 0 ? exerciseStore.fetchExercises() : Promise.resolve(),
        equipmentStore.equipment.length === 0 ? equipmentStore.fetchEquipment() : Promise.resolve(),
      ])
    } catch (err: unknown) {
      assignments.value = []
      error.value = err instanceof Error
        ? err.message
        : ExerciseAssignmentDomainService.listErrorMessage()
    } finally {
      isLoading.value = false
    }
  }

  async function deleteAssignment(id: string): Promise<boolean> {
    deleteError.value = null
    try {
      await repository.delete(id)
      assignments.value = assignments.value.filter((item) => item.id !== id)
      return true
    } catch (err: unknown) {
      deleteError.value = err instanceof Error
        ? err.message
        : ExerciseAssignmentDomainService.deleteErrorMessage()
      return false
    }
  }

  function clearDeleteError(): void {
    deleteError.value = null
  }

  return {
    assignments,
    isLoading,
    error,
    deleteError,
    searchQuery,
    cards,
    filteredCards,
    fetchAssignments,
    setSearchQuery,
    deleteAssignment,
    clearDeleteError,
  }
})
