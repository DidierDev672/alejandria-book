<script setup>
import BackupCard from '@/features/backup/presentation/components/molecules/BackupCard.vue'

const props = defineProps({
  backups: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  formatBytes: { type: Function, required: true },
  formatDate: { type: Function, required: true },
})

const emit = defineEmits(['download', 'delete'])
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-stone-700 uppercase tracking-wider">Historial de Respaldos</h3>
      <span class="text-xs text-stone-400">{{ backups.length }} respaldo{{ backups.length !== 1 ? 's' : '' }}</span>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12 bg-stone-50 rounded-2xl border border-stone-100">
      <div class="w-6 h-6 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
      <span class="ml-3 text-sm text-stone-400">Cargando respaldos...</span>
    </div>

    <div v-else-if="backups.length === 0" class="py-12 bg-stone-50 rounded-2xl border border-stone-100 text-center">
      <svg class="w-12 h-12 text-stone-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-sm text-stone-500">No hay respaldos registrados</p>
      <p class="text-xs text-stone-400 mt-1">Crea tu primer respaldo para comenzar</p>
    </div>

    <div v-else class="space-y-2">
      <BackupCard
        v-for="backup in backups"
        :key="backup.id"
        :backup="backup"
        :format-bytes="formatBytes"
        :format-date="formatDate"
        @download="emit('download', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
