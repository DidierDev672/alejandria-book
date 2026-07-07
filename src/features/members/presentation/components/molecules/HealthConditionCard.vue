<script setup lang="ts">
import { computed } from 'vue'
import MemberFormField from './MemberFormField.vue'
import { SEVERITY_OPTIONS } from '../../../application/stores/useMemberStore'
import type { HealthCondition } from '../../../domain/entities/Member.types'

interface Props {
  condition: Omit<HealthCondition, 'id' | 'created_at' | 'updated_at'>
  index: number
  errors?: Record<string, string[]>
  disabled?: boolean
}

interface Emits {
  (e: 'update:condition', condition: Omit<HealthCondition, 'id' | 'created_at' | 'updated_at'>): void
  (e: 'remove'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const severityColor = computed(() => {
  switch (props.condition.severity) {
    case 'LEVE': return 'border-emerald-200 bg-emerald-50'
    case 'MODERADO': return 'border-amber-200 bg-amber-50'
    case 'GRAVE': return 'border-red-200 bg-red-50'
    default: return 'border-stone-200 bg-white'
  }
})

const severityIcon = computed(() => {
  switch (props.condition.severity) {
    case 'LEVE': return 'text-emerald-500'
    case 'MODERADO': return 'text-amber-500'
    case 'GRAVE': return 'text-red-500'
    default: return 'text-stone-400'
  }
})

function updateField(field: string, value: any) {
  emit('update:condition', {
    ...props.condition,
    [field]: value
  })
}
</script>

<template>
  <div :class="['relative border-2 rounded-xl p-4 transition-all', severityColor]">
    <!-- Remove Button -->
    <button
      type="button"
      @click="emit('remove')"
      :disabled="disabled"
      class="absolute top-3 right-3 w-7 h-7 rounded-full bg-white border border-stone-200 
             flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-300
             transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Eliminar condición"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Severity Indicator -->
    <div class="flex items-center gap-2 mb-4">
      <div :class="['w-3 h-3 rounded-full', severityIcon.replace('text-', 'bg-')]"></div>
      <span class="text-sm font-medium text-stone-600">
        Condición #{{ index + 1 }}
      </span>
    </div>

    <!-- Form Fields -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MemberFormField
        label="Nombre de la condición"
        :model-value="condition.condition_name"
        @update:model-value="updateField('condition_name', $event)"
        placeholder="Ej: Diabetes, Lesión de rodilla..."
        required
        :disabled="disabled"
        :errors="errors?.condition_name"
      />

      <MemberFormField
        label="Severidad"
        type="select"
        :model-value="condition.severity"
        @update:model-value="updateField('severity', $event)"
        :options="SEVERITY_OPTIONS"
        required
        :disabled="disabled"
        :errors="errors?.severity"
      />

      <div class="md:col-span-2">
        <MemberFormField
          label="Notas adicionales"
          type="textarea"
          :model-value="condition.notes || ''"
          @update:model-value="updateField('notes', $event)"
          placeholder="Describe síntomas, tratamientos, limitaciones..."
          :rows="2"
          :disabled="disabled"
          :errors="errors?.notes"
        />
      </div>

      <div class="md:col-span-2">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            :checked="condition.is_active"
            @change="updateField('is_active', ($event.target as HTMLInputElement).checked)"
            :disabled="disabled"
            class="w-4 h-4 text-amber-600 border-stone-300 rounded focus:ring-amber-500"
          />
          <span class="text-sm font-medium text-stone-700">
            Esta condición está activa actualmente
          </span>
        </label>
      </div>
    </div>
  </div>
</template>