// ============================================================
// INFRASTRUCTURE - HTTP Equipment Context Provider (Adapter)
// Consume GET /equipment para el contexto del Coach AI.
// ============================================================

import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { EquipmentContextProvider } from '../../domain/repositories/EquipmentContextProvider'
import type { EquipmentCoachItem } from '../../domain/entities/EquipmentCoach.types'

interface RawEquipment {
  id?: string
  name?: string
  type?: string
  status?: string
  LastMaintenance?: string
  lastMaintenance?: string
  last_maintenance?: string
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
}

function mapItem(raw: RawEquipment): EquipmentCoachItem {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    type: String(raw.type ?? ''),
    status: String(raw.status ?? ''),
    LastMaintenance: String(
      raw.LastMaintenance ?? raw.lastMaintenance ?? raw.last_maintenance ?? '',
    ),
    created_at: String(raw.created_at ?? raw.createdAt ?? ''),
    updated_at: String(raw.updated_at ?? raw.updatedAt ?? ''),
  }
}

export class HttpEquipmentContextProvider implements EquipmentContextProvider {
  private readonly baseUrl = '/equipment'

  async getEquipment(): Promise<EquipmentCoachItem[]> {
    try {
      const { data } = await axiosInstance.get<
        RawEquipment[] | { data: RawEquipment[] }
      >(this.baseUrl)

      const list = Array.isArray(data) ? data : (data?.data ?? [])
      return list.map(mapItem)
    } catch (error) {
      console.warn('[HttpEquipmentContextProvider] No se pudieron cargar equipos:', error)
      return []
    }
  }
}
