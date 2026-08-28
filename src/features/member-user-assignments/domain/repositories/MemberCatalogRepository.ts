import type { CatalogMember } from '../entities/MemberUserAssignment.types'

export interface MemberCatalogRepository {
  findAll(): Promise<CatalogMember[]>
}
