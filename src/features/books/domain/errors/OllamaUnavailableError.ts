export class OllamaUnavailableError extends Error {
  constructor(message = 'Ollama no está disponible ahora mismo.') {
    super(message)
    this.name = 'OllamaUnavailableError'
  }
}
