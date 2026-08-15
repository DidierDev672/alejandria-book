<script setup lang="ts">
// ============================================================
// MOLECULE - Base routine block (GET /api/routines/{id})
// ============================================================

import type { RoutineBaseSummary } from '../../../domain/entities/RoutineBase.types'
import OrangeGradientBadge from '../atoms/OrangeGradientBadge.vue'

defineProps<{
  routineId: string
  routine: RoutineBaseSummary | null
  loading?: boolean
}>()
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center gap-2 flex-wrap">
      <h3 class="text-sm font-bold font-serif text-stone-900">Rutina base</h3>
      <OrangeGradientBadge
        v-if="routine?.section"
        :label="routine.section"
        title="Sección"
      />
    </div>

    <div
      v-if="loading && !routine"
      class="h-24 rounded-xl bg-amber-50 animate-pulse border border-amber-100"
    />

    <div v-else-if="routine" class="space-y-3 text-sm">
      <div>
        <p class="text-xs text-stone-400 mb-0.5">Nombre</p>
        <p class="font-semibold text-stone-900">{{ routine.name || '—' }}</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <p class="text-xs text-stone-400 mb-0.5">Repeticiones</p>
          <p class="text-stone-700">{{ routine.repetitions || '—' }}</p>
        </div>
        <div>
          <p class="text-xs text-stone-400 mb-0.5">Duración</p>
          <p class="text-stone-700">
            <template v-if="routine.time_minutes">
              {{ routine.time_minutes }} {{ routine.time_label || 'min' }}
            </template>
            <template v-else>—</template>
          </p>
        </div>
      </div>

      <div v-if="routine.notes">
        <p class="text-xs text-stone-400 mb-0.5">Notas</p>
        <p class="text-stone-600 leading-relaxed">{{ routine.notes }}</p>
      </div>

      <div>
        <p class="text-xs text-stone-400 mb-0.5">routine_id</p>
        <p class="font-mono text-xs text-stone-500">{{ routine.id || routineId }}</p>
      </div>
    </div>

    <div v-else class="text-sm text-stone-500">
      <p class="font-mono text-xs text-stone-400 mb-1">{{ routineId }}</p>
      <p>No se encontró detalle de la rutina base.</p>
    </div>
  </section>
</template>
