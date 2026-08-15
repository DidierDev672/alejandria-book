import type { DigitalBook } from '../entities/DigitalBook.types'

export class DigitalBookSearch {
  static filter(books: DigitalBook[], query: string): DigitalBook[] {
    const needle = this.normalize(query)
    if (!needle) return books
    return books.filter((book) => this.matches(book, needle))
  }

  static matches(book: DigitalBook, query: string): boolean {
    const needle = this.normalize(query)
    if (!needle) return true
    if (this.normalize(book.name).includes(needle)) return true
    if (this.normalize(book.author).includes(needle)) return true
    return book.genres.some((genre) => this.normalize(genre).includes(needle))
  }

  static normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }
}
