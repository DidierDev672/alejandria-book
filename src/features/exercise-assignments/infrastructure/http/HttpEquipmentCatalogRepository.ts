import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { CatalogEquipment } from '../../domain/entities/ExerciseAssignment.types'
import type { EquipmentCatalogRepository } from '../../domain/repositories/EquipmentCatalogRepository'
import { unwrapCollection } from '../../domain/services/CollectionUnwrap'

interface RawEquipment {
  id?: string
  name?: string
  type?: string
  status?: string
}

export class HttpEquipmentCatalogRepository implements EquipmentCatalogRepository {
  async findAll(): Promise<CatalogEquipment[]> {
    const response = await axiosInstance.get('/equipment')
    if (response.status !== 200) {
      throw new Error('No se pudo obtener la lista de equipos')
    }

    return unwrapCollection<RawEquipment>(response.data).map((item) => ({
      id: String(item.id ?? ''),
      name: String(item.name ?? ''),
      type: String(item.type ?? ''),
      status: item.status ? String(item.status) : undefined,
    }))
  }
}
