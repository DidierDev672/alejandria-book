export class EmptyDigitalLibraryError extends Error {
  readonly status = 400

  constructor(message = 'La biblioteca digital aún no tiene libros registrados.') {
    super(message)
    this.name = 'EmptyDigitalLibraryError'
  }
}
