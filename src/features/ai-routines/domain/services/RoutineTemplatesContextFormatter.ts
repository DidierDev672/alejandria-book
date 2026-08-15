// ============================================================
// DOMAIN SERVICE - Routine Templates Context Formatter (SRP)
// Serializa GET /api/routines como referencia OPCIONAL del Coach.
// ============================================================

import type { RoutineTemplateCoachItem } from '../entities/RoutineTemplateCoach.types'

export class RoutineTemplatesContextFormatter {
  /**
   * Inyecta plantillas de rutina. NO son obligatorias:
   * el modelo solo las usa cuando la propuesta lo amerita.
   */
  static toSystemContext(templates: RoutineTemplateCoachItem[]): string {
    if (!templates.length) {
      return (
        '\n\nPLANTILLAS DE RUTINA (GET /api/routines) — REFERENCIA OPCIONAL:\n' +
        '```json\n[]\n```\n' +
        'No hay plantillas registradas. Diseña la rutina con members + exercises + equipment sin forzar una plantilla.'
      )
    }

    return (
      '\n\nPLANTILLAS DE RUTINA (GET /api/routines) — REFERENCIA OPCIONAL (NO OBLIGATORIA):\n' +
      '```json\n' +
      `${JSON.stringify(templates, null, 2)}\n` +
      '```\n\n' +
      'CUÁNDO USAR ESTE JSON (solo si la rutina lo amerita):\n' +
      '- Úsalo si el entrenador pide basarse en una rutina existente, reutilizar estructura (Push Day, etc.), o si una plantilla encaja claramente con el objetivo del miembro.\n' +
      '- Campos: name (requerido), section, repetitions, time_minutes, time_label, notes.\n' +
      '- Puedes tomar name, series/repetitions, tiempo (time_minutes + time_label) y notes como guía de estructura.\n' +
      '- Si un ejercicio/sesión encaja con section o notes de una plantilla, puedes alinearte; si no, NO las uses.\n\n' +
      'CUÁNDO NO USARLO:\n' +
      '- NO es obligatorio. Si la rutina se puede armar bien solo con exercises + equipment + perfil del miembro, hazlo sin forzar una plantilla.\n' +
      '- NUNCA inventes plantillas fuera de este JSON.\n' +
      '- NUNCA muestres IDs técnicos al entrenador.\n' +
      '- Si usas una plantilla, menciona su name en español y traduce section/notes si hace falta; los ejercicios siguen saliendo solo de GET /exercises.'
    )
  }
}
