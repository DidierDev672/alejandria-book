export type BackupStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface Backup {
  id: string
  name: string
  file_name: string
  size_bytes: number
  status: BackupStatus
  error?: string
  created_at: string
}

export interface ServerStatus {
  database_name: string
  database_host: string
  database_port: string
  total_storage_bytes: number
  used_storage_bytes: number
  backup_count: number
  is_connected: boolean
}

export interface CreateBackupRequest {
  name?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  details?: string
}
