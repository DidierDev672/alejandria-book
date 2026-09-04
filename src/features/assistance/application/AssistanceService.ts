import type { RegisterAssistancePayload, AssistanceRepository } from '../domain/Assistance'

// ============================================================
// APPLICATION · AssistanceService
// Capa 2 — Orquesta los casos de uso. Conoce el puerto
// (depende de la abstracción), no del adaptador concreto.
// ============================================================

export class AssistanceService {
  private repository: AssistanceRepository

  constructor(repository: AssistanceRepository) {
    this.repository = repository
  }

  async registerAssistance(payload: RegisterAssistancePayload): Promise<void> {
    await this.repository.register(payload)
  }
}
