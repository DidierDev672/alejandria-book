import axios from 'axios'
import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { PayMemberBrief, PayMembership, PayPlanBrief, Payment, PaymentRepository, RegisterPaymentPayload } from '../../domain/Pay'

// ============================================================
// INFRASTRUCTURE · HttpPayRepository
// Capa 3 — Adaptador concreto. Implementa el puerto definido
// en el dominio y conoce detalles externos (axios, endpoints,
// códigos HTTP) que las capas internas jamás ven.
// La dependencia apunta hacia adentro (hacia domain).
// ============================================================

export class HttpPayRepository implements PaymentRepository {
  async register(payload: RegisterPaymentPayload): Promise<Payment> {
    try {
      console.log('[HttpPayRepository] payload:', JSON.stringify(payload))
      const response = await axiosInstance.post<Payment>('/pays', payload)
      if (response.status !== 200 && response.status !== 201) {
        throw new PayHttpError(response.status, 'register')
      }
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('[HttpPayRepository] response error body:', JSON.stringify(error.response?.data))
        throw new PayHttpError(error.response?.status ?? 0, 'register')
      }
      if (error instanceof PayHttpError) {
        throw error
      }
      throw new PayHttpError(0, 'register')
    }
  }

  async list(): Promise<Payment[]> {
    try {
      const response = await axiosInstance.get<Payment[]>('/pays')
      if (response.status !== 200) {
        throw new PayHttpError(response.status, 'list')
      }
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('[HttpPayRepository] list error body:', JSON.stringify(error.response?.data))
        throw new PayHttpError(error.response?.status ?? 0, 'list')
      }
      if (error instanceof PayHttpError) {
        throw error
      }
      throw new PayHttpError(0, 'list')
    }
  }

  async listMembershipsByMember(memberId: string): Promise<PayMembership[]> {
    try {
      const response = await axiosInstance.get<PayMembership[]>(`/memberships/${memberId}`)
      if (response.status !== 200) {
        throw new PayHttpError(response.status, 'listMemberships')
      }
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new PayHttpError(error.response?.status ?? 0, 'listMemberships')
      }
      if (error instanceof PayHttpError) {
        throw error
      }
      throw new PayHttpError(0, 'listMemberships')
    }
  }

  async findMemberById(id: string): Promise<PayMemberBrief> {
    try {
      const response = await axiosInstance.get<PayMemberBrief>(`/members/${id}`)
      if (response.status !== 200) {
        throw new PayHttpError(response.status, 'findMember')
      }
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new PayHttpError(error.response?.status ?? 0, 'findMember')
      }
      if (error instanceof PayHttpError) {
        throw error
      }
      throw new PayHttpError(0, 'findMember')
    }
  }

  async findMembershipById(id: string): Promise<PayMembership> {
    try {
      const response = await axiosInstance.get<PayMembership>(`/memberships/${id}`)
      if (response.status !== 200) {
        throw new PayHttpError(response.status, 'findMembership')
      }
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new PayHttpError(error.response?.status ?? 0, 'findMembership')
      }
      if (error instanceof PayHttpError) {
        throw error
      }
      throw new PayHttpError(0, 'findMembership')
    }
  }

  async findPlanById(id: string): Promise<PayPlanBrief> {
    try {
      const response = await axiosInstance.get<PayPlanBrief>(`/planes/${id}`)
      if (response.status !== 200) {
        throw new PayHttpError(response.status, 'findPlan')
      }
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new PayHttpError(error.response?.status ?? 0, 'findPlan')
      }
      if (error instanceof PayHttpError) {
        throw error
      }
      throw new PayHttpError(0, 'findPlan')
    }
  }
}

export class PayHttpError extends Error {
  status: number
  action: string

  constructor(status: number, action: string) {
    super(`Error al procesar el pago (HTTP ${status})`)
    this.name = 'PayHttpError'
    this.status = status
    this.action = action
  }
}