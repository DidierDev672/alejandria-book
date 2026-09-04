import axiosInstance from '@/infrastructure/http/axiosInstance'
import axios from 'axios'
import type {
  AttendanceRecord,
  DashboardRepository,
  MembershipPlan,
  MembershipRecord,
  PaymentRecord,
} from '../../domain/entities/DashboardMetric.types'

// ============================================================
// INFRASTRUCTURE · HttpDashboardRepository
// Conoce axios y los endpoints concretos; devuelve datos ya
// mapeados. Depende hacia adentro (hacia el puerto del dominio).
// ============================================================

export class HttpDashboardRepository implements DashboardRepository {
  async getPlanes(): Promise<MembershipPlan[]> {
    return this.getCollection<MembershipPlan>('/planes', 'planes')
  }

  async getMemberships(): Promise<MembershipRecord[]> {
    return this.getCollection<MembershipRecord>('/memberships', 'memberships')
  }

  async getAttendance(): Promise<AttendanceRecord[]> {
    return this.getCollection<AttendanceRecord>('/attendance', 'attendance')
  }

  async getPays(): Promise<PaymentRecord[]> {
    return this.getCollection<PaymentRecord>('/pays', 'pays')
  }

  private async getCollection<T>(path: string, _resource: string): Promise<T[]> {
    try {
      const response = await axiosInstance.get<T[]>(path)
      if (response.status !== 200) {
        throw new DashboardHttpError(path, response.status)
      }
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new DashboardHttpError(path, error.response?.status ?? 0)
      }
      if (error instanceof DashboardHttpError) {
        throw error
      }
      throw new DashboardHttpError(path, 0)
    }
  }
}

export class DashboardHttpError extends Error {
  resource: string
  status: number

  constructor(resource: string, status: number) {
    super(`Error al obtener datos del panel (${resource}, HTTP ${status})`)
    this.name = 'DashboardHttpError'
    this.resource = resource
    this.status = status
  }
}