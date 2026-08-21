<script setup lang="ts">
import { computed } from 'vue'
import { ExerciseAssignmentDomainService } from '../../../domain/services/ExerciseAssignmentDomainService'
import AssignmentCheckbox from '../atoms/AssignmentCheckbox.vue'

const props = defineProps<{
  name: string
  type: string
  isSelected: boolean
}>()

defineEmits<{
  toggle: []
}>()

const typeLabel = computed(() =>
  ExerciseAssignmentDomainService.toSpanishEquipmentType(props.type),
)
</script>

<template>
  <article
    class="flex cursor-pointer items-center gap-4 rounded-xl border p-4 shadow-sm transition-all duration-200"
    :class="isSelected
      ? 'border-amber-500 bg-amber-100 ring-1 ring-amber-500/30'
      : 'border-amber-200 bg-amber-50 hover:border-amber-300 hover:shadow-md'"
    @click="$emit('toggle')"
  >
    <div class="min-w-0 flex-1">
      <h3 class="font-semibold text-stone-800">{{ name }}</h3>
      <span
        class="mt-2 inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm shadow-orange-500/25"
      >
        {{ typeLabel }}
      </span>
    </div>
    <AssignmentCheckbox :is-selected="isSelected" @toggle="$emit('toggle')" />
  </article>
</template>
