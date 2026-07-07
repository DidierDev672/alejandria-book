<script setup lang="ts">
import { computed } from 'vue'
import MemberFormField from './MemberFormField.vue'
import { GOAL_TYPE_OPTIONS } from '../../../application/stores/useMemberStore'
import type { MemberGoal } from '../../../domain/entities/Member.types'

interface Props {
  goal: Omit<MemberGoal, 'id' | 'created_at' | 'updated_at'>
  index: number
  errors?: Record<string, string[]>
  disabled?: boolean
}

interface Emits {
  (e: 'update:goal', goal: Omit<MemberGoal, 'id' | 'created_at' | 'updated_at'>): void
  (e: 'remove'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const goalColor = computed(() => {
  if (props.goal.is_achieved) {
    return 'border-emerald-200 bg-emerald-50'
  }
  return 'border-amber-200 bg-amber-50'
})

const goalIcon = computed(() => {
  switch (props.goal.goal_type) {
    case 'PERDIDA_PESO': return '🔥'
    case 'GANANCIA_MUSCULAR': return '💪'
    case 'RESISTENCIA': return '🏃'
    case 'MANTENIMIENTO': return '⚖️'
    case 'REHABILITACION': return '🏥'
    default: return '🎯'
  }
})

function updateField(field: string, value: any) {
  emit('update:goal', {
    ...props.goal,
    [field]: value
  })
}
</script>

<template>
  <div :class="['relative border-2 rounded-xl p-4 transition-all', goalColor]">
    <!-- Remove Button -->
    <button
      type="button"
      @click="emit('remove')"
      :disabled="disabled"
      class="absolute top-3 right-3 w-7 h-7 rounded-full bg-white border border-stone-200 
             flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-300
             transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Eliminar objetivo"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Goal Header -->
    <div class="flex items-center gap-3 mb-4">
      <span class="text-2xl">{{ goalIcon }}</span>
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-stone-600">
            Objetivo #{{ index + 1 }}
          </span>
          <span 
            v-if="goal.is_achieved"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"
          >
            ✓ Alcanzado
          </span>
        </div>
      </div>
    </div>

    <!-- Form Fields -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MemberFormField
        label="Tipo de objetivo"
        type="select"
        :model-value="goal.goal_type"
        @update:model-value="updateField('goal_type', $event)"
        :options="GOAL_TYPE_OPTIONS"
        required
        :disabled="disabled"
        :errors="errors?.goal_type"
      />

      <MemberFormField
        label="Valor objetivo"
        :model-value="goal.target_value"
        @update:model-value="updateField('target_value', $event)"
        placeholder="Ej: 75kg, 15%, 10 km..."
        description="Describe tu meta específica con valor y unidad"
        required
        :disabled="disabled"
        :errors="errors?.target_value"
      />

      <div class="md:col-span-2">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            :checked="goal.is_achieved"
            @change="updateField('is_achieved', ($event.target as HTMLInputElement).checked)"
            :disabled="disabled"
            class="w-4 h-4 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500"
          />
          <span class="text-sm font-medium text-stone-700">
            He alcanzado este objetivo
          </span>
        </label>
      </div>
    </div>
  </div>
</template>