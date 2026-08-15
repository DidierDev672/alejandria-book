// ============================================================
// DOMAIN SERVICE - Routine Business Rules
// ============================================================

import type { RoutineFormState, CreateRoutineDTO, Routine } from '../entities/Routine.types'

export class RoutineDomainService {
  /**
   * Format minutes to display label (e.g., "20 minutos", "1 hora 30 minutos")
   */
  static formatTimeLabel(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minuto${minutes !== 1 ? 's' : ''}`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (remainingMinutes === 0) {
      return `${hours} hora${hours !== 1 ? 's' : ''}`
    }
    
    return `${hours} hora${hours !== 1 ? 's' : ''} ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}`
  }

  /**
   * Validate routine name
   */
  static isValidName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100
  }

  /**
   * Validate section number
   */
  static isValidSection(section: number | '' | null): boolean {
    if (section === '' || section === null) return true
    return section >= 1 && section <= 100
  }

  /**
   * Validate repetitions
   */
  static isValidRepetitions(reps: number | '' | null): boolean {
    if (reps === '' || reps === null) return true
    return reps >= 1 && reps <= 1000
  }

  /**
   * Validate time in minutes
   */
  static isValidTime(time: number | ''): boolean {
    if (time === '') return false
    return time >= 1 && time <= 600
  }

  /**
   * Transform form state to DTO
   */
  static formStateToDTO(formState: RoutineFormState): CreateRoutineDTO {
    return {
      name: formState.name.trim(),
      section: formState.section !== '' ? Number(formState.section) : null,
      repetitions: formState.repetitions !== '' ? Number(formState.repetitions) : null,
      time_minutes: Number(formState.time_minutes),
      notes: formState.notes.trim() || undefined
    }
  }

  /**
   * Transform API response to domain entity
   */
  static normalizeRoutine(raw: Record<string, unknown>): Routine {
    const timeMinutes = Number(raw.time_minutes ?? 0)
    
    return {
      id: String(raw.id ?? ''),
      name: String(raw.name ?? ''),
      section: raw.section != null ? Number(raw.section) : null,
      repetitions: raw.repetitions != null ? Number(raw.repetitions) : null,
      time_minutes: timeMinutes,
      time_label: this.formatTimeLabel(timeMinutes),
      notes: String(raw.notes ?? ''),
      created_at: String(raw.created_at ?? new Date().toISOString()),
      updated_at: String(raw.updated_at ?? new Date().toISOString())
    }
  }
}
