// ============================================================
// DOMAIN · Assistance
// Capa 1 — Núcleo de la cebolla.
// Entidades puras + contratos (puertos) que las capas externas
// deben implementar. Aquí NO existe Vue, axios, Pinia ni router.
// ============================================================

export type AssistanceSubmitOutcome = 'success' | 'error'

// ── Payload que la infraestructura debe enviar ───────────────
export interface RegisterAssistancePayload {
  member_id: string
  membership_id: string
  date: string
}

// ── Puerto: contrato que las capas externas deben implementar ─
export interface AssistanceRepository {
  register(payload: RegisterAssistancePayload): Promise<void>
}

// ─────────────────────────────────────────────────────────────
// Servicio de dominio: reglas puras + mensajería psicológica,
// sin efectos secundarios.
// ─────────────────────────────────────────────────────────────
export class AssistanceDomainService {
  static successMessage(): string {
    return 'Su presencia quedó registrada. Hoy sí contó venir: esta asistencia ya vive en la memoria del coliseo y acompaña su constancia.'
  }

  static successTitle(): string {
    return 'Presencia confirmada'
  }

  static errorMessage(): string {
    return 'Se presentó un error al registrar la asistencia. Respira: nada se perdió, lo que elegiste sigue aquí, y podemos intentarlo otra vez.'
  }

  static errorTitle(): string {
    return 'Un tropiezo en el camino'
  }

  static buildPayload(memberId: string, membershipId: string, date: string): RegisterAssistancePayload {
    return {
      member_id: memberId,
      membership_id: membershipId,
      date,
    }
  }
}
