import axiosInstance from "@/infrastructure/http/axiosInstance";
import type { NoteRepository } from "../../domain/repositories/NoteRepository";
import type { Note } from "../../domain/entities/Note";

/**
 * Implementación concreta del repositorio de notas usando Axios
 * Capa de Infraestructura - Lado izquierdo de la arquitectura Onion
 */
export class AxiosNoteRepository implements NoteRepository {
  private readonly apiURL = `/notes`;

  /**
   * Crea una nueva nota en el servidor
   * Transforma la entidad de dominio al formato esperado por la API
   */
  async create(note: Note): Promise<Note> {
    const payload = {
      name: note.name,
      content: note.content,
      type: note.type,
      color: note.color,
      id_book: note.idBook,
      id_topic: note.idTopics,
    };

    const response = await axiosInstance.post<Note>(this.apiURL, payload);
    return response.data;
  }

  /**
   * Obtiene todas las notas del usuario autenticado
   * Realiza una petición GET asíncrona al endpoint de notas
   */
  async findAll(): Promise<Note[]> {
    const response = await axiosInstance.get<Note[]>(this.apiURL);

    // Control robusto para respuestas que podrían venir como string (casos edge del backend)
    if (typeof response.data === "string") {
      return JSON.parse(response.data) as Note[];
    }

    return response.data as Note[];
  }

  /**
   * Actualiza una nota existente mediante PUT
   * Requiere todos los campos de la nota (reemplazo completo)
   */
  async update(id: string, note: Note): Promise<Note> {
    const payload = {
      name: note.name,
      content: note.content,
      type: note.type,
      color: note.color,
      id_book: note.idBook,
      id_topic: note.idTopics,
    };

    const response = await axiosInstance.put<Note>(`${this.apiURL}/${id}`, payload);

    if (typeof response.data === "string") {
      return JSON.parse(response.data) as Note;
    }

    return response.data as Note;
  }

  /**
   * Elimina una nota permanentemente
   * @returns true si la eliminación fue exitosa
   */
  async delete(id: string): Promise<boolean> {
    await axiosInstance.delete(`${this.apiURL}/${id}`);
    return true;
  }
}
