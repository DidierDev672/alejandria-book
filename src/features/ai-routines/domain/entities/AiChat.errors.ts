// ============================================================
// DOMAIN ERRORS - AI Chat
// Error tipado para distinguir "Ollama no disponible / modelo
// no cargado" (recuperable con auto-arranque) de otros fallos.
// ============================================================

export class OllamaUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OllamaUnavailableError'
  }
}
