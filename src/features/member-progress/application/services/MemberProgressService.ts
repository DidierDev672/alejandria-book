import type { MemberProgress, CreateMemberProgressDTO, UpdateMemberProgressDTO } from '../../domain/entities/MemberProgress.types'
import type { MemberProgressRepository, MemberProgressFilters } from '../../domain/repositories/MemberProgressRepository'

export class MemberProgressService {
  constructor(private readonly repository: MemberProgressRepository) {}

  async getAll(filters?: MemberProgressFilters): Promise<MemberProgress[]> {
    return this.repository.findAll(filters)
  }

  async getById(id: string): Promise<MemberProgress> {
    const progress = await this.repository.findById(id)
    if (!progress) throw new Error('Progreso no encontrado')
    return progress
  }

  async getByUserId(userId: string): Promise<MemberProgress[]> {
    return this.repository.findByUserId(userId)
  }

  async create(data: CreateMemberProgressDTO): Promise<MemberProgress> {
    return this.repository.create(data)
  }

  async update(id: string, data: UpdateMemberProgressDTO): Promise<MemberProgress> {
    return this.repository.update(id, data)
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}