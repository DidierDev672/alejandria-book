// ============================================================
// DOMAIN ENTITIES - AI Routine Chat types
// ============================================================

export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
  /** true cuando la respuesta fue bloqueada por la política del coach */
  blockedByPolicy?: boolean
}

/** Mensaje con el formato que espera la API de Ollama */
export interface OllamaMessage {
  role: ChatRole
  content: string
}

export interface OllamaChatRequest {
  model: string
  messages: OllamaMessage[]
  stream: false
  options?: {
    temperature?: number
  }
}

export interface OllamaChatResponse {
  model: string
  message: { role: ChatRole; content: string }
  done: boolean
}

export const DEFAULT_OLLAMA_MODEL = 'llama3'
