import type {
  ExerciseAssignment,
  ExerciseAssignmentPayload,
} from '../entities/ExerciseAssignment.types'

export interface ExerciseAssignmentRepository {
  create(payload: ExerciseAssignmentPayload): Promise<ExerciseAssignment>
  findAll(): Promise<ExerciseAssignment[]>
  delete(id: string): Promise<void>
}
