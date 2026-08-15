export interface Book {
  ID?: string
  title: string
  description: string
  author: string
  genres: string[]
  /** Portada del libro (data URL o URL) */
  bookPhoto: string
  /** Nombre del archivo PDF seleccionado */
  digitalBookName: string
  photos: string[]
  publicationDate: string
  createdAt?: Date
  updatedAt?: Date
}

export class BookFactory {
  static createEmpty(): Book {
    return {
      title: '',
      description: '',
      author: '',
      genres: [],
      bookPhoto: '',
      digitalBookName: '',
      photos: [],
      publicationDate: '',
    }
  }
}
