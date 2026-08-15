// ============================================================
// DOMAIN SERVICE - Member Routine Business Rules
// ============================================================

import {
  MEMBER_ROUTINE_STATUSES,
  DEFAULT_ASSIGNMENT_TYPE,
} from '../entities/MemberRoutine.types'
import type {
  MemberRoutine,
  MemberRoutineFormState,
  MemberRoutineValidationErrors,
  CreateMemberRoutineDTO,
  UpdateMemberRoutineDTO,
  MemberRoutineStatus,
} from '../entities/MemberRoutine.types'
import { WorkoutWritePayloadMapper } from './WorkoutWritePayloadMapper'

export class MemberRoutineDomainService {
  static readonly NAME_MIN = 2
  static readonly NAME_MAX = 120
  static readonly DESCRIPTION_MAX = 500

  static isValidName(name: string): boolean {
    const length = name.trim().length
    return length >= this.NAME_MIN && length <= this.NAME_MAX
  }

  static isValidDescription(description: string): boolean {
    return description.trim().length <= this.DESCRIPTION_MAX
  }

  static isValidStatus(status: string): status is MemberRoutineStatus {
    return (MEMBER_ROUTINE_STATUSES as readonly string[]).includes(status)
  }

  /** end_date es obligatorio y debe ser >= start_date (YYYY-MM-DD) */
  static isValidDateRange(startDate: string, endDate: string): boolean {
    if (!startDate || !endDate) return false
    return endDate >= startDate
  }

  /**
   * Valida el formulario + los ejercicios seleccionados.
   * Devuelve un mapa de errores; vacío si todo es válido.
   */
  static validate(
    form: MemberRoutineFormState,
    exerciseIds: string[] = [],
  ): MemberRoutineValidationErrors {
    const errors: MemberRoutineValidationErrors = {}

    if (!form.member_id.trim()) {
      errors.member_id = 'El ID del miembro es obligatorio'
    }

    if (!form.routine_id.trim()) {
      errors.routine_id = 'Debes seleccionar una rutina base'
    }

    if (exerciseIds.length === 0) {
      errors.exercise_ids = 'Debes agregar al menos un ejercicio a la rutina'
    }

    if (!form.name.trim()) {
      errors.name = 'El nombre de la rutina es obligatorio'
    } else if (!this.isValidName(form.name)) {
      errors.name = `El nombre debe tener entre ${this.NAME_MIN} y ${this.NAME_MAX} caracteres`
    }

    if (!this.isValidDescription(form.description)) {
      errors.description = `La descripción no puede superar ${this.DESCRIPTION_MAX} caracteres`
    }

    if (!form.start_date) {
      errors.start_date = 'La fecha de inicio es obligatoria'
    }

    if (!form.end_date) {
      errors.end_date = 'La fecha de finalización es obligatoria'
    } else if (form.start_date && !this.isValidDateRange(form.start_date, form.end_date)) {
      errors.end_date = 'La fecha de finalización debe ser igual o posterior a la de inicio'
    }

    if (!this.isValidStatus(form.status)) {
      errors.status = 'El estado seleccionado no es válido'
    }

    return errors
  }

  static createEmptyFormState(): MemberRoutineFormState {
    return {
      member_id: '',
      routine_id: '',
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'active',
      assignment_type: DEFAULT_ASSIGNMENT_TYPE,
    }
  }

  /** Convierte un workout existente al estado editable del formulario */
  static toFormState(workout: MemberRoutine): MemberRoutineFormState {
    return {
      member_id: workout.member_id,
      routine_id: workout.routine_id,
      name: workout.name,
      description: workout.description ?? '',
      start_date: this.toDateInputValue(workout.start_date),
      end_date: this.toDateInputValue(workout.end_date),
      status: workout.status,
      assignment_type: workout.assignment_type || DEFAULT_ASSIGNMENT_TYPE,
    }
  }

  /** Normaliza ISO / datetime a YYYY-MM-DD para inputs type="date" */
  static toDateInputValue(value: string): string {
    if (!value) return ''
    return value.slice(0, 10)
  }

  /** Construye el payload de POST /colesio/workouts (delega al mapper SRP) */
  static formStateToDTO(
    form: MemberRoutineFormState,
    exerciseIds: string[],
  ): CreateMemberRoutineDTO {
    return WorkoutWritePayloadMapper.toCreatePayload(form, exerciseIds)
  }

  /** Construye el payload de PUT /colesio/workouts/{id} (delega al mapper SRP) */
  static formStateToUpdateDTO(
    form: MemberRoutineFormState,
    exerciseIds: string[],
  ): UpdateMemberRoutineDTO {
    return WorkoutWritePayloadMapper.toUpdatePayload(form, exerciseIds)
  }

  static normalize(raw: Record<string, unknown>): MemberRoutine {
    const status = String(raw.status ?? 'active')
    const exerciseIds = Array.isArray(raw.exercise_ids)
      ? raw.exercise_ids.map((id) => String(id))
      : []

    return {
      id: String(raw.id ?? ''),
      member_id: String(raw.member_id ?? ''),
      routine_id: String(raw.routine_id ?? ''),
      exercise_ids: exerciseIds,
      name: String(raw.name ?? ''),
      description: String(raw.description ?? ''),
      start_date: String(raw.start_date ?? ''),
      end_date: String(raw.end_date ?? ''),
      status: this.isValidStatus(status) ? status : 'active',
      assignment_type: String(
        raw.assignment_type ?? raw.assigment_type ?? DEFAULT_ASSIGNMENT_TYPE,
      ),
      created_at: String(raw.created_at ?? new Date().toISOString()),
      updated_at: String(raw.updated_at ?? new Date().toISOString()),
    }
  }

  /** Normaliza un listado crudo (array directo o envuelto en { data }) */
  static normalizeList(payload: unknown): MemberRoutine[] {
    const rawList: Record<string, unknown>[] = Array.isArray(payload)
      ? (payload as Record<string, unknown>[])
      : payload &&
          typeof payload === 'object' &&
          Array.isArray((payload as { data?: unknown }).data)
        ? ((payload as { data: Record<string, unknown>[] }).data)
        : []

    return rawList.map((item) => this.normalize(item))
  }

  /** Formatea ISO / YYYY-MM-DD a fecha legible local */
  static formatDisplayDate(value: string): string {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return value.slice(0, 10)
    }
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  static matchesSearch(
    workout: MemberRoutine,
    query: string,
    memberName?: string | null,
  ): boolean {
    const normalized = query
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

    if (!normalized) return true

    const haystack = [
      workout.member_id,
      memberName ?? '',
      workout.name,
      workout.description,
      workout.status,
      workout.routine_id,
      workout.assignment_type,
    ]
      .join(' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()

    return haystack.includes(normalized)
  }
}
