<script setup lang="ts">
// ============================================================
// ATOM - Exercise difficulty badge
// ============================================================

import { computed } from 'vue'
import { DIFFICULTY_OPTIONS } from '../../../domain/entities/Exercise.types'
import type { ExerciseDifficulty } from '../../../domain/entities/Exercise.types'

const props = defineProps<{
  difficulty: ExerciseDifficulty
}>()

const config = computed(
  () => DIFFICULTY_OPTIONS.find((d) => d.value === props.difficulty) ?? DIFFICULTY_OPTIONS[0],
)

const colorClasses: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0',
      colorClasses[config.color],
    ]"
  >
    {{ config.label }}
  </span>
</template>
