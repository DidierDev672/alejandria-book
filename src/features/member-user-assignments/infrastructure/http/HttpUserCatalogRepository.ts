import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { CatalogUser } from '../../domain/entities/MemberUserAssignment.types'
import type { UserCatalogRepository } from '../../domain/repositories/UserCatalogRepository'
import { unwrapCollection } from '../../domain/services/CollectionUnwrap'
import { MemberUserAssignmentDomainService } from '../../domain/services/MemberUserAssignmentDomainService'

interface RawUser {
  id?: string
  name_full?: string
  phone?: string
  id_number?: string
  date_of_birth?: string
  email?: string
  roles?: string[]
}

export class HttpUserCatalogRepository implements UserCatalogRepository {
  async findAll(): Promise<CatalogUser[]> {
    const response = await axiosInstance.get('/users')
    if (response.status !== 200) {
      throw new Error(MemberUserAssignmentDomainService.catalogErrorMessage())
    }

    return unwrapCollection<RawUser>(response.data).map((user) => ({
      id: String(user.id ?? ''),
      name_full: String(user.name_full ?? ''),
      phone: String(user.phone ?? ''),
      id_number: String(user.id_number ?? ''),
      date_of_birth: String(user.date_of_birth ?? ''),
      email: String(user.email ?? ''),
      roles: Array.isArray(user.roles) ? user.roles.map(String) : [],
    }))
  }
}
