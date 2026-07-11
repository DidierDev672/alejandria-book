import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { MemberProgressService } from "../services/MemberProgressService";
import { HttpMemberProgressRepository } from "../../infrastructure/http/HttpMemberProgressRepository";
import type {
  MemberProgress,
  CreateMemberProgressDTO,
  UpdateMemberProgressDTO,
  MemberProgressFormState,
} from "../../domain/entities/MemberProgress.types";
import type { MemberProgressFilters } from "../../domain/repositories/MemberProgressRepository";

export const useMemberProgressStore = defineStore("memberProgress", () => {
  const progressList = ref<MemberProgress[]>([]);
  const selectedProgress = ref<MemberProgress | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loadingStates = ref<Record<string, boolean>>({});

  const service = new MemberProgressService(new HttpMemberProgressRepository());

  const totalRecords = computed(() => progressList.value.length);
  const hasRecords = computed(() => progressList.value.length > 0);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);

  async function fetchProgress(filters?: MemberProgressFilters): Promise<void> {
    setLoadingState("fetchProgress", true);
    loading.value = true;
    error.value = null;
    try {
      progressList.value = await service.getAll(filters);
    } catch (err: any) {
      error.value = err.message || "Error al cargar el progreso";
    } finally {
      setLoadingState("fetchProgress", false);
      loading.value = false;
    }
  }

  async function fetchProgressByUserId(userId: string): Promise<void> {
    setLoadingState(`fetchProgress-${userId}`, true);
    error.value = null;
    try {
      progressList.value = await service.getByUserId(userId);
    } catch (err: any) {
      error.value = err.message || "Error al cargar el progreso del miembro";
    } finally {
      setLoadingState(`fetchProgress-${userId}`, false);
    }
  }

  async function createProgress(
    data: CreateMemberProgressDTO,
  ): Promise<MemberProgress | null> {
    setLoadingState("createProgress", true);
    loading.value = true;
    error.value = null;
    try {
      if (data.user_id === "") {
        throw new Error("El usuario no fue encontrado");
      }
      const created = await service.create(data);
      progressList.value.unshift(created);
      return created;
    } catch (err: any) {
      error.value = err.message || "Error al registrar el progreso";
      throw err;
    } finally {
      setLoadingState("createProgress", false);
      loading.value = false;
    }
  }

  async function updateProgress(
    id: string,
    data: UpdateMemberProgressDTO,
  ): Promise<MemberProgress | null> {
    setLoadingState(`updateProgress-${id}`, true);
    error.value = null;
    try {
      const updated = await service.update(id, data);
      const index = progressList.value.findIndex((p) => p.id === id);
      if (index !== -1) progressList.value[index] = updated;
      if (selectedProgress.value?.id === id) selectedProgress.value = updated;
      return updated;
    } catch (err: any) {
      error.value = err.message || "Error al actualizar el progreso";
      throw err;
    } finally {
      setLoadingState(`updateProgress-${id}`, false);
    }
  }

  async function deleteProgress(id: string): Promise<void> {
    setLoadingState(`deleteProgress-${id}`, true);
    error.value = null;
    try {
      await service.delete(id);
      progressList.value = progressList.value.filter((p) => p.id !== id);
      if (selectedProgress.value?.id === id) selectedProgress.value = null;
    } catch (err: any) {
      error.value = err.message || "Error al eliminar el progreso";
      throw err;
    } finally {
      setLoadingState(`deleteProgress-${id}`, false);
    }
  }

  function selectProgress(progress: MemberProgress | null): void {
    selectedProgress.value = progress;
  }

  function clearError(): void {
    error.value = null;
  }

  function resetStore(): void {
    progressList.value = [];
    selectedProgress.value = null;
    loading.value = false;
    error.value = null;
    loadingStates.value = {};
  }

  function setLoadingState(operation: string, isLoading: boolean): void {
    loadingStates.value[operation] = isLoading;
  }

  function isOperationLoading(operation: string): boolean {
    return loadingStates.value[operation] || false;
  }

  function createEmptyFormState(): MemberProgressFormState {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return {
      user_id: "",
      user_name: "",
      month_year: `${year}-${month}`,
      recorded_value: "",
      notes: "",
    };
  }

  return {
    progressList,
    selectedProgress,
    loading,
    error,
    loadingStates,
    totalRecords,
    hasRecords,
    isLoading,
    hasError,
    fetchProgress,
    fetchProgressByUserId,
    createProgress,
    updateProgress,
    deleteProgress,
    selectProgress,
    clearError,
    resetStore,
    isOperationLoading,
    createEmptyFormState,
  };
});
