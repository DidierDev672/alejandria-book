// ============================================================
// DOMAIN SERVICE - Members Context Formatter (SRP)
// Serializa el catálogo GET /members para el system prompt del Coach.
// ============================================================

import type { MemberCoachProfile } from '../entities/MemberCoachProfile.types'

export class MembersContextFormatter {
  /**
   * Inyecta el JSON de miembros como referencia obligatoria
   * cuando el entrenador menciona miembros o usuarios.
   */
  static toSystemContext(members: MemberCoachProfile[]): string {
    if (!members.length) {
      return (
        '\n\nCATÁLOGO DE MIEMBROS (GET /members):\n' +
        '[]\n' +
        'No hay miembros registrados todavía. Si el entrenador menciona un miembro inexistente, indícalo y pide que lo registre primero.'
      )
    }

    return (
      '\n\nCATÁLOGO DE MIEMBROS REGISTRADOS (contrato GET /members — fuente de verdad):\n' +
      '```json\n' +
      `${JSON.stringify(members, null, 2)}\n` +
      '```\n\n' +
      'CÓMO USAR ESTE JSON AL ASIGNAR RUTINAS:\n' +
      '- Identifica al miembro por `name_full` (o documento si el entrenador lo menciona). Usa `id` solo internamente; no lo muestres.\n' +
      '- Prioriza `goals` con `is_achieved: false` para orientar el objetivo de la rutina.\n' +
      '- Usa `weight_kg`, `height_cm`, `bmi`, `body_fat_percentage`, `muscle_mass_kg` y perímetros (`chest_cm`, `waist_cm`, `hip_cm`, `arm_cm`, `leg_cm`) para dosificar volumen e intensidad.\n' +
      '- Respeta `health_conditions` con `is_active: true` (considera `severity` y `notes`) adaptando ejercicios, sin diagnosticar.\n' +
      '- Considera `mental_health` (`stress_level`, `mood`, `sleep_hours`) solo para modular carga y recuperación, nunca como diagnóstico clínico.\n' +
      '- Usa `genre` y `date_of_birth` solo como contexto de planificación de entrenamiento.\n' +
      '- Si el nombre no coincide con ningún registro, dilo claramente y ofrece armar una rutina genérica o pedir más datos.\n' +
      '- Al hablarle al entrenador, traduce a español goal_type, severity, mood, genre, type_document y cualquier etiqueta en inglés del JSON.\n' +
      '- No muestres id de miembro ni otros identificadores técnicos en la respuesta.'
    )
  }
}
