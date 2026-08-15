// ============================================================
// DOMAIN REPOSITORY - Digital books port (DIP)
// ============================================================

import type { CreateDigitalBookDTO, DigitalBook } from '../entities/DigitalBook.types'

export interface DigitalBookRepository {
  /** POST /digital-books — éxito esperado: HTTP 204 */
  create(payload: CreateDigitalBookDTO): Promise<void>
  /** GET /digital-books — 200: lista; 400: biblioteca vacía */
  list(): Promise<DigitalBook[]>
  /** GET /digital-books/{id} — 200: ficha; 400: no se pudo cargar */
  getById(id: string): Promise<DigitalBook>
}
