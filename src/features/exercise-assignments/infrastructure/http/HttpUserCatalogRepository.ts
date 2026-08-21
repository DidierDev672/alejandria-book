import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { CatalogUser } from '../../domain/entities/ExerciseAssignment.types'
import type { UserCatalogRepository } from '../../domain/repositories/UserCatalogRepository'
import { unwrapCollection } from '../../domain/services/CollectionUnwrap'

interface RawUser {
  id?: string
  name_full?: string
  phone?: string
  id_number?: string
  email?: string
  roles?: string[]
}

export class HttpUserCatalogRepository implements UserCatalogRepository {
  async findAll(): Promise<CatalogUser[]> {
    const response = await axiosInstance.get('/users')
    if (response.status !== 200) {
      throw new Error('No se pudo obtener la lista de usuarios')
    }

    return unwrapCollection<RawUser>(response.data).map((user) => ({
      id: String(user.id ?? ''),
      name_full: String(user.name_full ?? ''),
      phone: String(user.phone ?? ''),
      id_number: String(user.id_number ?? ''),
      email: user.email ? String(user.email) : undefined,
      roles: Array.isArray(user.roles) ? user.roles.map(String) : [],
    }))
  }
}
