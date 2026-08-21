import type { CatalogEquipment } from '../entities/ExerciseAssignment.types'

export interface EquipmentCatalogRepository {
  findAll(): Promise<CatalogEquipment[]>
}
