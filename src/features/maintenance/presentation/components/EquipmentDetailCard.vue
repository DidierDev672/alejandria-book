<script setup lang="ts">
import type { Equipment } from '@/features/maintenance/application/stores/useEquipmentStore';
import InfoRow from './atomic/InfoRow.vue';
import StatusBadge from './atomic/StatusBadge.vue';

interface Props {
  equipment: Equipment
}

const props = defineProps<Props>()

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    cardio: '🏃',
    strength: '💪',
    flexibility: '🧘',
    balance: '⚖️',
    Neumático: '💨',
    Eléctrico: '⚡',
    Hidráulico: '💧',
    Mecánico: '⚙️',
    Electrónico: '🔌',
  }
  return icons[type] || '🔧'
}

const getDaysSinceMaintenance = (date: string): number => {
  const maintenance = new Date(date)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - maintenance.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const maintenanceDays = getDaysSinceMaintenance(props.equipment.lastMaintenance)
</script>

<template>
  <div class="max-w-6xl space-y-6">

    <!-- Header con ícono y nombre -->
    <div class="flex items-center gap-4">
      <div
        class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/25 ring-4 ring-amber-100">
        {{ getTypeIcon(equipment.type) }}
      </div>

      <div class="flex-1 min-w-0">
        <h3 class="font-serif text-xl font-bold text-stone-800 truncate">
          {{ equipment.name }}
        </h3>
        <p class="text-xs text-stone-400 font-mono tracking-wider mt-0.5">
          {{ equipment.id }}
        </p>
      </div>

      <StatusBadge :status="equipment.status" size="lg" />
    </div>

    <!-- Divider -->
    <div class="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

    <!-- Información del equipo -->
    <div class="space-y-3">
      <InfoRow label="Tipo" :icon="getTypeIcon(equipment.type)" icon-type="text">
        {{ equipment.type }}
      </InfoRow>

      <InfoRow label="Último Mantenimiento"
        icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
        <div class="flex items-center gap-2 flex-wrap">
          <span>{{ formatDate(equipment.lastMaintenance) }}</span>
          <span class="text-xs px-2 py-0.5 rounded-lg font-semibold border" :class="maintenanceDays > 60
            ? 'bg-rose-50 text-rose-600 border-rose-200'
            : maintenanceDays > 30
              ? 'bg-amber-50 text-amber-600 border-amber-200'
              : 'bg-emerald-50 text-emerald-600 border-emerald-200'">
            hace {{ maintenanceDays }} días
          </span>
        </div>
      </InfoRow>

      <InfoRow v-if="equipment.createdAt" label="Fecha de Creación" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
        {{ formatDateTime(equipment.createdAt) }}
      </InfoRow>

      <InfoRow v-if="equipment.updatedAt" label="Última Actualización"
        icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9M4 9h5m15.356 2A8.001 8.001 0 0119.418 9M19.418 9h5">
        {{ formatDateTime(equipment.updatedAt) }}
      </InfoRow>
    </div>

    <!-- Divider -->
    <div class="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

    <!-- Indicador de salud del mantenimiento -->
    <div class="relative overflow-hidden rounded-2xl border p-4" :class="maintenanceDays > 60
      ? 'bg-rose-50 border-rose-200/80'
      : maintenanceDays > 30
        ? 'bg-amber-50 border-amber-200/80'
        : 'bg-emerald-50 border-emerald-200/80'">
      <!-- Decorador SVG de fondo -->
      <div class="pointer-events-none absolute right-0 top-0 opacity-10">
        <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
          <circle cx="105" cy="-5" r="60"
            :fill="maintenanceDays > 60 ? '#f43f5e' : maintenanceDays > 30 ? '#f59e0b' : '#10b981'" />
        </svg>
      </div>

      <!-- Línea de acento superior -->
      <div class="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl" :class="maintenanceDays > 60
        ? 'bg-gradient-to-r from-transparent via-rose-400 to-transparent'
        : maintenanceDays > 30
          ? 'bg-gradient-to-r from-transparent via-amber-400 to-transparent'
          : 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent'" />

      <div class="relative flex items-center gap-3">
        <!-- Ícono -->
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" :class="maintenanceDays > 60
          ? 'bg-rose-100 border border-rose-200'
          : maintenanceDays > 30
            ? 'bg-amber-100 border border-amber-200'
            : 'bg-emerald-100 border border-emerald-200'">
          <svg class="w-5 h-5" :class="maintenanceDays > 60
            ? 'text-rose-500'
            : maintenanceDays > 30
              ? 'text-amber-500'
              : 'text-emerald-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <!-- Textos -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold" :class="maintenanceDays > 60
            ? 'text-rose-700'
            : maintenanceDays > 30
              ? 'text-amber-700'
              : 'text-emerald-700'">
            {{ maintenanceDays > 60
              ? 'Mantenimiento vencido'
              : maintenanceDays > 30
                ? 'Mantenimiento próximo'
                : 'Equipo en buen estado' }}
          </p>
          <p class="text-xs mt-0.5" :class="maintenanceDays > 60
            ? 'text-rose-500'
            : maintenanceDays > 30
              ? 'text-amber-500'
              : 'text-emerald-500'">
            {{ maintenanceDays > 60
              ? 'Se requiere atención urgente'
              : maintenanceDays > 30
                ? 'Programar mantenimiento pronto'
                : 'El equipo está operativo' }}
          </p>
        </div>

        <!-- Badge de días -->
        <span class="text-xs font-bold px-2.5 py-1 rounded-xl border flex-shrink-0" :class="maintenanceDays > 60
          ? 'bg-rose-100 text-rose-600 border-rose-200'
          : maintenanceDays > 30
            ? 'bg-amber-100 text-amber-600 border-amber-200'
            : 'bg-emerald-100 text-emerald-600 border-emerald-200'">
          {{ maintenanceDays }}d
        </span>
      </div>
    </div>

  </div>
</template>
