import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Note } from "../domain/entities/Note";
import { AxiosNoteRepository } from "../infrastructure/repositories/AxiosNoteRepository";
import { hasActiveSession } from "@/infrastructure/http/axiosInstance";

/**
 * Store de Pinia para gestión de notas
 * SRP: Única responsabilidad - gestionar el estado de las notas
 * DIP: Depende de la abstracción NoteRepository, no de la implementación concreta
 */
const noteRepository = new AxiosNoteRepository();

export const useNoteStore = defineStore("notes", () => {
  // Estado reactivo usando refs (reactividad de Vue 3)
  const notesList = ref<Note[]>([]);
  const isLoading = ref<boolean>(false);
  const isLoadingList = ref<boolean>(false);
  const isSubmitting = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Computed property para verificar autenticación
  const isAuthenticated = computed(() => hasActiveSession());

  /**
   * Carga todas las notas del usuario desde el servidor
   * GET /notes - Operación asíncrona con manejo de estado de carga y errores
   */
  async function loadNotes(): Promise<void> {
    isLoadingList.value = true;
    error.value = null;

    try {
      notesList.value = (await noteRepository.findAll()) ?? [];
    } catch (err: any) {
      error.value = err.message || "Error al cargar las notas";
      console.error("[NoteStore] Error cargando notas:", err);
      notesList.value = [];
    } finally {
      isLoadingList.value = false;
    }
  }

  /**
   * Registra una nueva nota en el sistema
   * POST /notes - Crea recurso en el servidor
   */
  async function registerNote(note: Note): Promise<boolean> {
    if (!isAuthenticated.value) {
      error.value = "Debes iniciar sesión para crear notas";
      return false;
    }

    isSubmitting.value = true;
    error.value = null;

    try {
      await noteRepository.create({
        ...note,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Recargar la lista para incluir la nueva nota
      await loadNotes();
      return true;
    } catch (err: any) {
      error.value = err.message || "Error al guardar la nota";
      console.error("[NoteStore] Error registrando nota:", err);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  /**
   * Actualiza una nota existente completamente
   * PUT /notes/:id - Reemplazo completo del recurso
   */
  async function updateNote(id: string, note: Note): Promise<boolean> {
    if (!isAuthenticated.value) {
      error.value = "Debes iniciar sesión para actualizar notas";
      return false;
    }

    isSubmitting.value = true;
    error.value = null;

    try {
      await noteRepository.update(id, {
        ...note,
        updatedAt: new Date(),
      });

      // Actualizar la nota en la lista local sin recargar toda la lista
      const index = notesList.value.findIndex((n) => n.id === id);
      if (index !== -1) {
        notesList.value[index] = { ...note, id, updatedAt: new Date() };
      }

      return true;
    } catch (err: any) {
      error.value = err.message || "Error al actualizar la nota";
      console.error("[NoteStore] Error actualizando nota:", err);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  /**
   * Elimina una nota permanentemente
   * DELETE /notes/:id - Eliminación de recurso
   */
  async function deleteNote(id: string): Promise<boolean> {
    if (!isAuthenticated.value) {
      error.value = "Debes iniciar sesión para eliminar notas";
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      await noteRepository.delete(id);

      // Eliminar la nota de la lista local para no recargar
      notesList.value = notesList.value.filter((n) => n.id !== id);

      return true;
    } catch (err: any) {
      error.value = err.message || "Error al eliminar la nota";
      console.error("[NoteStore] Error eliminando nota:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Limpia el mensaje de error actual
   */
  function clearError(): void {
    error.value = null;
  }

  return {
    // Estado
    notesList,
    isLoading,
    isLoadingList,
    isSubmitting,
    error,
    isAuthenticated,

    // Acciones
    loadNotes,
    registerNote,
    updateNote,
    deleteNote,
    clearError,
  };
});
