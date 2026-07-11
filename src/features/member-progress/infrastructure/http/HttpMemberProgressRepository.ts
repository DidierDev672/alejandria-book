import axiosInstance from "@/infrastructure/http/axiosInstance";
import type {
  MemberProgress,
  CreateMemberProgressDTO,
  UpdateMemberProgressDTO,
} from "../../domain/entities/MemberProgress.types";
import type {
  MemberProgressRepository,
  MemberProgressFilters,
} from "../../domain/repositories/MemberProgressRepository";

function normalizeProgress(raw: Record<string, unknown>): MemberProgress {
  return {
    id: String(raw.id ?? ""),
    user_id: String(raw.user_id ?? ""),
    user_name: raw.user_name ? String(raw.user_name) : undefined,
    month_year: String(raw.month_year ?? ""),
    recorded_value: Number(raw.recorded_value ?? 0),
    notes: raw.notes ? String(raw.notes) : undefined,
    created_at: String(raw.created_at ?? new Date().toISOString()),
    updated_at: String(raw.updated_at ?? new Date().toISOString()),
  };
}

function normalizeList(data: unknown): MemberProgress[] {
  if (Array.isArray(data))
    return data.map((item) =>
      normalizeProgress(item as Record<string, unknown>),
    );
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { data?: unknown[] }).data)
  ) {
    return (data as { data: Record<string, unknown>[] }).data.map(
      normalizeProgress,
    );
  }
  if (data && typeof data === "object")
    return [normalizeProgress(data as Record<string, unknown>)];
  return [];
}

export class HttpMemberProgressRepository implements MemberProgressRepository {
  private readonly baseUrl = "/progress-member";

  async findAll(filters?: MemberProgressFilters): Promise<MemberProgress[]> {
    try {
      const response = await axiosInstance.get(this.baseUrl, {
        params: filters,
      });
      return normalizeList(response.data);
    } catch (error: any) {
      console.error(
        "[HttpMemberProgressRepository] Error fetching progress:",
        error,
      );
      throw new Error("Error al cargar el progreso");
    }
  }

  async findById(id: string): Promise<MemberProgress | null> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
      return normalizeProgress(response.data as Record<string, unknown>);
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error(
        "[HttpMemberProgressRepository] Error fetching progress by ID:",
        error,
      );
      throw new Error(`Error al cargar progreso ${id}`);
    }
  }

  async findByUserId(userId: string): Promise<MemberProgress[]> {
    try {
      const response = await axiosInstance.get(`/members/${userId}/progress`);
      return normalizeList(response.data);
    } catch (error: any) {
      console.error(
        "[HttpMemberProgressRepository] Error fetching progress by user:",
        error,
      );
      throw new Error("Error al cargar el progreso del miembro");
    }
  }

  async create(data: CreateMemberProgressDTO): Promise<MemberProgress> {
    try {
      if (data.user_id === "") {
        throw new Error("El usuario no fue encontrado");
      }

      if (data.recorded_value === 0) {
        throw new Error("El valor registrado no puede ser 0");
      }

      if (data.recorded_value === null) {
        throw new Error("El valor registrado no puede ser null");
      }

      if (data.recorded_value === undefined) {
        throw new Error("El valor registrado no puede ser undefined");
      }

      if (data === undefined) {
        throw new Error("Los datos proporcionados no son válidos");
      }

      if (data === null) {
        throw new Error("Los datos proporcionados no son válidos");
      }

      const response = await axiosInstance.post<MemberProgress>(
        this.baseUrl,
        data,
      );
      return normalizeProgress(
        response.data as unknown as Record<string, unknown>,
      );
    } catch (error: any) {
      console.error(
        "[HttpMemberProgressRepository] Error creating progress:",
        error,
      );

      const message = error;
      console.log(`Mensaje de error del backend: ${message}`);
      if (error.response?.status === 409)
        throw new Error("Ya existe un registro para este miembro y mes");
      if (error.response?.status === 422)
        throw new Error("Los datos proporcionados no son válidos");
      throw new Error("Error al registrar el progreso");
    }
  }

  async update(
    id: string,
    data: UpdateMemberProgressDTO,
  ): Promise<MemberProgress> {
    try {
      const response = await axiosInstance.put<MemberProgress>(
        `${this.baseUrl}/${id}`,
        data,
      );
      return normalizeProgress(
        response.data as unknown as Record<string, unknown>,
      );
    } catch (error: any) {
      console.error(
        "[HttpMemberProgressRepository] Error updating progress:",
        error,
      );
      if (error.response?.status === 404)
        throw new Error("El progreso no fue encontrado");
      throw new Error("Error al actualizar el progreso");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      console.error(
        "[HttpMemberProgressRepository] Error deleting progress:",
        error,
      );
      if (error.response?.status === 404)
        throw new Error("El progreso no fue encontrado");
      throw new Error("Error al eliminar el progreso");
    }
  }
}
