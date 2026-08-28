import type { CatalogUser } from '../entities/MemberUserAssignment.types'

export interface UserCatalogRepository {
  findAll(): Promise<CatalogUser[]>
}
