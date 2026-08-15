<script setup lang="ts">
// ============================================================
// MOLECULE - Edit identity fields (member + routine pickers)
// ============================================================

import type {
  MemberRoutineFormState,
  MemberRoutineValidationErrors,
} from '../../../domain/entities/MemberRoutine.types'
import FormField from './FormField.vue'
import FormInput from '../atoms/FormInput.vue'
import SelectedRoutineBadge from '../atoms/SelectedRoutineBadge.vue'

const props = defineProps<{
  formState: MemberRoutineFormState
  errors: MemberRoutineValidationErrors
  selectedMemberName?: string | null
  selectedRoutineName?: string | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:formState', value: MemberRoutineFormState): void
  (e: 'select-member'): void
  (e: 'clear-member'): void
  (e: 'select-routine'): void
  (e: 'clear-routine'): void
}>()

function updateField<K extends keyof MemberRoutineFormState>(
  field: K,
  value: MemberRoutineFormState[K],
) {
  emit('update:formState', { ...props.formState, [field]: value })
}
</script>

<template>
  <fieldset class="space-y-4">
    <legend
      class="w-full pb-2 border-b border-amber-100
             text-xs font-semibold text-stone-500 uppercase tracking-widest"
    >
      Identificación
    </legend>

    <FormField label="ID del miembro" for-id="edit_member_id" required :error="errors.member_id">
      <div class="flex items-stretch gap-2">
        <div class="flex-1">
          <FormInput
            id="edit_member_id"
            :model-value="formState.member_id"
            @update:model-value="updateField('member_id', $event)"
            placeholder="ID del gladiador / miembro"
            :disabled="disabled"
            :error="!!errors.member_id"
            mono
          />
        </div>
        <button
          type="button"
          @click="emit('select-member')"
          :disabled="disabled"
          class="inline-flex items-center gap-2 shrink-0 border border-amber-600 text-amber-700
                 hover:bg-amber-50 text-sm font-medium px-3 rounded-lg
                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Seleccionar
        </button>
      </div>
      <div v-if="selectedMemberName" class="mt-2">
        <SelectedRoutineBadge
          :name="selectedMemberName"
          :disabled="disabled"
          @clear="emit('clear-member')"
        />
      </div>
    </FormField>

    <FormField
      label="ID de rutina base"
      for-id="edit_routine_id"
      required
      :error="errors.routine_id"
    >
      <div class="flex items-stretch gap-2">
        <div class="flex-1">
          <FormInput
            id="edit_routine_id"
            :model-value="formState.routine_id"
            @update:model-value="updateField('routine_id', $event)"
            placeholder="ID de la rutina base"
            :disabled="disabled"
            :error="!!errors.routine_id"
            mono
          />
        </div>
        <button
          type="button"
          @click="emit('select-routine')"
          :disabled="disabled"
          class="inline-flex items-center gap-2 shrink-0 border border-amber-600 text-amber-700
                 hover:bg-amber-50 text-sm font-medium px-3 rounded-lg
                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Seleccionar
        </button>
      </div>
      <div v-if="selectedRoutineName" class="mt-2">
        <SelectedRoutineBadge
          :name="selectedRoutineName"
          :disabled="disabled"
          @clear="emit('clear-routine')"
        />
      </div>
    </FormField>
  </fieldset>
</template>
