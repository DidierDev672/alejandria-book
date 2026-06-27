import axiosExercise from "@/features/exercise/infrastructure/http/axiosExercise";

// ============================================================
// INTERFACES
// ============================================================

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  video_url?: string;
  equipment_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExerciseDTO {
  name: string;
  muscle_group: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  video_url?: string;
  equipment_id: string;
}

export interface UpdateExerciseDTO {
  name?: string;
  muscle_group?: string;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  video_url?: string;
}

export interface ExerciseFilters {
  search?: string;
  muscle_group?: string;
  difficulty?: string;
  equipment_id?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================
// SERVICIO DE EJERCICIOS
// ============================================================

export const ExerciseService = {
  /**
   * Obtener lista de ejercicios con filtros opcionales
   * @param filters - Filtros de búsqueda y paginación
   */
  async getAll(
    filters: ExerciseFilters = {},
  ): Promise<PaginatedResponse<Exercise>> {
    const { data } = await axiosExercise.get<PaginatedResponse<Exercise>>("", {
      params: filters,
    });
    return data;
  },

  /**
   * Obtener un ejercicio por ID
   * @param id - ID del ejercicio
   */
  async getById(id: string): Promise<Exercise> {
    const { data } = await axiosExercise.get<Exercise>(`/${id}`);
    return data;
  },

  /**
   * Crear un nuevo ejercicio
   * @param exerciseData - Datos del ejercicio
   * @param videoFile - Archivo de video (opcional)
   */
  async create(exerciseData: CreateExerciseDTO): Promise<Exercise> {
    const { data } = await axiosExercise.post<Exercise>("", {
      name: exerciseData.name,
      muscleGroup: exerciseData.muscle_group,
      difficulty: exerciseData.difficulty,
      equipmentId: exerciseData.equipment_id,
      video: exerciseData.video_url || "",
    });
    return data;
  },

  /**
   * Crear múltiples ejercicios (bulk create)
   * @param exercises - Array de ejercicios a crear
   */
  async createBulk(exercises: CreateExerciseDTO[]): Promise<Exercise[]> {
    const results: Exercise[] = [];
    for (const exercise of exercises) {
      const created = await this.create(exercise);
      results.push(created);
    }
    return results;
  },

  /**
   * Actualizar un ejercicio existente
   * @param id - ID del ejercicio
   * @param updateData - Datos a actualizar
   */
  async update(id: string, updateData: UpdateExerciseDTO): Promise<Exercise> {
    const payload: Record<string, string> = {};
    if (updateData.name) payload.name = updateData.name;
    if (updateData.muscle_group) payload.muscleGroup = updateData.muscle_group;
    if (updateData.difficulty) payload.difficulty = updateData.difficulty;
    if (updateData.video_url) payload.video = updateData.video_url;

    const { data } = await axiosExercise.put<Exercise>(`/${id}`, payload);
    return data;
  },

  /**
   * Eliminar un ejercicio
   * @param id - ID del ejercicio a eliminar
   */
  async delete(id: string): Promise<void> {
    await axiosExercise.delete(`/${id}`);
  },

  /**
   * Obtener ejercicios por equipo
   * @param equipmentId - ID del equipo
   */
  async getByEquipmentId(equipmentId: string): Promise<Exercise[]> {
    try {
      const { data } = await axiosExercise.get<PaginatedResponse<Exercise>>("", {
        params: { equipment_id: equipmentId }
      });
      return data?.data || data || [];
    } catch (error: any) {
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Subir video para un ejercicio
   * @param id - ID del ejercicio
   * @param videoFile - Archivo de video
   */
  async uploadVideo(
    id: string,
    videoFile: File,
  ): Promise<{ video_url: string }> {
    const formData = new FormData();
    formData.append("video", videoFile);

    const { data } = await axiosExercise.post<{ video_url: string }>(
      `/${id}/video`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data;
  },
};

export default ExerciseService;
