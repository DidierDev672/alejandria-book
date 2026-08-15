<script setup lang="ts">
// ============================================================
// MOLECULE - Single exercise card in workout detail (with video)
// ============================================================

import type { Exercise } from '../../../domain/entities/Exercise.types'
import DifficultyBadge from '../atoms/DifficultyBadge.vue'
import OrangeGradientBadge from '../atoms/OrangeGradientBadge.vue'
import CustomVideoPlayer from '@/utils/components/CustomVideoPlayer.vue'

defineProps<{
  exercise: Exercise
}>()
</script>

<template>
  <article
    class="rounded-xl border border-amber-200/80 bg-[#FFFBF5] p-4 space-y-3"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h4 class="text-sm font-semibold text-stone-900 truncate">{{ exercise.name }}</h4>
        <p class="text-xs font-mono text-stone-400 mt-0.5 truncate">
          {{ exercise.equipmentId || 'sin equipo' }}
        </p>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <OrangeGradientBadge
          v-if="exercise.muscleGroup"
          :label="exercise.muscleGroup"
        />
        <DifficultyBadge :difficulty="exercise.difficulty" />
      </div>
    </div>

    <div v-if="exercise.videoUrl" class="rounded-lg overflow-hidden border border-amber-100">
      <CustomVideoPlayer :video-src="exercise.videoUrl" />
    </div>
    <p v-else class="text-xs text-stone-400 italic">Sin video disponible</p>
  </article>
</template>
