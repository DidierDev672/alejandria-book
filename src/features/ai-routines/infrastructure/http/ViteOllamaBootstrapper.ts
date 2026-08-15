// ============================================================
// INFRASTRUCTURE - Vite Ollama Bootstrapper (Adapter)
// POST /ollama-boot → middleware del dev server de Vite que
// ejecuta "ollama run llama3" en la máquina del entrenador.
// ============================================================

import axios from 'axios'
import type { AiRuntimeBootstrapper } from '../../domain/repositories/AiRuntimeBootstrapper'

export class ViteOllamaBootstrapper implements AiRuntimeBootstrapper {
  private readonly bootUrl = '/ollama-boot'

  async boot(): Promise<void> {
    try {
      await axios.post(this.bootUrl, null, { timeout: 10_000 })
    } catch (error) {
      console.warn('[ViteOllamaBootstrapper] No se pudo solicitar el arranque:', error)
      throw new Error(
        'No se pudo iniciar Ollama automáticamente. Ejecuta manualmente: ollama run llama3',
      )
    }
  }
}
