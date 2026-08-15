// ============================================================
// DOMAIN SERVICE - Exercise Catalog Guard (SRP)
// Garantiza que las rutinas del Coach solo usen ejercicios
// registrados en GET /exercises (no inventados).
// ============================================================

import type {
  ExerciseCoachItem,
  ExercisesCoachCatalog,
} from '../entities/ExerciseCoach.types'

export interface CatalogValidationResult {
  /** Respuesta original o anotada si hubo ejercicios fuera de catálogo */
  content: string
  /** true si la respuesta referencia al menos un ejercicio del catálogo */
  usedCatalogExercises: boolean
  /** IDs mencionados que NO existen en /exercises */
  unknownIds: string[]
}

const ID_PATTERN =
  /\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[a-z0-9_-]{6,})\b/gi

const ROUTINE_HINT =
  /\b(rutina|ejercicio|series?|repeticion|repeticiones|reps?|entrenamiento|workout)\b/i

export class ExerciseCatalogGuard {
  /** Índice rápido id → ejercicio y nombres normalizados del catálogo */
  static index(catalog: ExercisesCoachCatalog): {
    byId: Map<string, ExerciseCoachItem>
    names: string[]
  } {
    const byId = new Map<string, ExerciseCoachItem>()
    const names: string[] = []
    for (const item of catalog.data) {
      if (item.id) byId.set(item.id, item)
      if (item.name.trim()) names.push(item.name.trim().toLowerCase())
    }
    return { byId, names }
  }

  /**
   * Valida la respuesta del modelo contra el catálogo.
   * Si detecta IDs inventados o una rutina sin ejercicios del catálogo,
   * anexa una advertencia para el entrenador.
   */
  static validateResponse(
    content: string,
    catalog: ExercisesCoachCatalog,
  ): CatalogValidationResult {
    if (!catalog.data.length) {
      const annotated =
        content.trim() +
        '\n\n---\n' +
        '⚠️ **Catálogo vacío:** no hay ejercicios registrados en `GET /exercises`. ' +
        'Registra ejercicios en el sistema antes de diseñar rutinas. ' +
        'No se pueden inventar ejercicios fuera del endpoint.'
      return { content: annotated, usedCatalogExercises: false, unknownIds: [] }
    }

    const { byId, names } = this.index(catalog)
    const knownIds = new Set(byId.keys())

    const mentionedIds = this.extractCandidateIds(content)
    const unknownIds = mentionedIds.filter((id) => !knownIds.has(id))
    const knownMentioned = mentionedIds.filter((id) => knownIds.has(id))

    const lower = content.toLowerCase()
    const matchedByName = names.filter((name) => name.length >= 3 && lower.includes(name))
    const usedCatalogExercises = knownMentioned.length > 0 || matchedByName.length > 0

    let annotated = content

    if (unknownIds.length > 0) {
      annotated +=
        '\n\n---\n' +
        '⚠️ **Atención:** algunos ejercicios de la propuesta no están registrados en el catálogo del sistema. ' +
        'Vuelve a pedir la rutina usando solo ejercicios existentes (por nombre).'
    } else if (ROUTINE_HINT.test(content) && !usedCatalogExercises) {
      annotated +=
        '\n\n---\n' +
        '⚠️ **Recordatorio de catálogo:** al diseñar rutinas debes usar únicamente ejercicios ' +
        'registrados en el sistema (por su nombre). No inventes ejercicios.'
    }

    return { content: annotated, usedCatalogExercises, unknownIds }
  }

  private static extractCandidateIds(content: string): string[] {
    const found = new Set<string>()
    // Preferencias: "id: xxx", "(id: xxx)", "`xxx`" junto a ejercicio
    const explicit =
      /(?:\bid\b\s*[:=]\s*|ejercicio\s*#?\s*|\[)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[a-z0-9_-]{6,})/gi

    let match: RegExpExecArray | null
    while ((match = explicit.exec(content)) !== null) {
      found.add(match[1])
    }

    // UUIDs sueltos también cuentan
    const uuidOnly =
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi
    while ((match = uuidOnly.exec(content)) !== null) {
      found.add(match[0])
    }

    // Evita ruido del patrón genérico si no hubo matches explícitos
    if (found.size === 0) {
      while ((match = ID_PATTERN.exec(content)) !== null) {
        const candidate = match[1]
        // Descarta palabras comunes / markdown
        if (
          !/^(beginner|intermediate|advanced|series|reps|minuto|minutos|http|https|markdown)$/i.test(
            candidate,
          )
        ) {
          // Solo aceptar si parece id técnico (uuid ya cubierto; hyphen/underscore ids)
          if (candidate.includes('-') || candidate.includes('_')) {
            found.add(candidate)
          }
        }
      }
    }

    return [...found]
  }
}
