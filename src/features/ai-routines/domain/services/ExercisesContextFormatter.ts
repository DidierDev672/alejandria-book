// ============================================================
// DOMAIN SERVICE - Exercises Context Formatter (SRP)
// Serializa el catálogo GET /exercises para el system prompt del Coach.
// Este JSON es la ÚNICA base permitida para armar rutinas.
// ============================================================

import type { ExercisesCoachCatalog } from '../entities/ExerciseCoach.types'

export class ExercisesContextFormatter {
  /**
   * Inyecta el JSON de ejercicios como única fuente permitida
   * al diseñar rutinas (prohibido inventar ejercicios).
   */
  static toSystemContext(catalog: ExercisesCoachCatalog): string {
    if (!catalog.data.length) {
      return (
        '\n\nCATÁLOGO BASE DE EJERCICIOS (GET /exercises) — OBLIGATORIO:\n' +
        '```json\n{"data":[],"meta":{"total":0,"page":1,"limit":100,"totalPages":1}}\n```\n' +
        'PROHIBIDO inventar ejercicios. El catálogo está vacío: dile al entrenador que registre ejercicios en el sistema antes de diseñar cualquier rutina.'
      )
    }

    const allowlist = catalog.data
      .map(
        (e) =>
          `- id=\`${e.id}\` | name="${e.name}" | muscle_group=${e.muscle_group} | difficulty=${e.difficulty}`,
      )
      .join('\n')

    return (
      '\n\nCATÁLOGO BASE DE EJERCICIOS (GET /exercises) — ÚNICA FUENTE PERMITIDA PARA RUTINAS:\n' +
      '```json\n' +
      `${JSON.stringify(catalog, null, 2)}\n` +
      '```\n\n' +
      'ALLOWLIST RÁPIDA (solo estos ejercicios existen):\n' +
      `${allowlist}\n\n` +
      'REGLA ABSOLUTA — NO INVENTAR EJERCICIOS:\n' +
      '- Todo ejercicio que propongas DEBE existir en `data[]` del JSON anterior (mismo `name`; usa `id` solo para elegir internamente).\n' +
      '- PROHIBIDO inventar nombres, variantes o ejercicios “de la nada” que no estén registrados en GET /exercises.\n' +
      '- PROHIBIDO usar conocimiento genérico de gimnasio para añadir ejercicios fuera del catálogo.\n' +
      '- Si falta un ejercicio que el entrenador pide, dilo y ofrece SOLO alternativas del allowlist.\n' +
      '- Filtra por `muscle_group` y `difficulty` según el miembro, siempre dentro del catálogo.\n' +
      '- En el texto visible al entrenador: muestra nombre (traducido), "grupo muscular …", "dificultad …" y "equipamiento: …" (name de GET /equipment vía equipment_id).\n' +
      '- Ejemplo correcto: "Press banca — grupo muscular pectorales, dificultad intermedia, equipamiento: Banco plano".\n' +
      '- PROHIBIDO: muscle_group=..., difficulty=INTERMEDIATE, ni claves del JSON.\n' +
      '- PROHIBIDO mostrar id ni equipment_id en la rutina visible.'
    )
  }
}
