// ============================================================
// DOMAIN REPOSITORY - Gym Inventory Context Provider (Port)
// ============================================================

import type { GymInventoryContextResult } from '../entities/GymInventoryContext.types'

export interface GymInventoryContextProvider {
  /**
   * Secuencia obligatoria:
   * 1) GET /equipment → filtrar status === 'active'
   * 2) GET /exercises?equipment_id={id} en paralelo
   * 3) Devolver contexto listo para el system prompt
   */
  buildInventoryContext(): Promise<GymInventoryContextResult>
}
