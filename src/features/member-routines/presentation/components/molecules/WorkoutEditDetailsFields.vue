<script setup lang="ts">
// ============================================================
// MOLECULE - Edit details (name + description)
// ============================================================

import { computed } from 'vue'
import type {
  MemberRoutineFormState,
  MemberRoutineValidationErrors,
} from '../../../domain/entities/MemberRoutine.types'
import { MemberRoutineDomainService } from '../../../domain/services/MemberRoutineDomainService'
import FormField from './FormField.vue'
import FormInput from '../atoms/FormInput.vue'
import FormTextarea from '../atoms/FormTextarea.vue'

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

const nameCount = computed(() => props.formState.name.length)
const descriptionCount = computed(() => props.formState.description.length)
</script>

<template>
  <fieldset class="space-y-4">
    <legend
      class="w-full pb-2 border-b border-amber-100
             text-xs font-semibold text-stone-500 uppercase tracking-widest"
    >
      Detalles de la rutina
    </legend>

    <FormField
      label="Nombre de la rutina"
      for-id="edit_name"
      required
      :error="errors.name"
      :hint="`${nameCount} / ${MemberRoutineDomainService.NAME_MAX}`"
    >
      <FormInput
        id="edit_name"
        :model-value="formState.name"
        @update:model-value="updateField('name', $event)"
        placeholder="Ej: Rutina de Fuerza — Mes 1"
        :maxlength="MemberRoutineDomainService.NAME_MAX"
        :disabled="disabled"
        :error="!!errors.name"
      />
    </FormField>

    <FormField
      label="Descripción"
      for-id="edit_description"
      optional
      :error="errors.description"
      :hint="`${descriptionCount} / ${MemberRoutineDomainService.DESCRIPTION_MAX}`"
    >
      <FormTextarea
        id="edit_description"
        :model-value="formState.description"
        @update:model-value="updateField('description', $event)"
        placeholder="Objetivos, enfoque o notas sobre esta rutina..."
        :maxlength="MemberRoutineDomainService.DESCRIPTION_MAX"
        :disabled="disabled"
        :error="!!errors.description"
      />
    </FormField>
  </fieldset>
</template>
