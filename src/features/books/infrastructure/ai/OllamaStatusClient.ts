import axios from 'axios'

export class OllamaStatusClient {
  private readonly tagsUrl = '/ollama/api/tags'

  async isRunning(): Promise<boolean> {
    try {
      const response = await axios.get(this.tagsUrl, { timeout: 3_000 })
      return response.status === 200
    } catch {
      return false
    }
  }

  async hasLlama3(): Promise<boolean> {
    try {
      const response = await axios.get<{ models?: Array<{ name?: string }> }>(this.tagsUrl, {
        timeout: 3_000,
      })
      const models = response.data?.models ?? []
      return models.some((model) => (model.name ?? '').toLowerCase().includes('llama3'))
    } catch {
      return false
    }
  }
}
