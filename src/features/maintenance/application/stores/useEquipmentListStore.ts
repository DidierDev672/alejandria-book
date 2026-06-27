import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosEquipment from '@/features/maintenance/infrastructure/http/axiosEquipment'

// ============================================================
// INTERFACES
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

// ============================================================
// STORE DEFINITION
// ============================================================

export const useEquipmentListStore = defineStore('equipmentList', () => {
  // ==========================================================
  // STATE (Variables Reactivas)
  // ==========================================================

  /** Lista de equipos */
  const items = ref<Equipment[]>([])

  /** Estado de carga */
  const isLoading = ref(false)

  /** Mensaje de error */
  const error = ref<string | null>(null)

  // ==========================================================
  // GETTERS (Computed)
  // ==========================================================

  /** Total de equipos */
  const totalItems = computed(() => items.value.length)

  /** Verifica si hay equipos */
  const hasItems = computed(() => items.value.length > 0)

  /** Equipos activos */
  const activeItems = computed(() =>
    items.value.filter((item) => item.status === 'active')
  )

  // ==========================================================
  // ACTIONS (Métodos Asíncronos)
  // ==========================================================

  /**
   * Obtener lista de equipos desde la API
   * Realiza una petición GET a /equipment y actualiza el estado
   */
  async function fetchEquipments(): Promise<void> {
    // Activar estado de carga y limpiar errores previos
    isLoading.value = true
    error.value = null

    try {
      // Realizar petición GET con Axios
      const { data } = await axiosEquipment.get<Equipment[]>('')

      // Guardar datos en el estado
      items.value = data
    } catch (err: any) {
      // Capturar y guardar el mensaje de error
      error.value = err.message || 'Error al cargar los equipos'
      console.error('[EquipmentListStore] fetchEquipments error:', err)
    } finally {
      // Desactivar estado de carga (siempre se ejecuta)
      isLoading.value = false
    }
  }

  /**
   * Limpiar el estado de error
   */
  function clearError(): void {
    error.value = null
  }

  /**
   * Resetear el store a su estado inicial
   */
  function resetStore(): void {
    items.value = []
    isLoading.value = false
    error.value = null
  }

  // ==========================================================
  // RETURN (API Pública)
  // ==========================================================

  return {
    // State
    items,
    isLoading,
    error,

    // Getters
    totalItems,
    hasItems,
    activeItems,

    // Actions
    fetchEquipments,
    clearError,
    resetStore,
  }
})

export type EquipmentListStore = ReturnType<typeof useEquipmentListStore>
