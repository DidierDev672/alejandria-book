<script setup lang="ts">
// ============================================================
// ORGANISM - Member Routine Form (presentational, stateless)
// ============================================================

import { computed } from 'vue'
import {
  STATUS_OPTIONS,
  type MemberRoutineFormState,
  type MemberRoutineValidationErrors,
} from '../../../domain/entities/MemberRoutine.types'
import { MemberRoutineDomainService } from '../../../domain/services/MemberRoutineDomainService'
import FormField from '../molecules/FormField.vue'
import FormInput from '../atoms/FormInput.vue'
import FormTextarea from '../atoms/FormTextarea.vue'
import FormSelect from '../atoms/FormSelect.vue'
import StatusBadge from '../atoms/StatusBadge.vue'
import SelectedRoutineBadge from '../atoms/SelectedRoutineBadge.vue'

const props = defineProps<{
  formState: MemberRoutineFormState
  errors: MemberRoutineValidationErrors
  disabled?: boolean
  selectedRoutineName?: string | null
  selectedMemberName?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:formState', value: MemberRoutineFormState): void
  (e: 'submit'): void
  (e: 'cancel'): void
  (e: 'select-routine'): void
  (e: 'clear-routine'): void
  (e: 'select-member'): void
  (e: 'clear-member'): void
}>()

function updateField<K extends keyof MemberRoutineFormState>(
  field: K,
  value: MemberRoutineFormState[K],
) {
  emit('update:formState', { ...props.formState, [field]: value })
}

const nameCount = computed(() => props.formState.name.length)
const descriptionCount = computed(() => props.formState.description.length)

const statusOptions = STATUS_OPTIONS.map(({ value, label }) => ({ value, label }))
</script>

<template>
  <form
    @submit.prevent="emit('submit')"
    novalidate
    class="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-sm overflow-hidden"
  >
    <div class="px-6 py-6 space-y-8">
      <!-- ══════════ Sección: Identificación ══════════ -->
      <fieldset class="space-y-4">
        <legend class="w-full pb-2 border-b border-amber-100
                       text-xs font-semibold text-stone-500 uppercase tracking-widest">
          Identificación
        </legend>

        <!-- member_id -->
        <FormField
          label="ID del miembro"
          for-id="member_id"
          required
          :error="errors.member_id"
        >
          <div class="flex items-stretch gap-2">
            <div class="flex-1">
              <FormInput
                id="member_id"
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
                     hover:bg-amber-50 text-sm font-medium px-4 rounded-lg
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Seleccionar un miembro registrado"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
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

        <!-- routine_id -->
        <FormField
          label="ID de rutina base"
          for-id="routine_id"
          required
          :error="errors.routine_id"
        >
          <div class="flex items-stretch gap-2">
            <div class="flex-1">
              <FormInput
                id="routine_id"
                :model-value="formState.routine_id"
                @update:model-value="updateField('routine_id', $event)"
                placeholder="ID de la rutina genérica de referencia"
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
                     hover:bg-amber-50 text-sm font-medium px-4 rounded-lg
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Seleccionar una rutina registrada"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 10h16M4 14h10m2 4l3 3 5-5" />
              </svg>
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

      <!-- ══════════ Sección: Detalles ══════════ -->
      <fieldset class="space-y-4">
        <legend class="w-full pb-2 border-b border-amber-100
                       text-xs font-semibold text-stone-500 uppercase tracking-widest">
          Detalles de la rutina
        </legend>

        <FormField
          label="Nombre de la rutina"
          for-id="name"
          required
          :error="errors.name"
          :hint="`${nameCount} / ${MemberRoutineDomainService.NAME_MAX}`"
        >
          <FormInput
            id="name"
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
          for-id="description"
          optional
          :error="errors.description"
          :hint="`${descriptionCount} / ${MemberRoutineDomainService.DESCRIPTION_MAX}`"
        >
          <FormTextarea
            id="description"
            :model-value="formState.description"
            @update:model-value="updateField('description', $event)"
            placeholder="Objetivos, enfoque o notas sobre esta rutina..."
            :maxlength="MemberRoutineDomainService.DESCRIPTION_MAX"
            :disabled="disabled"
            :error="!!errors.description"
          />
        </FormField>
      </fieldset>

      <!-- ══════════ Sección: Período ══════════ -->
      <fieldset class="space-y-4">
        <legend class="w-full pb-2 border-b border-amber-100
                       text-xs font-semibold text-stone-500 uppercase tracking-widest">
          Período
        </legend>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Fecha de inicio"
            for-id="start_date"
            required
            :error="errors.start_date"
          >
            <FormInput
              id="start_date"
              type="date"
              :model-value="formState.start_date"
              @update:model-value="updateField('start_date', $event)"
              :disabled="disabled"
              :error="!!errors.start_date"
            />
          </FormField>

          <FormField
            label="Fecha de finalización"
            for-id="end_date"
            required
            :error="errors.end_date"
          >
            <FormInput
              id="end_date"
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

      <!-- ══════════ Sección: Configuración ══════════ -->
      <fieldset class="space-y-4">
        <legend class="w-full pb-2 border-b border-amber-100
                       text-xs font-semibold text-stone-500 uppercase tracking-widest">
          Configuración
        </legend>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Estado" for-id="status" :error="errors.status">
            <FormSelect
              id="status"
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

          <FormField
            label="Tipo de asignación"
            hint="Asignado automáticamente por el sistema"
          >
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

    <!-- ══════════ Footer: acciones ══════════ -->
    <div class="px-6 py-4 bg-amber-50/60 border-t border-amber-100
                flex items-center justify-between gap-3">
      <button
        type="button"
        @click="emit('cancel')"
        :disabled="disabled"
        class="inline-flex items-center gap-2 border border-amber-600 text-amber-700
               hover:bg-amber-50 text-sm font-medium px-4 py-2 rounded-lg
               transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancelar
      </button>

      <button
        type="submit"
        :disabled="disabled"
        class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700
               text-white text-sm font-medium px-5 py-2 rounded-lg
               transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="disabled" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 4v16m8-8H4" />
        </svg>
        {{ disabled ? 'Guardando...' : 'Asignar rutina' }}
      </button>
    </div>
  </form>
</template>
