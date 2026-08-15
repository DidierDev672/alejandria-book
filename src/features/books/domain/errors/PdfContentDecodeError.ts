export class PdfContentDecodeError extends Error {
  constructor(message = 'No pudimos abrir el contenido del libro.') {
    super(message)
    this.name = 'PdfContentDecodeError'
  }
}
