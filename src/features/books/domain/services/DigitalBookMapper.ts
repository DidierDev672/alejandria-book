import type { DigitalBook } from '../entities/DigitalBook.types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export class DigitalBookMapper {
  static fromUnknown(payload: unknown): DigitalBook[] {
    return this.extractRecords(payload)
      .map((record) => this.fromRecord(record))
      .filter((book) => book.id.length > 0)
  }

  static fromOne(payload: unknown): DigitalBook | null {
    if (Array.isArray(payload)) {
      return this.fromUnknown(payload)[0] ?? null
    }
    if (isRecord(payload) && isRecord(payload.data) && !Array.isArray(payload.data)) {
      const book = this.fromRecord(payload.data)
      return book.id ? book : null
    }
    if (isRecord(payload) && isRecord(payload.book)) {
      const book = this.fromRecord(payload.book)
      return book.id ? book : null
    }
    if (isRecord(payload)) {
      const book = this.fromRecord(payload)
      return book.id ? book : null
    }
    return null
  }

  private static extractRecords(payload: unknown): Record<string, unknown>[] {
    if (Array.isArray(payload)) {
      return payload.filter(isRecord)
    }
    if (isRecord(payload) && Array.isArray(payload.data)) {
      return payload.data.filter(isRecord)
    }
    if (isRecord(payload) && Array.isArray(payload.books)) {
      return payload.books.filter(isRecord)
    }
    return []
  }

  private static fromRecord(raw: Record<string, unknown>): DigitalBook {
    const genres = Array.isArray(raw.genres)
      ? raw.genres.map((item) => String(item).trim()).filter(Boolean)
      : []
    const photos = Array.isArray(raw.photos)
      ? raw.photos.map((item) => String(item).trim()).filter(Boolean)
      : []

    return {
      id: String(raw.id ?? '').trim(),
      name: String(raw.name ?? '').trim(),
      author: String(raw.author ?? '').trim(),
      genres,
      photos,
      filePDF: String(raw.filePDF ?? raw.file_pdf ?? '').trim(),
      createdAt: String(raw.created_at ?? raw.createdAt ?? '').trim(),
      updatedAt: String(raw.updated_at ?? raw.updatedAt ?? '').trim(),
    }
  }
}
