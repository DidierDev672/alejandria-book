<script setup lang="ts">
// ============================================================
// MOLECULE - Workout meta (name, description, dates, status)
// ============================================================

import type { MemberRoutine } from '../../../domain/entities/MemberRoutine.types'
import { MemberRoutineDomainService } from '../../../domain/services/MemberRoutineDomainService'
import StatusBadge from '../atoms/StatusBadge.vue'
import OrangeGradientBadge from '../atoms/OrangeGradientBadge.vue'

defineProps<{
  workout: MemberRoutine
}>()
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center gap-2 flex-wrap">
      <h3 class="text-sm font-bold font-serif text-stone-900">Asignación</h3>
      <StatusBadge :status="workout.status" />
      <OrangeGradientBadge
        v-if="workout.assignment_type"
        :label="workout.assignment_type"
      />
    </div>

    <div class="space-y-3 text-sm">
      <div>
        <p class="text-xs text-stone-400 mb-0.5">Nombre de la rutina</p>
        <p class="font-semibold text-stone-900 text-base">{{ workout.name }}</p>
      </div>

      <div v-if="workout.description">
        <p class="text-xs text-stone-400 mb-0.5">Descripción</p>
        <p class="text-stone-600 leading-relaxed">{{ workout.description }}</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <p class="text-xs text-stone-400 mb-0.5">start_date</p>
          <p class="text-stone-700">
            {{ MemberRoutineDomainService.formatDisplayDate(workout.start_date) }}
          </p>
        </div>
        <div>
          <p class="text-xs text-stone-400 mb-0.5">end_date</p>
          <p class="text-stone-700">
            {{ MemberRoutineDomainService.formatDisplayDate(workout.end_date) }}
          </p>
        </div>
      </div>

      <div>
        <p class="text-xs text-stone-400 mb-0.5">status</p>
        <StatusBadge :status="workout.status" />
      </div>
    </div>
  </section>
</template>
