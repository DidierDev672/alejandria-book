<script setup lang="ts">
// ============================================================
// MOLECULE - Exercise list item: checkbox + info + play button
// ============================================================

import type { Exercise } from '../../../domain/entities/Exercise.types'
import SelectCheckbox from '../atoms/SelectCheckbox.vue'
import DifficultyBadge from '../atoms/DifficultyBadge.vue'
import PlayVideoButton from '../atoms/PlayVideoButton.vue'

defineProps<{
  exercise: Exercise
  selected: boolean
  previewing?: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
  (e: 'preview'): void
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
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <p class="text-sm font-semibold text-stone-800 truncate">{{ exercise.name }}</p>
        <DifficultyBadge :difficulty="exercise.difficulty" />
      </div>
      <div class="flex items-center gap-1.5 mt-1 text-xs text-stone-400">
        <span class="truncate">{{ exercise.muscleGroup }}</span>
        <span class="text-stone-300">•</span>
        <span class="font-mono truncate">{{ exercise.equipmentId }}</span>
      </div>
    </div>

    <PlayVideoButton
      :disabled="!exercise.videoUrl"
      :active="previewing"
      @play="$emit('preview')"
    />

    <SelectCheckbox :checked="selected" @toggle="$emit('toggle')" />
  </li>
</template>
