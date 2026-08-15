// ============================================================
// INFRASTRUCTURE - Ollama Chat Adapter
// POST /ollama/api/chat (Vite proxy → http://localhost:11434)
// ============================================================

import axios, { type AxiosError } from 'axios'
import type { AiChatRepository } from '../../domain/repositories/AiChatRepository'
import type {
  OllamaChatRequest,
  OllamaChatResponse,
  OllamaMessage,
} from '../../domain/entities/AiChat.types'
import { DEFAULT_OLLAMA_MODEL } from '../../domain/entities/AiChat.types'
import { OllamaUnavailableError } from '../../domain/entities/AiChat.errors'

const httpClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
  // Los modelos locales pueden tardar: margen generoso
  timeout: 120_000,
})

export class OllamaChatRepository implements AiChatRepository {
  private readonly baseUrl = '/ollama/api/chat'

  constructor(private readonly model: string = DEFAULT_OLLAMA_MODEL) {}

  async sendChat(messages: OllamaMessage[]): Promise<string> {
    const payload: OllamaChatRequest = {
      model: this.model,
      messages,
      stream: false,
      options: { temperature: 0.6 },
    }

    try {
      const response = await httpClient.post<OllamaChatResponse>(this.baseUrl, payload)
      const content = response.data?.message?.content?.trim()

      if (!content) {
        throw new Error('El modelo no devolvió contenido')
      }
      return content
    } catch (error) {
      throw this.mapError(error)
    }
  }

  private mapError(error: unknown): Error {
    const axiosError = error as AxiosError<{ error?: string }>

    if (axiosError.code === 'ECONNABORTED') {
      return new Error(
        'El modelo tardó demasiado en responder. Intenta con un prompt más corto o verifica que Ollama esté corriendo.',
      )
    }

    const status = axiosError.response?.status
    const apiDetail = axiosError.response?.data?.error

    // Recuperables con auto-arranque (ollama run llama3)
    if (status === 404 && apiDetail?.includes('model')) {
      return new OllamaUnavailableError(
        `El modelo "${this.model}" no está cargado todavía.`,
      )
    }
    if (!axiosError.response || status === 502 || status === 503) {
      return new OllamaUnavailableError(
        'No se pudo conectar con Ollama en http://localhost:11434.',
      )
    }

    console.error('[OllamaChatRepository] Error:', error)
    return new Error(apiDetail || 'Error al consultar el modelo de IA')
  }
}
