import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { Book, CreateBookPayload, UpdateBookPayload } from '../domain/BookEntity'

export class BookApi {
  async getAll(): Promise<Book[]> {
    const { data } = await axiosInstance.get<Book[]>('/books')
    return data
  }

  async getById(id: string): Promise<Book> {
    const { data } = await axiosInstance.get<Book>(`/books/${id}`)
    return data
  }

  async create(payload: CreateBookPayload): Promise<Book> {
    const { data } = await axiosInstance.post<Book>('/books', payload)
    return data
  }

  async update(id: string, payload: UpdateBookPayload): Promise<Book> {
    const { data } = await axiosInstance.put<Book>(`/books/${id}`, payload)
    return data
  }

  async remove(id: string): Promise<void> {
    await axiosInstance.delete(`/books/${id}`)
  }
}
