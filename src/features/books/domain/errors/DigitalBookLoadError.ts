export class DigitalBookLoadError extends Error {
  readonly status = 400

  constructor(message = 'No pudimos cargar este libro digital.') {
    super(message)
    this.name = 'DigitalBookLoadError'
  }
}
