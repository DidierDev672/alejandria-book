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
  page?: number
  limit?: number
}

interface EquipmentApiResponse {
  data: Equipment[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ============================================================
// STORE DEFINITION
// ============================================================

export const useEquipmentStore = defineStore('equipment', () => {
  // ==========================================================
  // STATE (Variables Reactivas)
  // ==========================================================

  /** Lista de equipos */
  const equipments = ref<Equipment[]>([])

  /** Equipo seleccionado (para edición/detalle) */
  const selectedEquipment = ref<Equipment | null>(null)

  /** Estado de carga global */
  const loading = ref(false)

  /** Estado de carga específico para operaciones individuales */
  const loadingStates = ref<Record<string, boolean>>({})

  /** Error general de la store */
  const error = ref<string | null>(null)

  /** Errores de validación por campo */
  const validationErrors = ref<Record<string, string[]>>({})

  /** Metadata de paginación */
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  // ==========================================================
  // GETTERS (Computed)
  // ==========================================================

  /** Total de equipos */
  const totalEquipments = computed(() => pagination.value.total)

  /** Hay equipos disponibles */
  const hasEquipments = computed(() => equipments.value.length > 0)

  /** Está cargando alguna operación */
  const isLoading = computed(() => loading.value)

  /** Verificar si una operación específica está cargando */
  const isOperationLoading = (operationId: string) =>
    computed(() => loadingStates.value[operationId] || false)

  /** Hay error activo */
  const hasError = computed(() => error.value !== null)

  /** Equipos filtrados por status activo */
  const activeEquipments = computed(() =>
    equipments.value.filter((eq) => eq.status === 'active'),
  )

  /** Equipos que necesitan mantenimiento (último mantenimiento > 30 días) */
  const equipmentsNeedingMaintenance = computed(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return equipments.value.filter((eq) => {
      const lastMaint = new Date(eq.lastMaintenance)
      return lastMaint < thirtyDaysAgo
    })
  })

  // ==========================================================
  // ACTIONS (Métodos Asíncronos)
  // ==========================================================

  /**
   * Obtener lista de equipos con filtros opcionales
   * @param filters - Filtros de búsqueda y paginación
   */
  async function fetchEquipments(filters: EquipmentFilters = {}): Promise<void> {
    const operationId = 'fetchEquipments'

    loadingStates.value[operationId] = true
    loading.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const { data } = await axiosEquipment.get<EquipmentApiResponse>('', {
        params: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          search: filters.search,
          type: filters.type,
          status: filters.status,
        },
      })

      equipments.value = data.data
      pagination.value = data.meta
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar equipos'
      error.value = message
      console.error('[EquipmentStore] fetchEquipments error:', err)
      throw err
    } finally {
      loadingStates.value[operationId] = false
      loading.value = false
    }
  }

  /**
   * Obtener un equipo por ID
   * @param id - ID del equipo
   */
  async function fetchEquipmentById(id: string): Promise<Equipment> {
    const operationId = `fetchEquipment-${id}`

    loadingStates.value[operationId] = true
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
      loadingStates.value[operationId] = false
    }
  }

  /**
   * Crear un nuevo equipo
   * @param equipmentData - Datos del equipo a crear
   */
  async function createEquipment(equipmentData: CreateEquipmentDTO): Promise<Equipment> {
    const operationId = 'createEquipment'

    loadingStates.value[operationId] = true
    loading.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const { data } = await axiosEquipment.post<Equipment>('', equipmentData)

      // Agregar a la lista local si está en la primera página
      if (pagination.value.page === 1) {
        equipments.value.unshift(data)
        // Mantener el límite de items
        if (equipments.value.length > pagination.value.limit) {
          equipments.value.pop()
        }
      }

      pagination.value.total++
      return data
    } catch (err) {
      const enhancedError = err as any

      if (enhancedError.errors) {
        // Error de validación (422)
        validationErrors.value = enhancedError.errors
      }

      const message = enhancedError.message || 'Error al crear equipo'
      error.value = message
      console.error('[EquipmentStore] createEquipment error:', err)
      throw err
    } finally {
      loadingStates.value[operationId] = false
      loading.value = false
    }
  }

  /**
   * Actualizar un equipo existente
   * @param id - ID del equipo
   * @param updateData - Datos a actualizar
   */
  async function updateEquipment(
    id: string,
    updateData: UpdateEquipmentDTO,
  ): Promise<Equipment> {
    const operationId = `updateEquipment-${id}`

    loadingStates.value[operationId] = true
    error.value = null
    validationErrors.value = {}

    try {
      const { data } = await axiosEquipment.patch<Equipment>(`/${id}`, updateData)

      // Actualizar en la lista local
      const index = equipments.value.findIndex((eq) => eq.id === id)
      if (index !== -1) {
        equipments.value[index] = { ...equipments.value[index], ...data }
      }

      // Actualizar seleccionado si es el mismo
      if (selectedEquipment.value?.id === id) {
        selectedEquipment.value = { ...selectedEquipment.value, ...data }
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
      loadingStates.value[operationId] = false
    }
  }

  /**
   * Eliminar un equipo
   * @param id - ID del equipo a eliminar
   */
  async function deleteEquipment(id: string): Promise<void> {
    const operationId = `deleteEquipment-${id}`

    loadingStates.value[operationId] = true
    error.value = null

    try {
      await axiosEquipment.delete(`/${id}`)

      // Remover de la lista local
      equipments.value = equipments.value.filter((eq) => eq.id !== id)
      pagination.value.total--

      // Limpiar selección si era el eliminado
      if (selectedEquipment.value?.id === id) {
        selectedEquipment.value = null
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : `Error al eliminar equipo ${id}`
      error.value = message
      console.error('[EquipmentStore] deleteEquipment error:', err)
      throw err
    } finally {
      loadingStates.value[operationId] = false
    }
  }

  /**
   * Realizar mantenimiento a un equipo
   * @param id - ID del equipo
   * @param maintenanceDate - Fecha del mantenimiento (default: hoy)
   */
  async function performMaintenance(
    id: string,
    maintenanceDate: string = new Date().toISOString().split('T')[0],
  ): Promise<Equipment> {
    const operationId = `performMaintenance-${id}`

    loadingStates.value[operationId] = true
    error.value = null

    try {
      const { data } = await axiosEquipment.post<Equipment>(`/${id}/maintenance`, {
        maintenanceDate,
      })

      // Actualizar en la lista local
      const index = equipments.value.findIndex((eq) => eq.id === id)
      if (index !== -1) {
        equipments.value[index].lastMaintenance = maintenanceDate
      }

      if (selectedEquipment.value?.id === id) {
        selectedEquipment.value.lastMaintenance = maintenanceDate
      }

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : `Error al registrar mantenimiento ${id}`
      error.value = message
      console.error('[EquipmentStore] performMaintenance error:', err)
      throw err
    } finally {
      loadingStates.value[operationId] = false
    }
  }

  // ==========================================================
  // UTILITIES / HELPERS
  // ==========================================================

  /**
   * Seleccionar un equipo para edición o visualización
   * @param equipment - Equipo a seleccionar
   */
  function selectEquipment(equipment: Equipment | null): void {
    selectedEquipment.value = equipment
  }

  /**
   * Limpiar errores de la store
   */
  function clearErrors(): void {
    error.value = null
    validationErrors.value = {}
  }

  /**
   * Resetear el estado de la store
   */
  function resetStore(): void {
    equipments.value = []
    selectedEquipment.value = null
    loading.value = false
    loadingStates.value = {}
    error.value = null
    validationErrors.value = {}
    pagination.value = {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    }
  }

  /**
   * Actualizar filtros de paginación
   * @param newPage - Nueva página
   * @param newLimit - Nuevo límite de items
   */
  function updatePagination(newPage: number, newLimit?: number): void {
    pagination.value.page = newPage
    if (newLimit) {
      pagination.value.limit = newLimit
    }
  }

  // ==========================================================
  // RETURN (API Pública de la Store)
  // ==========================================================

  return {
    // State
    equipments,
    selectedEquipment,
    loading,
    loadingStates,
    error,
    validationErrors,
    pagination,

    // Getters
    totalEquipments,
    hasEquipments,
    isLoading,
    isOperationLoading,
    hasError,
    activeEquipments,
    equipmentsNeedingMaintenance,

    // Actions
    fetchEquipments,
    fetchEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    performMaintenance,

    // Utilities
    selectEquipment,
    clearErrors,
    resetStore,
    updatePagination,
  }
})

// ============================================================
// TIPADO ADICIONAL PARA EXPORT
// ============================================================

export type EquipmentStore = ReturnType<typeof useEquipmentStore>
