// ============================================================
// DOMAIN ENTITY - Equipment catalog for Coach AI
// Espejo del contrato GET /equipment: referencia para indicar
// qué equipo del gym usa cada ejercicio de la rutina.
// ============================================================

/** Ítem alineado con la respuesta de GET /equipment */
export interface EquipmentCoachItem {
  id: string
  name: string
  type: string
  status: string
  LastMaintenance: string
  created_at: string
  updated_at: string
}
