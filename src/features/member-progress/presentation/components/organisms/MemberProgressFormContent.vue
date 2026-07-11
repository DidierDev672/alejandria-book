<script setup lang="ts">
import { ref } from 'vue'
import ProgressFormField from '../molecules/ProgressFormField.vue'
import MemberSelectorModal from '../molecules/MemberSelectorModal.vue'
import type { MemberProgressFormState, MemberProgressValidationErrors } from '../../../domain/entities/MemberProgress.types'
import type { Member } from '@/features/members/domain/entities/Member.types'

interface Props {
  formState: MemberProgressFormState
  errors?: MemberProgressValidationErrors
  disabled?: boolean
}

interface Emits {
  (e: 'update:formState', value: MemberProgressFormState): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const memberSelectorOpen = ref(false)

function updateField<K extends keyof MemberProgressFormState>(field: K, value: MemberProgressFormState[K]) {
  emit('update:formState', { ...props.formState, [field]: value })
}

function selectMember(member: Member) {
  emit('update:formState', {
    ...props.formState,
    user_id: member.id,
    user_name: member.name_full,
  })
  memberSelectorOpen.value = false
}
</script>
<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-5">
      <div>
        <ProgressFieldLabel label="Miembro" :required="true" description="Referencia al miembro que realiza el progreso" />
        <div class="flex items-center gap-3 mt-1.5">
          <div v-if="formState.user_id" class="flex-1 flex items-center gap-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/30 to-orange-500/20 border border-amber-200 flex items-center justify-center shrink-0">
              <span class="text-xs font-bold text-amber-700">{{ formState.user_name?.charAt(0).toUpperCase() || '?' }}</span>
            </div>
            <div>
              <p class="font-semibold text-stone-800 text-sm">{{ formState.user_name || 'Miembro seleccionado' }}</p>
              <p class="text-xs text-stone-400">ID: {{ formState.user_id.slice(0, 8) }}...</p>
            </div>
            <button type="button" @click="updateField('user_id', ''); updateField('user_name', '')"
              class="ml-auto p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button type="button" @click="memberSelectorOpen = true"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold shadow-lg shadow-amber-500/25 transition-all active:scale-95"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ formState.user_id ? 'Cambiar miembro' : 'Seleccionar miembro' }}
          </button>
        </div>
        <p v-if="errors?.user_id?.length" class="mt-1.5 text-xs text-red-600 font-medium">{{ errors.user_id[0] }}</p>
      </div>

      <ProgressFormField
        label="Mes y Año"
        :model-value="formState.month_year"
        @update:model-value="updateField('month_year', $event)"
        type="month"
        :required="true"
        description="Mes y año del registro de progreso"
        :disabled="disabled"
        :errors="errors?.month_year"
      />

      <ProgressFormField
        label="Valor Registrado"
        :model-value="formState.recorded_value"
        @update:model-value="updateField('recorded_value', $event)"
        type="number"
        :required="true"
        step="0.01"
        min="0"
        placeholder="Ej: 75.5"
        description="Valor numérico registrado para el objetivo en ese mes (ej: peso en kg, % grasa, repeticiones)"
        :disabled="disabled"
        :errors="errors?.recorded_value"
      />

      <ProgressFormField
        label="Observaciones"
        :model-value="formState.notes"
        @update:model-value="updateField('notes', $event)"
        type="textarea"
        :rows="3"
        placeholder="Observaciones adicionales sobre el progreso o desafíos del mes"
        description="Notas adicionales sobre el progreso o desafíos del mes"
        :disabled="disabled"
        :errors="errors?.notes"
      />
    </div>

    <MemberSelectorModal :is-open="memberSelectorOpen" @select="selectMember" @close="memberSelectorOpen = false" />
  </div>
</template>