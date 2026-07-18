import { ref, computed } from 'vue'
import type { Backup, ServerStatus } from '@/features/backup/domain/entities/Backup'
import { BackupApi } from '@/features/backup/infrastructure/http/axiosBackup'

export function useBackups() {
  const backups = ref<Backup[]>([])
  const serverStatus = ref<ServerStatus | null>(null)
  const isLoading = ref(false)
  const isCreating = ref(false)
  const error = ref<string | null>(null)

  const completedBackups = computed(() =>
    backups.value.filter(b => b.status === 'completed')
  )

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const fetchStatus = async () => {
    try {
      serverStatus.value = await BackupApi.getStatus()
    } catch (err: any) {
      console.error('Failed to fetch server status:', err)
    }
  }

  const fetchBackups = async () => {
    isLoading.value = true
    error.value = null
    try {
      backups.value = (await BackupApi.listBackups()) ?? []
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to load backups'
    } finally {
      isLoading.value = false
    }
  }

  const createBackup = async (name?: string): Promise<Backup | undefined> => {
    isCreating.value = true
    error.value = null
    try {
      const created = await BackupApi.createBackup({ name })
      await fetchBackups()
      await fetchStatus()
      return created
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create backup'
      throw err
    } finally {
      isCreating.value = false
    }
  }

  const deleteBackup = async (id: string) => {
    try {
      await BackupApi.deleteBackup(id)
      await fetchBackups()
      await fetchStatus()
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete backup'
      throw err
    }
  }

  const downloadBackup = (id: string) => {
    const url = BackupApi.getDownloadUrl(id)
    const link = document.createElement('a')
    link.href = url
    link.download = ''
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    backups,
    serverStatus,
    isLoading,
    isCreating,
    error,
    completedBackups,
    formatBytes,
    formatDate,
    fetchStatus,
    fetchBackups,
    createBackup,
    deleteBackup,
    downloadBackup,
  }
}
