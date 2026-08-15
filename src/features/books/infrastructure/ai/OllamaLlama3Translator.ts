import axios, { type AxiosError } from 'axios'
import { OllamaUnavailableError } from '../../domain/errors/OllamaUnavailableError'

export class OllamaLlama3Translator {
  private readonly chatUrl = '/ollama/api/chat'
  private readonly model = 'llama3'

  async complete(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.chatUrl,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
          options: { temperature: 0.2 },
        },
        { timeout: 180_000 },
      )

      const content = String(response.data?.message?.content ?? '').trim()
      if (!content) {
        throw new Error('llama3 no devolvió texto esta vez.')
      }
      return content
    } catch (error) {
      throw this.mapError(error)
    }
  }

  private mapError(error: unknown): Error {
    const axiosError = error as AxiosError<{ error?: string }>
    const apiDetail = axiosError.response?.data?.error
    const status = axiosError.response?.status

    if (axiosError.code === 'ECONNABORTED') {
      return new Error('llama3 tardó más de lo esperado en traducir este tramo.')
    }
    if (status === 404 && apiDetail?.toLowerCase().includes('model')) {
      return new OllamaUnavailableError('llama3 aún no está cargado.')
    }
    if (!axiosError.response || status === 502 || status === 503) {
      return new OllamaUnavailableError('Ollama no está respondiendo ahora mismo.')
    }
    return new Error(apiDetail || 'llama3 no pudo completar la traducción.')
  }
}
