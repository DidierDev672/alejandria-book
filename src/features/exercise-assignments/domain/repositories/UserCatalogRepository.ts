import type { CatalogUser } from '../entities/ExerciseAssignment.types'

export interface UserCatalogRepository {
  findAll(): Promise<CatalogUser[]>
}
