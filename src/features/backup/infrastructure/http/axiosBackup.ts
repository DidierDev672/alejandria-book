import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { Backup, ServerStatus, CreateBackupRequest } from '@/features/backup/domain/entities/Backup'

const axiosBackup = axiosInstance.create({
  baseURL: '/api',
  timeout: 30000,
})

export const BackupApi = {
  async getStatus(): Promise<ServerStatus> {
    const { data } = await axiosBackup.get<ServerStatus>('/status')
    return data
  },

  async listBackups(): Promise<Backup[]> {
    const { data } = await axiosBackup.get<Backup[]>('/backups')
    return data
  },

  async getBackup(id: string): Promise<Backup> {
    const { data } = await axiosBackup.get<Backup>(`/backups/${id}`)
    return data
  },

  async createBackup(request: CreateBackupRequest = {}): Promise<Backup> {
    const { data } = await axiosBackup.post<Backup>('/backups', request)
    return data
  },

  async deleteBackup(id: string): Promise<void> {
    await axiosBackup.delete('/backups', { params: { id } })
  },

  getDownloadUrl(id: string): string {
    return `/api/backups/download?id=${id}`
  },
}

export default BackupApi
