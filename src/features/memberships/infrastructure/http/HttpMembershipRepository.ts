import axiosInstance from '@/infrastructure/http/axiosInstance'
import axios from 'axios'
import type { MembershipPlanPayload, MembershipRegisterPayload } from '../../domain/entities/Membership.types'
import type { AttendanceRecord, MembershipRecord } from '../../domain/entities/DashboardMetric.types'
import type { MembershipRegistration } from '../../domain/entities/MembershipRegistration.types'
import type { MembershipRepository } from '../../domain/repositories/MembershipRepository'
import { MembershipDomainService } from '../../domain/services/MembershipDomainService'

export class HttpMembershipRepository implements MembershipRepository {
  async create(payload: MembershipPlanPayload): Promise<void> {
    try {
      const response = await axiosInstance.post('/planes', payload)
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(MembershipDomainService.submitErrorMessage())
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(MembershipDomainService.submitErrorMessage())
      }
      throw error instanceof Error
        ? error
        : new Error(MembershipDomainService.submitErrorMessage())
    }
  }

  async list(): Promise<MembershipPlanPayload[]> {
    const response = await axiosInstance.get<MembershipPlanPayload[]>('/planes')
    if (response.status !== 200) {
      throw new MembershipListHttpError(response.status)
    }
    return Array.isArray(response.data) ? response.data : []
  }

  async listRegistrations(): Promise<MembershipRegistration[]> {
    try {
      const response = await axiosInstance.get<MembershipRegistration[]>('/memberships')
      if (response.status !== 200) {
        throw new MembershipListHttpError(response.status)
      }
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new MembershipListHttpError(error.response?.status ?? 0)
      }
      if (error instanceof MembershipListHttpError) {
        throw error
      }
      throw new MembershipListHttpError(0)
    }
  }

  async register(payload: MembershipRegisterPayload): Promise<void> {
    try {
      const response = await axiosInstance.post('/memberships', payload)
      if (response.status !== 200 && response.status !== 201) {
        throw new MembershipRegisterHttpError(response.status)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        if (status !== undefined) {
          throw new MembershipRegisterHttpError(status)
        }
        throw new MembershipRegisterHttpError(0)
      }
      throw error instanceof Error
        ? error
        : new MembershipRegisterHttpError(0)
    }
  }

  async listAttendance(): Promise<AttendanceRecord[]> {
    try {
      const response = await axiosInstance.get<AttendanceRecord[]>('/attendance')
      if (response.status !== 200) {
        throw new MembershipListHttpError(response.status)
      }
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new MembershipListHttpError(error.response?.status ?? 0)
      }
      if (error instanceof MembershipListHttpError) {
        throw error
      }
      throw new MembershipListHttpError(0)
    }
  }

  async findMemberById(id: string): Promise<{ id: string; name_full: string }> {
    try {
      const response = await axiosInstance.get<{ id: string; name_full: string }>(`/members/${id}`)
      if (response.status !== 200) {
        throw new MembershipLookupHttpError(response.status)
      }
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new MembershipLookupHttpError(error.response?.status ?? 0)
      }
      if (error instanceof MembershipLookupHttpError) {
        throw error
      }
      throw new MembershipLookupHttpError(0)
    }
  }

  async findMembershipById(id: string): Promise<MembershipRecord> {
    try {
      const response = await axiosInstance.get<MembershipRecord>(`/memberships/${id}`)
      if (response.status !== 200) {
        throw new MembershipLookupHttpError(response.status)
      }
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new MembershipLookupHttpError(error.response?.status ?? 0)
      }
      if (error instanceof MembershipLookupHttpError) {
        throw error
      }
      throw new MembershipLookupHttpError(0)
    }
  }

  async findPlanById(id: string): Promise<MembershipPlanPayload> {
    try {
      const response = await axiosInstance.get<MembershipPlanPayload>(`/planes/${id}`)
      if (response.status !== 200) {
        throw new MembershipLookupHttpError(response.status)
      }
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new MembershipLookupHttpError(error.response?.status ?? 0)
      }
      if (error instanceof MembershipLookupHttpError) {
        throw error
      }
      throw new MembershipLookupHttpError(0)
    }
  }
}

export class MembershipListHttpError extends Error {
  status: number

  constructor(status: number) {
    super(`Error al obtener las membresías (HTTP ${status})`)
    this.name = 'MembershipListHttpError'
    this.status = status
  }
}

export class MembershipRegisterHttpError extends Error {
  status: number

  constructor(status: number) {
    super(`Error al registrar la membresía (HTTP ${status})`)
    this.name = 'MembershipRegisterHttpError'
    this.status = status
  }
}

export class MembershipLookupHttpError extends Error {
  status: number

  constructor(status: number) {
    super(`Error al consultar el detalle de la membresía (HTTP ${status})`)
    this.name = 'MembershipLookupHttpError'
    this.status = status
  }
}
