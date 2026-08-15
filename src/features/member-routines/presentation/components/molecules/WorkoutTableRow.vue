<script setup lang="ts">
// ============================================================
// MOLECULE - Single workout row in the assigned routines table
// ============================================================

import type { MemberRoutine } from '../../../domain/entities/MemberRoutine.types'
import { MemberRoutineDomainService } from '../../../domain/services/MemberRoutineDomainService'
import StatusBadge from '../atoms/StatusBadge.vue'
import WorkoutRowActions from './WorkoutRowActions.vue'

defineProps<{
  workout: MemberRoutine
  memberName?: string | null
  index?: number
}>()

defineEmits<{
  (e: 'view', workout: MemberRoutine): void
  (e: 'edit', workout: MemberRoutine): void
  (e: 'delete', workout: MemberRoutine): void
}>()
</script>

<template>
  <tr
    v-motion
    :initial="{ opacity: 0, x: -16 }"
    :enter="{
      opacity: 1,
      x: 0,
      transition: { delay: (index ?? 0) * 0.04, duration: 0.35 },
    }"
    class="group hover:bg-amber-50 transition-colors duration-150"
  >
    <td class="px-6 py-4">
      <div class="min-w-0">
        <p class="text-sm font-semibold text-stone-900 truncate">
          {{ memberName || workout.member_id }}
        </p>
        <p
          v-if="memberName"
          class="text-xs font-mono text-stone-400 mt-0.5 truncate"
          :title="workout.member_id"
        >
          {{ workout.member_id }}
        </p>
      </div>
    </td>

    <td class="px-6 py-4">
      <p class="text-sm font-semibold text-stone-900">{{ workout.name }}</p>
      <p
        v-if="workout.description"
        class="text-xs text-stone-400 mt-0.5 max-w-xs truncate"
        :title="workout.description"
      >
        {{ workout.description }}
      </p>
    </td>

    <td class="px-4 py-4 text-center">
      <span class="text-sm text-stone-700">
        {{ MemberRoutineDomainService.formatDisplayDate(workout.start_date) }}
      </span>
    </td>

    <td class="px-4 py-4 text-center">
      <span class="text-sm text-stone-700">
        {{ MemberRoutineDomainService.formatDisplayDate(workout.end_date) }}
      </span>
    </td>

    <td class="px-4 py-4 text-center">
      <StatusBadge :status="workout.status" />
    </td>

    <td class="px-4 py-4 text-center">
      <WorkoutRowActions
        @view="$emit('view', workout)"
        @edit="$emit('edit', workout)"
        @delete="$emit('delete', workout)"
      />
    </td>
  </tr>
</template>
