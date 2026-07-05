import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosEquipment from '@/features/maintenance/infrastructure/http/axiosEquipment'

// ============================================================
// INTERFACES / TYPES
// ============================================================

export interface Equipment {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive' | 'pending'
  lastMaintenance: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateEquipmentDTO {
  name: string
  type: string
  status: 'active' | 'inactive' | 'pending'
  lastMaintenance: string
}

export interface UpdateEquipmentDTO {
  name?: string
  type?: string
  status?: 'active' | 'inactive' | 'pending'
  lastMaintenance?: string
}

export interface EquipmentFilters {
  search?: string
  type?: string
  status?: string
}

// ============================================================
// STORE DEFINITION
// ============================================================

export const useEquipmentStore = defineStore('maintenance-equipment', () => {
  // ==========================================================
  // STATE (Variables Reactivas)
  // ==========================================================

  const equipments = ref<Equipment[]>([])
  const selectedEquipment = ref<Equipment | null>(null)
  const loading = ref(false)
  const loadingStates = ref<Record<string, boolean>>({})
  const error = ref<string | null>(null)
  const validationErrors = ref<Record<string, string[]>>({})

  // ==========================================================
  // GETTERS (Computed)
  // ==========================================================

  const totalEquipments = computed(() => equipments.value.length)
  const hasEquipments = computed(() => equipments.value.length > 0)
  const isLoading = computed(() => loading.value)
  const isOperationLoading = (operationId: string) =>
    computed(() => loadingStates.value[operationId] || false)
  const hasError = computed(() => error.value !== null)

  const activeEquipments = computed(() =>
    equipments.value.filter((eq) => eq.status === 'active'),
  )

  const equipmentsNeedingMaintenance = computed(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return equipments.value.filter((eq) => {
      const lastMaint = new Date(eq.lastMaintenance)
      return lastMaint < thirtyDaysAgo
    })
  })

  // ==========================================================
  // ACTIONS
  // ==========================================================

  async function fetchEquipments(filters: EquipmentFilters = {}): Promise<void> {
    loadingStates.value['fetchEquipments'] = true
    loading.value = true
    error.value = null

    try {
      const { data } = await axiosEquipment.get<Equipment[]>('', { params: filters })

      equipments.value = Array.isArray(data) ? data : []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar equipos'
      error.value = message
      console.error('[EquipmentStore] fetchEquipments error:', err)
      throw err
    } finally {
      loadingStates.value['fetchEquipments'] = false
      loading.value = false
    }
  }

  async function fetchEquipmentById(id: string): Promise<Equipment> {
    loadingStates.value[`fetchEquipment-${id}`] = true
    error.value = null

    try {
      const { data } = await axiosEquipment.get<Equipment>(`/${id}`)
      selectedEquipment.value = data
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : `Error al cargar equipo ${id}`
      error.value = message
      console.error('[EquipmentStore] fetchEquipmentById error:', err)
      throw err
    } finally {
      loadingStates.value[`fetchEquipment-${id}`] = false
    }
  }

  async function createEquipment(equipmentData: CreateEquipmentDTO): Promise<Equipment> {
    loadingStates.value['createEquipment'] = true
    loading.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const { data } = await axiosEquipment.post<Equipment>('', equipmentData)
      equipments.value.unshift(data)
      return data
    } catch (err) {
      const enhancedError = err as any
      if (enhancedError.errors) {
        validationErrors.value = enhancedError.errors
      }
      const message = enhancedError.message || 'Error al crear equipo'
      error.value = message
      console.error('[EquipmentStore] createEquipment error:', err)
      throw err
    } finally {
      loadingStates.value['createEquipment'] = false
      loading.value = false
    }
  }

  async function updateEquipment(id: string, updateData: UpdateEquipmentDTO): Promise<Equipment> {
    loadingStates.value[`updateEquipment-${id}`] = true
    error.value = null
    validationErrors.value = {}

    try {
      const { data } = await axiosEquipment.put<Equipment>(`/${id}`, updateData)

      const index = equipments.value.findIndex((eq) => eq.id === id)
      if (index !== -1) {
        equipments.value[index] = data
      }

      if (selectedEquipment.value?.id === id) {
        selectedEquipment.value = data
      }

      return data
    } catch (err) {
      const enhancedError = err as any
      if (enhancedError.errors) {
        validationErrors.value = enhancedError.errors
      }
      const message = enhancedError.message || `Error al actualizar equipo ${id}`
      error.value = message
      console.error('[EquipmentStore] updateEquipment error:', err)
      throw err
    } finally {
      loadingStates.value[`updateEquipment-${id}`] = false
    }
  }

  async function deleteEquipment(id: string): Promise<void> {
    loadingStates.value[`deleteEquipment-${id}`] = true
    error.value = null

    try {
      await axiosEquipment.delete(`/${id}`)
      equipments.value = equipments.value.filter((eq) => eq.id !== id)

      if (selectedEquipment.value?.id === id) {
        selectedEquipment.value = null
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : `Error al eliminar equipo ${id}`
      error.value = message
      console.error('[EquipmentStore] deleteEquipment error:', err)
      throw err
    } finally {
      loadingStates.value[`deleteEquipment-${id}`] = false
    }
  }

  function selectEquipment(equipment: Equipment | null): void {
    selectedEquipment.value = equipment
  }

  function clearErrors(): void {
    error.value = null
    validationErrors.value = {}
  }

  function resetStore(): void {
    equipments.value = []
    selectedEquipment.value = null
    loading.value = false
    loadingStates.value = {}
    error.value = null
    validationErrors.value = {}
  }

  return {
    equipments,
    selectedEquipment,
    loading,
    loadingStates,
    error,
    validationErrors,
    totalEquipments,
    hasEquipments,
    isLoading,
    isOperationLoading,
    hasError,
    activeEquipments,
    equipmentsNeedingMaintenance,
    fetchEquipments,
    fetchEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    selectEquipment,
    clearErrors,
    resetStore,
  }
})
