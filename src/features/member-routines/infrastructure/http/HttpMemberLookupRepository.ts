// ============================================================
// INFRASTRUCTURE - HTTP Member Lookup (Adapter)
// GET /members/{id}
// ============================================================

import axios from 'axios'
import type { MemberLookupRepository } from '../../domain/repositories/MemberLookupRepository'
import type { MemberSummary } from '../../domain/entities/MemberSummary.types'
import { MemberSummaryMapper } from '../../domain/services/MemberSummaryMapper'

const httpClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export class HttpMemberLookupRepository implements MemberLookupRepository {
  private readonly baseUrl = '/members'

  async findById(id: string): Promise<MemberSummary | null> {
    try {
      const response = await httpClient.get(`${this.baseUrl}/${id}`)
      return MemberSummaryMapper.toDomain(id, response.data as Record<string, unknown>)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      console.warn(`[HttpMemberLookupRepository] Error fetching member ${id}:`, error)
      return null
    }
  }
}
