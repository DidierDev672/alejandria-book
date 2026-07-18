<script setup>
import { onMounted } from 'vue'
import { useBackups } from '@/features/backup/application/composables/useBackups'
import { BackupApi } from '@/features/backup/infrastructure/http/axiosBackup'
import ServerStatus from '@/features/backup/presentation/components/molecules/ServerStatus.vue'
import CreateBackupButton from '@/features/backup/presentation/components/organisms/CreateBackupButton.vue'
import BackupTable from '@/features/backup/presentation/components/organisms/BackupTable.vue'

const {
  backups,
  serverStatus,
  isLoading,
  isCreating,
  error,
  formatBytes,
  formatDate,
  fetchStatus,
  fetchBackups,
  createBackup,
  deleteBackup,
  downloadBackup,
} = useBackups()

onMounted(() => {
  fetchStatus()
  fetchBackups()
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function hasSaveFilePicker() {
  return typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function'
}

async function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const handleCreateBackup = async (name) => {
  const suggestedName = `${name || 'respaldo'}_${new Date().toISOString().slice(0, 10)}.sql`

  let fileHandle = null
  if (hasSaveFilePicker()) {
    try {
      fileHandle = await window.showSaveFilePicker({
        suggestedName,
        types: [
          { description: 'SQL Backup', accept: { 'application/sql': ['.sql'] } },
        ],
      })
    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('File picker error:', err)
      return
    }
  }

  try {
    const backup = await createBackup(name)

    const maxAttempts = 60
    for (let i = 0; i < maxAttempts; i++) {
      await sleep(1000)
      const updated = await BackupApi.getBackup(backup.id)
      if (updated.status === 'completed') {
        const response = await fetch(BackupApi.getDownloadUrl(backup.id))
        if (!response.ok) throw new Error('Failed to download backup file')
        const blob = await response.blob()

        if (fileHandle) {
          const writable = await fileHandle.createWritable()
          await writable.write(blob)
          await writable.close()
        } else {
          await triggerDownload(blob, suggestedName)
        }

        await fetchBackups()
        await fetchStatus()
        return
      }
      if (updated.status === 'failed') {
        throw new Error(updated.error || 'Backup failed on server')
      }
    }
    throw new Error('Backup timed out after 60 seconds')
  } catch (err) {
    console.error('Backup creation failed:', err)
    error.value = err.message || 'Error al crear el respaldo'
  }
}

const handleDeleteBackup = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este respaldo?')) return
  try {
    await deleteBackup(id)
  } catch (err) {
    console.error('Backup deletion failed:', err)
  }
}
</script>

<template>
  <div class="min-h-screen bg-stone-50 p-6">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- ── Page Header ── -->
      <div v-motion :initial="{ opacity: 0, y: -10 }" :enter="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3 }"
        class="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-white/80 backdrop-blur-sm px-8 py-6 shadow-xl shadow-amber-100/60">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
        <div class="pointer-events-none absolute right-0 top-0 opacity-10">
          <svg width="220" height="140" viewBox="0 0 220 140" fill="none">
            <circle cx="200" cy="-10" r="100" fill="#f59e0b" />
            <circle cx="160" cy="40" r="55" fill="#ea580c" />
          </svg>
        </div>
        <div class="relative flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div>
              <h1 class="font-serif text-2xl font-bold text-stone-800">Gestión de Respaldos</h1>
              <p class="text-xs text-stone-400 mt-0.5">Copia de seguridad de la base de datos</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error banner -->
      <div v-if="error" v-motion :initial="{ opacity: 0, y: -5 }" :enter="{ opacity: 1, y: 0 }"
        class="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
        <svg class="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-rose-700">{{ error }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Server Status -->
        <ServerStatus :status="serverStatus" :format-bytes="formatBytes" />

        <!-- Create Backup -->
        <CreateBackupButton :is-creating="isCreating" @create="handleCreateBackup" />
      </div>

      <!-- Backup History -->
      <BackupTable
        :backups="backups"
        :is-loading="isLoading"
        :format-bytes="formatBytes"
        :format-date="formatDate"
        @download="downloadBackup"
        @delete="handleDeleteBackup"
      />
    </div>
  </div>
</template>
