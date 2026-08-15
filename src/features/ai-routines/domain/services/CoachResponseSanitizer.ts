// ============================================================
// DOMAIN SERVICE - Coach Response Sanitizer (SRP)
// Limpia IDs técnicos y humaniza etiquetas del endpoint
// (muscle_group, difficulty, etc.) para el entrenador.
// ============================================================

import type { ExercisesCoachCatalog } from '../entities/ExerciseCoach.types'
import type { MemberCoachProfile } from '../entities/MemberCoachProfile.types'
import type { EquipmentCoachItem } from '../entities/EquipmentCoach.types'

const UUID_RE =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi

const LABELED_ID_RE =
  /(?:\*\*)?(?:id|ID|Id|equipment[_ ]?id|equipmentId|member[_ ]?id|memberId|exercise[_ ]?id|exerciseId)(?:\*\*)?\s*[:=]\s*`?["']?[^\s,;)`"']+`?["']?/gi

const PAREN_ID_RE =
  /[([]\s*(?:id|ID|equipment[_ ]?id)\s*[:=]\s*[^)\]]+[)\]]/gi

const TRAILING_ID_RE =
  /\s*[—\-–,|]\s*(?:\*\*)?(?:id|ID)(?:\*\*)?\s*[:=]?\s*`?["']?[^\s,;)`"']+`?["']?/gi

/** Bloques tipo (muscle_group=X, difficulty=Y) o con comas huérfanas tras quitar id */
const FIELD_BLOCK_RE =
  /\(\s*,?\s*(?:muscle[_ ]?group|difficulty|equipment[_ ]?id|name)\s*=[\s\S]*?\)/gi

const MUSCLE_FIELD_RE =
  /(?:\*\*)?muscle[_ ]?group(?:\*\*)?\s*[:=]\s*`?["']?([^,;)`"'\n]+)["']?`?/gi

const DIFFICULTY_FIELD_RE =
  /(?:\*\*)?difficulty(?:\*\*)?\s*[:=]\s*`?["']?([^,;)`"'\n]+)["']?`?/gi

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'principiante',
  intermediate: 'intermedia',
  advanced: 'avanzada',
  principiante: 'principiante',
  intermedio: 'intermedia',
  intermedia: 'intermedia',
  avanzado: 'avanzada',
  avanzada: 'avanzada',
}

const MUSCLE_LABELS: Record<string, string> = {
  chest: 'pectorales',
  pectorals: 'pectorales',
  pectorales: 'pectorales',
  pecho: 'pectorales',
  back: 'espalda',
  espalda: 'espalda',
  shoulders: 'hombros',
  hombros: 'hombros',
  biceps: 'bíceps',
  bíceps: 'bíceps',
  triceps: 'tríceps',
  tríceps: 'tríceps',
  legs: 'piernas',
  piernas: 'piernas',
  quads: 'cuádriceps',
  quadriceps: 'cuádriceps',
  cuádriceps: 'cuádriceps',
  hamstrings: 'isquiotibiales',
  isquiotibiales: 'isquiotibiales',
  glutes: 'glúteos',
  gluteos: 'glúteos',
  glúteos: 'glúteos',
  calves: 'pantorrillas',
  pantorrillas: 'pantorrillas',
  core: 'core',
  abs: 'abdominales',
  abdominales: 'abdominales',
  cardio: 'cardio',
  'full body': 'cuerpo completo',
  full_body: 'cuerpo completo',
}

export class CoachResponseSanitizer {
  /**
   * Prepara la respuesta para el entrenador:
   * oculta IDs y convierte muscle_group/difficulty a español legible.
   */
  static toTrainerFriendly(
    content: string,
    catalog?: ExercisesCoachCatalog,
    members?: MemberCoachProfile[],
    equipment?: EquipmentCoachItem[],
    routineTemplateIds?: string[],
  ): string {
    let cleaned = this.humanizeExerciseFields(content)
    cleaned = this.hideIds(cleaned, catalog, members, equipment, routineTemplateIds)
    cleaned = this.humanizeExerciseFields(cleaned)
    return this.cosmeticCleanup(cleaned)
  }

  static hideIds(
    content: string,
    catalog?: ExercisesCoachCatalog,
    members?: MemberCoachProfile[],
    equipment?: EquipmentCoachItem[],
    routineTemplateIds?: string[],
  ): string {
    let cleaned = content

    cleaned = cleaned.replace(LABELED_ID_RE, '')
    cleaned = cleaned.replace(PAREN_ID_RE, '')
    cleaned = cleaned.replace(TRAILING_ID_RE, '')
    cleaned = cleaned.replace(UUID_RE, '')

    const knownIds = [
      ...(catalog?.data ?? []).flatMap((e) => [e.id, e.equipment_id]),
      ...(members ?? []).map((m) => m.id),
      ...(equipment ?? []).map((e) => e.id),
      ...(routineTemplateIds ?? []),
    ].filter((id) => id && id.length >= 4)

    knownIds.sort((a, b) => b.length - a.length)
    for (const id of knownIds) {
      const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      cleaned = cleaned.replace(new RegExp(`\`?${escaped}\`?`, 'gi'), '')
    }

    return cleaned
  }

  /**
   * Convierte fragmentos técnicos a prosa:
   * (, muscle_group=Pectorales, difficulty=INTERMEDIATE)
   * → grupo muscular pectorales y dificultad intermedia
   */
  static humanizeExerciseFields(content: string): string {
    let cleaned = content

    // Primero bloques entre paréntesis con varios campos
    cleaned = cleaned.replace(FIELD_BLOCK_RE, (block) => {
      const muscle = this.extractField(block, MUSCLE_FIELD_RE)
      const difficulty = this.extractField(block, DIFFICULTY_FIELD_RE)
      const parts: string[] = []
      if (muscle) parts.push(`grupo muscular ${this.translateMuscle(muscle)}`)
      if (difficulty) parts.push(`dificultad ${this.translateDifficulty(difficulty)}`)
      return parts.length ? parts.join(' y ') : ''
    })

    // Campos sueltos fuera de paréntesis
    cleaned = cleaned.replace(MUSCLE_FIELD_RE, (_, raw: string) => {
      return `grupo muscular ${this.translateMuscle(raw)}`
    })
    cleaned = cleaned.replace(DIFFICULTY_FIELD_RE, (_, raw: string) => {
      return `dificultad ${this.translateDifficulty(raw)}`
    })

    // Enums de dificultad sueltos que aún queden en mayúsculas técnicas
    cleaned = cleaned.replace(
      /\b(BEGINNER|INTERMEDIATE|ADVANCED)\b/g,
      (match) => this.translateDifficulty(match),
    )

    return cleaned
  }

  private static extractField(block: string, pattern: RegExp): string | null {
    const re = new RegExp(pattern.source, pattern.flags)
    const match = re.exec(block)
    return match?.[1]?.trim() || null
  }

  private static translateDifficulty(raw: string): string {
    const key = raw.trim().toLowerCase()
    return DIFFICULTY_LABELS[key] ?? key.toLowerCase()
  }

  private static translateMuscle(raw: string): string {
    const key = raw.trim().toLowerCase().replace(/[_-]+/g, ' ')
    return MUSCLE_LABELS[key] ?? key
  }

  private static cosmeticCleanup(content: string): string {
    return content
      .replace(/\(\s*,/g, '(')
      .replace(/,\s*\)/g, ')')
      .replace(/\(\s*\)/g, '')
      .replace(/\[\s*\]/g, '')
      .replace(/`\s*`/g, '')
      .replace(/\(\s*,\s*/g, '(')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\s+([,.;:])/g, '$1')
      .replace(/,\s*,+/g, ',')
      .trim()
  }
}
