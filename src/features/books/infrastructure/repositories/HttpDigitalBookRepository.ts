// ============================================================
// INFRASTRUCTURE - HTTP Digital Book Repository
// GET  /digital-books → 200 lista | 400 biblioteca vacía
// GET  /digital-books/{id} → 200 ficha | 400 no se pudo cargar
// POST /digital-books → 204 No Content = éxito
// ============================================================

import axios, { type AxiosError } from 'axios'
import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { DigitalBookRepository } from '../../domain/repositories/DigitalBookRepository'
import type { CreateDigitalBookDTO, DigitalBook } from '../../domain/entities/DigitalBook.types'
import { EmptyDigitalLibraryError } from '../../domain/errors/EmptyDigitalLibraryError'
import { DigitalBookLoadError } from '../../domain/errors/DigitalBookLoadError'
import { DigitalBookMapper } from '../../domain/services/DigitalBookMapper'

export class HttpDigitalBookRepository implements DigitalBookRepository {
  private readonly baseUrl = '/digital-books'

  async getById(id: string): Promise<DigitalBook> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${encodeURIComponent(id)}`, {
        validateStatus: (status) => status === 200 || status === 400,
      })

      if (response.status === 400) {
        throw new DigitalBookLoadError()
      }

      const book = DigitalBookMapper.fromOne(response.data)
      if (!book) {
        throw new DigitalBookLoadError()
      }
      return book
    } catch (error) {
      if (error instanceof DigitalBookLoadError) throw error
      throw this.mapError(error)
    }
  }

  async list(): Promise<DigitalBook[]> {
    try {
      const response = await axiosInstance.get(this.baseUrl, {
        validateStatus: (status) => status === 200 || status === 400,
      })

      if (response.status === 400) {
        throw new EmptyDigitalLibraryError()
      }

      return DigitalBookMapper.fromUnknown(response.data)
    } catch (error) {
      if (error instanceof EmptyDigitalLibraryError) throw error
      throw this.mapError(error)
    }
  }

  async create(payload: CreateDigitalBookDTO): Promise<void> {
    try {
      const response = await axiosInstance.post(this.baseUrl, payload, {
        validateStatus: (status) => status === 204 || (status >= 200 && status < 300),
      })

      if (response.status === 204 || (response.status >= 200 && response.status < 300)) {
        return
      }

      throw Object.assign(new Error('Respuesta inesperada del servidor'), {
        response: { status: response.status, data: response.data },
      })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 204) {
        return
      }
      throw this.mapError(error)
    }
  }

  private mapError(error: unknown): Error {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>
    const status = axiosError.response?.status
    const apiMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message

    const err = new Error(apiMessage || 'Error al comunicarnos con la biblioteca digital')
    ;(err as Error & { status?: number }).status = status
    return err
  }
}
