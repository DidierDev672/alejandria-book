<script setup lang="ts">
// ============================================================
// MOLECULE - Routine list item: checkbox + routine info
// ============================================================

import type { RoutineOption } from '../../../domain/entities/MemberRoutine.types'
import SelectCheckbox from '../atoms/SelectCheckbox.vue'

defineProps<{
  routine: RoutineOption
  selected: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <li
    @click="$emit('toggle')"
    :class="[
      'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150',
      selected ? 'bg-amber-50' : 'hover:bg-amber-50/60',
    ]"
  >
    <SelectCheckbox :checked="selected" @toggle="$emit('toggle')" />

    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-stone-800 truncate">{{ routine.name }}</p>
      <p class="text-xs text-stone-400 font-mono truncate">{{ routine.id }}</p>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <span
        v-if="routine.section != null"
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600"
        title="Sección"
      >
        Sec. {{ routine.section }}
      </span>
      <span
        v-if="routine.repetitions != null"
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700"
        title="Repeticiones"
      >
        {{ routine.repetitions }} reps
      </span>
    </div>
  </li>
</template>
