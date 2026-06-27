<script setup lang="ts">
import { useEquipmentListStore } from '@/features/maintenance/application/stores/useEquipmentListStore'
import { onMounted } from 'vue'

// ============================================================
// STORE
// ============================================================

// Importar el store de Pinia para manejar el estado de la lista
const store = useEquipmentListStore()

// ============================================================
// LIFECYCLE
// ============================================================

// Disparar la acción para cargar los datos cuando el componente se monta
onMounted(() => {
  store.fetchEquipments()
})

// ============================================================
// HELPERS
// ============================================================

/**
 * Obtener configuración visual según el estado del equipo
 */
const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; colorClass: string }> = {
    active: { label: 'Activo', colorClass: 'text-emerald-600 bg-emerald-50' },
    inactive: { label: 'Inactivo', colorClass: 'text-slate-600 bg-slate-50' },
    pending: { label: 'Pendiente', colorClass: 'text-amber-600 bg-amber-50' },
  }
  return configs[status] || configs.inactive
}

/**
 * Formatear fecha para mostrar
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <section class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-8">
      <h1 class="text-3xl font-bold text-slate-800">
        Lista de
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
          Equipos
        </span>
      </h1>
      <p class="text-slate-500 mt-2">
        Gestiona y visualiza todos tus equipos de mantenimiento
      </p>
    </div>

    <!-- Estado de carga -->
    <div v-if="store.isLoading" class="max-w-7xl mx-auto">
      <div class="flex items-center justify-center py-16">
        <div class="flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-md border border-slate-100">
          <!-- Spinner animado -->
          <svg class="animate-spin h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span class="text-slate-600 font-medium">Cargando equipos...</span>
        </div>
      </div>
    </div>

    <!-- Estado de error -->
    <div v-else-if="store.error" class="max-w-7xl mx-auto">
      <div class="flex flex-col items-center justify-center py-16">
        <!-- Icono de error -->
        <div class="w-16 h-16 mb-4 bg-rose-50 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <!-- Mensaje de error -->
        <h3 class="text-lg font-semibold text-slate-700 mb-2">Error al cargar</h3>
        <p class="text-rose-600 mb-4">{{ store.error }}</p>
        <!-- Botón para reintentar -->
        <button
          @click="store.fetchEquipments()"
          class="px-5 py-2.5 bg-violet-500 text-white rounded-xl font-medium shadow-lg hover:bg-violet-600 transition-all duration-200"
        >
          Reintentar
        </button>
      </div>
    </div>

    <!-- Lista de equipos -->
    <div v-else-if="store.hasItems" class="max-w-7xl mx-auto">
      <!-- Grid de tarjetas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Iterar sobre items con v-for -->
        <article
          v-for="equipment in store.items"
          :key="equipment.id"
          class="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
        >
          <!-- Header de la tarjeta -->
          <div class="p-6 border-b border-slate-100">
            <div class="flex items-start justify-between gap-3">
              <!-- Icono según tipo -->
              <div
                class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/20">
                🔧
              </div>
              <!-- Nombre e ID -->
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">{{ equipment.id }}</p>
                <h3 class="font-semibold text-slate-800 line-clamp-1" :title="equipment.name">
                  {{ equipment.name }}
                </h3>
              </div>
            </div>

            <!-- Badge de estado -->
            <div class="mt-4">
              <span
                :class="['inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border', getStatusConfig(equipment.status).colorClass]"
              >
                <span class="w-2 h-2 rounded-full animate-pulse"
                  :class="equipment.status === 'active' ? 'bg-emerald-500' : equipment.status === 'pending' ? 'bg-amber-500' : 'bg-slate-400'"
                />
                {{ getStatusConfig(equipment.status).label }}
              </span>
            </div>
          </div>

          <!-- Contenido de la tarjeta -->
          <div class="p-6 space-y-3">
            <!-- Tipo -->
            <div class="flex items-center gap-3 text-sm">
              <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <span class="text-lg">🏷️</span>
              </div>
              <div>
                <p class="text-xs text-slate-400">Tipo</p>
                <p class="font-medium text-slate-700 capitalize">{{ equipment.type }}</p>
              </div>
            </div>

            <!-- Último mantenimiento -->
            <div class="flex items-center gap-3 text-sm">
              <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-slate-400">Último Mantenimiento</p>
                <p class="font-medium text-slate-700">{{ formatDate(equipment.lastMaintenance) }}</p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Total de elementos -->
      <div class="mt-8 text-center">
        <p class="text-sm text-slate-500">
          Mostrando <span class="font-semibold text-slate-700">{{ store.totalItems }}</span> equipos
          (<span class="font-semibold text-emerald-600">{{ store.activeItems.length }}</span> activos)
        </p>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="max-w-7xl mx-auto">
      <div class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-slate-700 mb-2">No hay equipos</h3>
        <p class="text-slate-500 mb-6">La lista está vacía. Agrega equipos para comenzar.</p>
        <!-- Botón para recargar -->
        <button
          @click="store.fetchEquipments()"
          class="inline-flex items-center gap-2 px-5 py-3 bg-violet-500 text-white rounded-xl font-semibold shadow-lg hover:bg-violet-600 transition-all duration-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Recargar
        </button>
      </div>
    </div>
  </section>
</template>
