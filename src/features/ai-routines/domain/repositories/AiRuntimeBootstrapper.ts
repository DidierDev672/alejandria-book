// ============================================================
// DOMAIN REPOSITORY - AI Runtime Bootstrapper port (DIP)
// Abstrae "arrancar el modelo de IA" (ollama run llama3):
// la aplicación no sabe cómo se ejecuta, solo que puede pedirlo.
// ============================================================

export interface AiRuntimeBootstrapper {
  /** Solicita el arranque del runtime/modelo de IA (idempotente) */
  boot(): Promise<void>
}
