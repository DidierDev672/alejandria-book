import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CatalogEquipment } from '../../domain/entities/ExerciseAssignment.types'
import type { EquipmentCatalogRepository } from '../../domain/repositories/EquipmentCatalogRepository'
import { ExerciseAssignmentDomainService } from '../../domain/services/ExerciseAssignmentDomainService'
import { HttpEquipmentCatalogRepository } from '../../infrastructure/http/HttpEquipmentCatalogRepository'

export const useAssignmentEquipmentCatalogStore = defineStore('assignmentEquipmentCatalog', () => {
  const repository: EquipmentCatalogRepository = new HttpEquipmentCatalogRepository()
  const equipment = ref<CatalogEquipment[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  const filteredEquipment = computed(() =>
    ExerciseAssignmentDomainService.filterEquipment(equipment.value, searchQuery.value),
  )

  async function fetchEquipment(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      equipment.value = await repository.findAll()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Error al cargar equipos'
    } finally {
      isLoading.value = false
    }
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  function findByIds(ids: string[]): CatalogEquipment[] {
    const idSet = new Set(ids)
    return equipment.value.filter((item) => idSet.has(item.id))
  }

  return {
    equipment,
    isLoading,
    error,
    searchQuery,
    filteredEquipment,
    fetchEquipment,
    setSearchQuery,
    findByIds,
  }
})
