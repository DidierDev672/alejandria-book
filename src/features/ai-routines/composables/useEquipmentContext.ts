// ============================================================
// COMPOSABLE - Equipment / gym inventory context
// Secuencia: GET /equipment (active) → GET /exercises?equipment_id=
// ============================================================

import { ref } from 'vue'
import { HttpGymInventoryContextProvider } from '../infrastructure/http/HttpGymInventoryContextProvider'
import type { GymInventoryContextResult } from '../domain/entities/GymInventoryContext.types'
import { GymInventoryContextFormatter } from '../domain/services/GymInventoryContextFormatter'

const inventoryProvider = new HttpGymInventoryContextProvider()

export function useEquipmentContext() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const inventory = ref<GymInventoryContextResult | null>(null)

  /**
   * Fetches all active equipment and their exercises.
   * Returns a context object ready to inject into the AI prompt.
   */
  async function buildEquipmentContext(): Promise<GymInventoryContextResult['blocks']> {
    loading.value = true
    error.value = null

    try {
      const result = await inventoryProvider.buildInventoryContext()
      inventory.value = result

      if (result.equipmentFetchFailed) {
        error.value = 'No se pudo obtener el equipamiento activo del gym.'
      } else if (result.emptyActiveEquipment) {
        error.value = 'No hay equipos activos registrados en el sistema.'
      }

      return result.blocks
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : 'Error al cargar el contexto de equipamiento.'
      error.value = message
      inventory.value = {
        blocks: [],
        equipmentFetchFailed: true,
        emptyActiveEquipment: false,
      }
      return []
    } finally {
      loading.value = false
    }
  }

  /** Bloque de texto listo para system prompt (Gurney Halleck / inventario) */
  function formatInventoryPromptBlock(result: GymInventoryContextResult): string {
    return GymInventoryContextFormatter.toSystemContext(result)
  }

  return {
    loading,
    error,
    inventory,
    buildEquipmentContext,
    formatInventoryPromptBlock,
  }
}
