// ============================================================
// APPLICATION STORE - Routine Pinia Store
// ============================================================

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { RoutineService } from "../services/RoutingService";
import { HttpRoutineRepository } from "../../infrastructure/http/HttpRoutineRepository";
import { RoutineDomainService } from "../../domain/services/RoutingDomainService";
import type {
  Routine,
  RoutineFormState,
  CreateRoutineDTO,
  RoutineValidationErrors,
} from "../../domain/entities/Routine.types";

export const useRoutineStore = defineStore("routines", () => {
  // ============================================================
  // STATE
  // ============================================================

  const routines = ref<Routine[]>([]);
  const filteredRoutines = ref<Routine[]>([]);
  const selectedRoutine = ref<Routine | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ============================================================
  // SERVICE
  // ============================================================

  const routineService = new RoutineService(new HttpRoutineRepository());

  // ============================================================
  // GETTERS
  // ============================================================

  const totalRoutines = computed(() => routines.value.length);
  const hasRoutines = computed(() => routines.value.length > 0);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);

  // ============================================================
  // ACTIONS
  // ============================================================

  async function fetchRoutines(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const fetchedRoutines = await routineService.getRoutines();
      if (fetchedRoutines && fetchedRoutines.length > 0) {
        routines.value = fetchedRoutines;
      } else {
        error.value = "No se encontraron rutinas";
        console.error(
          "[RoutineStore] Error fetching routines:",
          fetchedRoutines,
        );
      }
    } catch (e: any) {
      error.value = e.message || "Error al cargar las rutinas";
      console.error("[RoutineStore] Error fetching routines:", e);
    } finally {
      loading.value = false;
    }
  }

  async function fetchRoutineById(id: string): Promise<Routine | null> {
    loading.value = true;
    error.value = null;

    try {
      const routine = await routineService.getRoutineById(id);
      selectedRoutine.value = routine;
      return routine;
    } catch (e: any) {
      error.value = e.message || "Error al cargar la rutina";
      console.error("[RoutineStore] Error fetching routine:", e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createRoutine(
    data: CreateRoutineDTO,
  ): Promise<Routine | null> {
    loading.value = true;
    error.value = null;

    try {
      const newRoutine = await routineService.createRoutine(data);
      routines.value.unshift(newRoutine);
      return newRoutine;
    } catch (e: any) {
      error.value = e.message || "Error al crear la rutina";
      console.error("[RoutineStore] Error creating routine:", e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateRoutine(
    id: string,
    data: Partial<CreateRoutineDTO>,
  ): Promise<Routine | null> {
    loading.value = true;
    error.value = null;

    try {
      const updatedRoutine = await routineService.updateRoutine(id, {
        id,
        ...data,
      });
      const index = routines.value.findIndex((r) => r.id === id);
      if (index !== -1) {
        routines.value[index] = updatedRoutine;
      }
      return updatedRoutine;
    } catch (e: any) {
      error.value = e.message || "Error al actualizar la rutina";
      console.error("[RoutineStore] Error updating routine:", e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteRoutine(id: string): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      await routineService.deleteRoutine(id);
      routines.value = routines.value.filter((r) => r.id !== id);
      return true;
    } catch (e: any) {
      error.value = e.message || "Error al eliminar la rutina";
      console.error("[RoutineStore] Error deleting routine:", e);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Identificador incremental para descartar respuestas de búsquedas obsoletas
  let searchRequestId = 0;

  async function searchRoutines(query: string): Promise<void> {
    const requestId = ++searchRequestId;
    loading.value = true;
    error.value = null;
    filteredRoutines.value = routines.value;

    try {
      const queryFiltered = filteredRoutines.value.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase()),
      );
      if (requestId === searchRequestId) {
        filteredRoutines.value = queryFiltered;
      }
    } catch (e: any) {
      if (requestId === searchRequestId) {
        error.value = e.message || "Error al buscar rutinas";
      }
      console.error("[RoutineStore] Error searching routines:", e);
    } finally {
      if (requestId === searchRequestId) {
        loading.value = false;
      }
    }
  }

  function clearSearch(): void {
    // Invalida cualquier búsqueda en vuelo para que no repueble los resultados
    searchRequestId++;
    filteredRoutines.value = [];
  }

  // ============================================================
  // FORM HELPERS
  // ============================================================

  function createEmptyFormState(): RoutineFormState {
    return {
      name: "",
      section: "",
      repetitions: "",
      time_minutes: "",
      notes: "",
    };
  }

  function routineToFormState(routine: Routine): RoutineFormState {
    return {
      name: routine.name,
      section: routine.section ?? "",
      repetitions: routine.repetitions ?? "",
      time_minutes: routine.time_minutes,
      notes: routine.notes,
    };
  }

  function resetState(): void {
    routines.value = [];
    selectedRoutine.value = null;
    loading.value = false;
    error.value = null;
  }

  // ============================================================
  // EXPOSED API
  // ============================================================

  return {
    // State
    routines,
    filteredRoutines,
    selectedRoutine,
    loading,
    error,

    // Getters
    totalRoutines,
    hasRoutines,
    isLoading,
    hasError,

    // Actions
    fetchRoutines,
    fetchRoutineById,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    searchRoutines,
    clearSearch,

    // Form Helpers
    createEmptyFormState,
    routineToFormState,
    resetState,
  };
});
