import axios from 'axios'
import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { AssistanceRepository, RegisterAssistancePayload } from '../../domain/Assistance'
import { AssistanceDomainService } from '../../domain/Assistance'

// ============================================================
// INFRASTRUCTURE · HttpAssistanceRepository
// Capa 3 — Adaptador concreto. Implementa el puerto definido
// en el dominio y conoce detalles externos (axios, endpoint,
// códigos HTTP) que las capas internas jamás ven.
// La dependencia apunta hacia adentro (hacia domain).
// ============================================================

export class HttpAssistanceRepository implements AssistanceRepository {
  async register(payload: RegisterAssistancePayload): Promise<void> {
    try {
      const response = await axiosInstance.post('/attendance', payload)
      // Un 201 (Created) confirma que la asistencia quedó registrada.
      if (response.status !== 201 && response.status !== 200) {
        throw new AssistanceHttpError(response.status, 'register')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AssistanceHttpError(error.response?.status ?? 0, 'register')
      }
      if (error instanceof AssistanceHttpError) {
        throw error
      }
      throw new AssistanceHttpError(0, 'register')
    }
  }
}

export class AssistanceHttpError extends Error {
  status: number
  action: string

  constructor(status: number, action: string) {
    super(AssistanceDomainService.errorMessage())
    this.name = 'AssistanceHttpError'
    this.status = status
    this.action = action
  }
}
