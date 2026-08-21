import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CatalogUser } from '../../domain/entities/ExerciseAssignment.types'
import type { UserCatalogRepository } from '../../domain/repositories/UserCatalogRepository'
import { ExerciseAssignmentDomainService } from '../../domain/services/ExerciseAssignmentDomainService'
import { HttpUserCatalogRepository } from '../../infrastructure/http/HttpUserCatalogRepository'

export const useAssignmentUserCatalogStore = defineStore('assignmentUserCatalog', () => {
  const repository: UserCatalogRepository = new HttpUserCatalogRepository()
  const users = ref<CatalogUser[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  const filteredUsers = computed(() =>
    ExerciseAssignmentDomainService.filterUsers(users.value, searchQuery.value),
  )

  async function fetchUsers(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      users.value = await repository.findAll()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Error al cargar usuarios'
    } finally {
      isLoading.value = false
    }
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  function findById(id: string): CatalogUser | undefined {
    return users.value.find((user) => user.id === id)
  }

  return {
    users,
    isLoading,
    error,
    searchQuery,
    filteredUsers,
    fetchUsers,
    setSearchQuery,
    findById,
  }
})
