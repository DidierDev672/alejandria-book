// ============================================================
// DOMAIN - Digital book create payload (POST /digital-books)
// ============================================================

export interface CreateDigitalBookDTO {
  name: string
  author: string
  genres: string[]
  photos: string[]
  filePDF: string
}

export interface DigitalBookFormInput {
  title: string
  author: string
  genres: string[]
  /** Archivos de imagen de portada (pueden ser varios) */
  photoFiles: File[]
  /** Archivo PDF del libro */
  pdfFile: File
}

/** Entidad de listado — GET /digital-books */
export interface DigitalBook {
  id: string
  name: string
  author: string
  genres: string[]
  photos: string[]
  filePDF: string
  createdAt: string
  updatedAt: string
}
