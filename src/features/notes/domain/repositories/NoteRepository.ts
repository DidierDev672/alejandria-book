import type { Note } from "../entities/Note";

/**
 * Contrato abstracto para repositorios de notas (DIP - Inversión de Dependencias)
 * Define las operaciones CRUD que cualquier implementación debe cumplir
 */
export interface NoteRepository {
  /**
   * Crea una nueva nota en el sistema
   * @param note - Datos de la nota a crear
   * @returns Nota creada con ID asignado
   */
  create(note: Note): Promise<Note>;

  /**
   * Obtiene todas las notas del usuario autenticado
   * @returns Array de notas ordenadas por fecha de creación
   */
  findAll(): Promise<Note[]>;

  /**
   * Actualiza una nota existente (PUT completo)
   * @param id - ID de la nota a actualizar
   * @param note - Datos completos de la nota
   * @returns Nota actualizada
   */
  update(id: string, note: Note): Promise<Note>;

  /**
   * Elimina una nota permanentemente
   * @param id - ID de la nota a eliminar
   * @returns true si se eliminó correctamente
   */
  delete(id: string): Promise<boolean>;
}
