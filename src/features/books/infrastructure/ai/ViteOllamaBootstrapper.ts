import axios from 'axios'

export class ViteOllamaBootstrapper {
  private readonly bootUrl = '/ollama-boot'

  async boot(): Promise<void> {
    try {
      await axios.post(this.bootUrl, null, { timeout: 10_000 })
    } catch {
      throw new Error(
        'No se pudo despertar a llama3. Si puedes, ejecuta en tu equipo: ollama run llama3',
      )
    }
  }
}
