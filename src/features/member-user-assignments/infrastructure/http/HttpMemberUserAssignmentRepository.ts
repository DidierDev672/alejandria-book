import axiosInstance from '@/infrastructure/http/axiosInstance'
import axios from 'axios'
import type {
  MemberUserAssignment,
  MemberUserAssignmentPayload,
} from '../../domain/entities/MemberUserAssignment.types'
import type { MemberUserAssignmentRepository } from '../../domain/repositories/MemberUserAssignmentRepository'
import { unwrapCollection } from '../../domain/services/CollectionUnwrap'
import { MemberUserAssignmentDomainService } from '../../domain/services/MemberUserAssignmentDomainService'

interface RawAssignment {
  id?: string
  id_user?: string
  member_id?: string
  created_at?: string
  updated_at?: string
}

export class HttpMemberUserAssignmentRepository implements MemberUserAssignmentRepository {
  async create(payload: MemberUserAssignmentPayload): Promise<void> {
    try {
      const response = await axiosInstance.post('/assignment-member', payload)
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(MemberUserAssignmentDomainService.submitErrorMessage())
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(MemberUserAssignmentDomainService.submitErrorMessage())
      }
      throw error instanceof Error
        ? error
        : new Error(MemberUserAssignmentDomainService.submitErrorMessage())
    }
  }

  async findAll(): Promise<MemberUserAssignment[]> {
    try {
      const response = await axiosInstance.get('/assignment-member')
      if (response.status !== 200) {
        throw new Error(MemberUserAssignmentDomainService.listErrorMessage(response.status))
      }

      return unwrapCollection<RawAssignment>(response.data).map((item, index) =>
        this.mapItem(item, index),
      )
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(MemberUserAssignmentDomainService.listErrorMessage(error.response?.status))
      }
      throw error instanceof Error
        ? error
        : new Error(MemberUserAssignmentDomainService.listErrorMessage())
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await axiosInstance.delete(`/assignment-member/${id}`)
      if (response.status !== 200 && response.status !== 204) {
        throw new Error(MemberUserAssignmentDomainService.deleteErrorMessage(response.status))
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(MemberUserAssignmentDomainService.deleteErrorMessage(error.response?.status))
      }
      throw error instanceof Error
        ? error
        : new Error(MemberUserAssignmentDomainService.deleteErrorMessage())
    }
  }

  private mapItem(data: RawAssignment, index = 0): MemberUserAssignment {
    const userId = String(data.id_user ?? '')
    const memberId = String(data.member_id ?? '')

    return {
      id: String(data.id ?? `${userId}-${memberId}-${index}`),
      id_user: userId,
      member_id: memberId,
      created_at: String(data.created_at ?? ''),
      updated_at: String(data.updated_at ?? ''),
    }
  }
}
