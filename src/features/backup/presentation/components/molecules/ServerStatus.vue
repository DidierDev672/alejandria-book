<script setup>
import StatusIndicator from '@/features/backup/presentation/components/atoms/StatusIndicator.vue'
import StorageBar from '@/features/backup/presentation/components/atoms/StorageBar.vue'

const props = defineProps({
  status: { type: Object, default: null },
  formatBytes: { type: Function, required: true },
})
</script>

<template>
  <div v-if="status" v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.3 }"
    class="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
    
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-stone-700 uppercase tracking-wider">Estado del Servidor</h3>
      <div class="flex items-center gap-2">
        <StatusIndicator :is-connected="status.is_connected" />
        <span :class="['text-xs font-medium', status.is_connected ? 'text-emerald-600' : 'text-rose-600']">
          {{ status.is_connected ? 'Conectado' : 'Desconectado' }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1">
        <p class="text-xs text-stone-400">Base de datos</p>
        <p class="text-sm font-semibold text-stone-700">{{ status.database_name }}</p>
      </div>
      <div class="space-y-1">
        <p class="text-xs text-stone-400">Servidor</p>
        <p class="text-sm font-semibold text-stone-700">{{ status.database_host }}:{{ status.database_port }}</p>
      </div>
      <div class="space-y-1">
        <p class="text-xs text-stone-400">Total respaldos</p>
        <p class="text-sm font-semibold text-stone-700">{{ status.backup_count }}</p>
      </div>
      <div class="space-y-1">
        <p class="text-xs text-stone-400">Almacenamiento BD</p>
        <p class="text-sm font-semibold text-stone-700">{{ formatBytes(status.used_storage_bytes) }}</p>
      </div>
    </div>

    <StorageBar
      :used="status.used_storage_bytes"
      :total="status.total_storage_bytes || status.used_storage_bytes * 2"
      label="Uso de almacenamiento"
    />
  </div>
</template>
