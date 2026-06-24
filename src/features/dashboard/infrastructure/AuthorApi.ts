import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { Author, CreateAuthorPayload, UpdateAuthorPayload } from '../domain/AuthorEntity'

export class AuthorApi {
  async getAll(): Promise<Author[]> {
    const { data } = await axiosInstance.get<Author[]>('/authors')
    return data
  }

  async getById(id: string): Promise<Author> {
    const { data } = await axiosInstance.get<Author>(`/authors/${id}`)
    return data
  }

  async create(payload: CreateAuthorPayload): Promise<Author> {
    const { data } = await axiosInstance.post<Author>('/authors', payload)
    return data
  }

  async update(id: string, payload: UpdateAuthorPayload): Promise<Author> {
    const { data } = await axiosInstance.put<Author>(`/authors/${id}`, payload)
    return data
  }

  async remove(id: string): Promise<void> {
    await axiosInstance.delete(`/authors/${id}`)
  }
}
