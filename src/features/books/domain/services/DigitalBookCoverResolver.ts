import type { DigitalBook } from '../entities/DigitalBook.types'

const IMAGE_FILE = /\.(avif|jpe?g|png|webp|gif)$/i

export class DigitalBookCoverResolver {
  static fromBook(book: DigitalBook): string {
    return this.toSrc(book.photos[0] ?? '')
  }

  static fromPhotos(photos: string[]): string[] {
    return photos.map((photo) => this.toSrc(photo)).filter(Boolean)
  }

  static toSrc(value: string): string {
    const src = value.trim()
    if (!src) return ''
    if (
      src.startsWith('data:') ||
      src.startsWith('blob:') ||
      /^https?:\/\//i.test(src) ||
      src.startsWith('/')
    ) {
      return src
    }
    if (IMAGE_FILE.test(src) && src.length < 500) {
      return src
    }
    return `data:image/jpeg;base64,${src}`
  }
}
