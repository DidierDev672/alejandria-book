<script setup>
const props = defineProps({
  backup: { type: Object, required: true },
  formatBytes: { type: Function, required: true },
  formatDate: { type: Function, required: true },
})

const emit = defineEmits(['download', 'delete'])

const statusConfig = {
  pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Pendiente', icon: 'clock' },
  running: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Ejecutando', icon: 'loader' },
  completed: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Completado', icon: 'check' },
  failed: { color: 'bg-rose-100 text-rose-700 border-rose-200', label: 'Fallido', icon: 'x' },
}

const getConfig = (status) => statusConfig[status] || statusConfig.pending
</script>

<template>
  <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.3 }"
    class="bg-white rounded-xl border border-stone-200 p-4 hover:border-amber-200 hover:shadow-sm transition-all duration-200">
    
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <svg class="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-sm font-semibold text-stone-800 truncate">{{ backup.name }}</p>
        </div>
        
        <div class="flex items-center gap-3 text-xs text-stone-400">
          <span>{{ formatDate(backup.created_at) }}</span>
          <span>·</span>
          <span>{{ formatBytes(backup.size_bytes) }}</span>
        </div>

        <p v-if="backup.error" class="mt-2 text-xs text-rose-500 truncate">{{ backup.error }}</p>
      </div>

      <span :class="['text-[10px] px-2 py-0.5 rounded-full border font-medium', getConfig(backup.status).color]">
        {{ getConfig(backup.status).label }}
      </span>
    </div>

    <div v-if="backup.status === 'completed'" class="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
      <button @click="emit('download', backup.id)"
        class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Descargar
      </button>
      <button @click="emit('delete', backup.id)"
        class="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>
