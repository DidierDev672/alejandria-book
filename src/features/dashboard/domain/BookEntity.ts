export interface Book {
  ID?: string
  title: string
  description: string
  author: string
  genres: string[]
  photos: string[]
  publicationDate: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateBookPayload {
  title: string
  description: string
  author: string
  genres: string[]
  photos?: string[]
  publicationDate?: string
}

export interface UpdateBookPayload extends CreateBookPayload {}

export interface ApiError {
  error: string
}
