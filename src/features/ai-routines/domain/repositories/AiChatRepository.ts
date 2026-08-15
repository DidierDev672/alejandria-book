// ============================================================
// DOMAIN REPOSITORY - AI Chat port (DIP)
// La capa de aplicación depende de esta abstracción,
// nunca del adaptador HTTP concreto de Ollama.
// ============================================================

import type { OllamaMessage } from '../entities/AiChat.types'

export interface AiChatRepository {
  /** Envía la conversación completa y devuelve el texto del asistente */
  sendChat(messages: OllamaMessage[]): Promise<string>
}
