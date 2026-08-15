// ============================================================
// DOMAIN ENTITY - Gym inventory context for Coach AI
// Secuencia: GET /equipment (active) → GET /exercises?equipment_id=
// ============================================================

export interface GymInventoryExercise {
  exercise_id: string
  name: string
  muscle_group: string
  difficulty: string
  video_url: string
}

/** Bloque equipo + ejercicios registrados para esa máquina */
export interface GymInventoryBlock {
  equipment_id: string
  equipment_name: string
  equipment_type: string
  exercises: GymInventoryExercise[]
}

export interface GymInventoryContextResult {
  /** Inventario agrupado por equipo activo */
  blocks: GymInventoryBlock[]
  /** true si falló GET /equipment */
  equipmentFetchFailed: boolean
  /** true si no hay equipos active */
  emptyActiveEquipment: boolean
}
