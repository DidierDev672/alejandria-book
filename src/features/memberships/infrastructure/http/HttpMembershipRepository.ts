import axiosInstance from '@/infrastructure/http/axiosInstance'
import axios from 'axios'
import type { MembershipPlanPayload } from '../../domain/entities/Membership.types'
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
}

export class MembershipListHttpError extends Error {
  status: number

  constructor(status: number) {
    super(`Error al obtener las membresías (HTTP ${status})`)
    this.name = 'MembershipListHttpError'
    this.status = status
  }
}
