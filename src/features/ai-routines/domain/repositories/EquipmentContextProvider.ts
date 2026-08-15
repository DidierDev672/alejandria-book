// ============================================================
// DOMAIN REPOSITORY - Equipment Context Provider (Port)
// Proporciona el catálogo GET /equipment para el Coach AI.
// ============================================================

import type { EquipmentCoachItem } from '../entities/EquipmentCoach.types'

export interface EquipmentContextProvider {
  /** Devuelve los equipos registrados en el gym */
  getEquipment(): Promise<EquipmentCoachItem[]>
}
