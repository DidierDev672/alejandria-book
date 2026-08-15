// ============================================================
// APPLICATION SERVICE - Routine Use Cases
// ============================================================

import axios from "axios";
import type {
  Routine,
  CreateRoutineDTO,
  UpdateRoutineDTO,
} from "../../domain/entities/Routine.types";
import type { RoutineRepository } from "../../domain/repositories/RoutingRepository";

export class RoutineService {
  constructor(private readonly repository: RoutineRepository) {}

  async getRoutines(): Promise<Routine[]> {
    try {
      const response = await axios.get<void>("/api/routines");
      if (response.status !== 200) {
        throw new Error("Failed to fetch routines");
      }

      const routines = this.mapperRoutine(
        response.data,
      ) as unknown as Routine[];
      return routines as Routine[];
    } catch (error) {
      console.error("[RoutineService] Error fetching routines:", error);
      throw error;
    }
  }

  async getRoutineById(id: string): Promise<Routine | null> {
    return this.repository.findById(id);
  }

  async createRoutine(data: CreateRoutineDTO): Promise<Routine> {
    return this.repository.create(data);
  }

  async updateRoutine(id: string, data: UpdateRoutineDTO): Promise<Routine> {
    return this.repository.update(id, data);
  }

  async deleteRoutine(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async searchRoutines(query: string): Promise<Routine[]> {
    return this.repository.search(query);
  }

  private mapperRoutine(routine: any): Routine {
    const mappedRoutine = routine.data.map((routine: any) => {
      return {
        id: routine.id,
        name: routine.name,
        section: routine.section,
        repetitions: routine.repetitions,
        time_minutes: routine.time_minutes,
        time_label: routine.time_label,
        notes: routine.notes,
        created_at: routine.created_at,
        updated_at: routine.updated_at,
      };
    });
    return mappedRoutine;
  }
}
