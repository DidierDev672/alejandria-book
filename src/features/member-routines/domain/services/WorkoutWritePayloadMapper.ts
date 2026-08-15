// ============================================================
// DOMAIN SERVICE - Workout write payload factory (SRP)
// Construye únicamente el body HTTP de create/update.
// No valida ni persiste (eso vive en DomainService / UseCase).
// ============================================================

import {
  DEFAULT_ASSIGNMENT_TYPE,
  MEMBER_ROUTINE_STATUSES,
  type MemberRoutineFormState,
  type CreateMemberRoutineDTO,
  type UpdateMemberRoutineDTO,
  type MemberRoutineStatus,
} from '../entities/MemberRoutine.types'

export class WorkoutWritePayloadMapper {
  /**
   * Payload de POST /colesio/workouts
   * description opcional: se omite si está vacía.
   */
  static toCreatePayload(
    form: MemberRoutineFormState,
    exerciseIds: string[],
  ): CreateMemberRoutineDTO {
    const description = form.description.trim()

    return {
      member_id: form.member_id.trim(),
      routine_id: form.routine_id.trim(),
      exercise_ids: [...exerciseIds],
      name: form.name.trim(),
      ...(description ? { description } : {}),
      start_date: this.toDateInputValue(form.start_date),
      end_date: this.toDateInputValue(form.end_date),
      status: this.resolveStatus(form.status),
      assignment_type: form.assignment_type?.trim() || DEFAULT_ASSIGNMENT_TYPE,
    }
  }

  /**
   * Payload de PUT /colesio/workouts/{id}
   * {
   *   member_id, routine_id, exercise_ids (≥1), name,
   *   description, start_date, end_date, status, assignment_type
   * }
   */
  static toUpdatePayload(
    form: MemberRoutineFormState,
    exerciseIds: string[],
  ): UpdateMemberRoutineDTO {
    return {
      member_id: form.member_id.trim(),
      routine_id: form.routine_id.trim(),
      exercise_ids: [...exerciseIds],
      name: form.name.trim(),
      description: form.description.trim(),
      start_date: this.toDateInputValue(form.start_date),
      end_date: this.toDateInputValue(form.end_date),
      status: this.resolveStatus(form.status),
      assignment_type: form.assignment_type?.trim() || DEFAULT_ASSIGNMENT_TYPE,
    }
  }

  private static toDateInputValue(value: string): string {
    if (!value) return ''
    return value.slice(0, 10)
  }

  private static resolveStatus(status: MemberRoutineStatus | string): MemberRoutineStatus {
    return (MEMBER_ROUTINE_STATUSES as readonly string[]).includes(status)
      ? (status as MemberRoutineStatus)
      : 'active'
  }
}
