<script setup lang="ts">
// ============================================================
// ATOM - Status badge (rounded-full colored pill)
// ============================================================

import { computed } from 'vue'
import { STATUS_OPTIONS } from '../../../domain/entities/MemberRoutine.types'
import type { MemberRoutineStatus } from '../../../domain/entities/MemberRoutine.types'

const props = defineProps<{
  status: MemberRoutineStatus
}>()

const config = computed(
  () => STATUS_OPTIONS.find((s) => s.value === props.status) ?? STATUS_OPTIONS[0],
)

const colorClasses: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-stone-100 text-stone-600',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
      colorClasses[config.color],
    ]"
  >
    {{ config.label }}
  </span>
</template>
