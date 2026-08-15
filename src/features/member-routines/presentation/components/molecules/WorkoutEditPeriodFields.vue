<script setup lang="ts">
// ============================================================
// MOLECULE - Edit period + status configuration
// ============================================================

import type {
  MemberRoutineFormState,
  MemberRoutineValidationErrors,
} from '../../../domain/entities/MemberRoutine.types'
import { STATUS_OPTIONS } from '../../../domain/entities/MemberRoutine.types'
import FormField from './FormField.vue'
import FormInput from '../atoms/FormInput.vue'
import FormSelect from '../atoms/FormSelect.vue'
import StatusBadge from '../atoms/StatusBadge.vue'

const props = defineProps<{
  formState: MemberRoutineFormState
  errors: MemberRoutineValidationErrors
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:formState', value: MemberRoutineFormState): void
}>()

function updateField<K extends keyof MemberRoutineFormState>(
  field: K,
  value: MemberRoutineFormState[K],
) {
  emit('update:formState', { ...props.formState, [field]: value })
}

const statusOptions = STATUS_OPTIONS.map(({ value, label }) => ({ value, label }))
</script>

<template>
  <div class="space-y-6">
    <fieldset class="space-y-4">
      <legend
        class="w-full pb-2 border-b border-amber-100
               text-xs font-semibold text-stone-500 uppercase tracking-widest"
      >
        Período
      </legend>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Fecha de inicio"
          for-id="edit_start_date"
          required
          :error="errors.start_date"
        >
          <FormInput
            id="edit_start_date"
            type="date"
            :model-value="formState.start_date"
            @update:model-value="updateField('start_date', $event)"
            :disabled="disabled"
            :error="!!errors.start_date"
          />
        </FormField>

        <FormField
          label="Fecha de finalización"
          for-id="edit_end_date"
          required
          :error="errors.end_date"
        >
          <FormInput
            id="edit_end_date"
            type="date"
            :model-value="formState.end_date"
            @update:model-value="updateField('end_date', $event)"
            :min="formState.start_date"
            :disabled="disabled"
            :error="!!errors.end_date"
          />
        </FormField>
      </div>
    </fieldset>

    <fieldset class="space-y-4">
      <legend
        class="w-full pb-2 border-b border-amber-100
               text-xs font-semibold text-stone-500 uppercase tracking-widest"
      >
        Configuración
      </legend>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Estado" for-id="edit_status" :error="errors.status">
          <FormSelect
            id="edit_status"
            :model-value="formState.status"
            @update:model-value="updateField('status', $event as MemberRoutineFormState['status'])"
            :options="statusOptions"
            :disabled="disabled"
            :error="!!errors.status"
          />
          <div class="mt-1">
            <StatusBadge :status="formState.status" />
          </div>
        </FormField>

        <FormField label="Tipo de asignación" hint="Asignado automáticamente por el sistema">
          <div
            class="w-full border border-amber-200 rounded-lg px-3 py-2.5 text-sm
                   bg-stone-50 text-stone-400 cursor-not-allowed select-none capitalize"
          >
            {{ formState.assignment_type }}
          </div>
        </FormField>
      </div>
    </fieldset>
  </div>
</template>
