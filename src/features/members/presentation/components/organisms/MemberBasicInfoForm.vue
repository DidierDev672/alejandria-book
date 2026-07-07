<script setup lang="ts">
import { computed } from 'vue'
import MemberFormField from '../molecules/MemberFormField.vue'
import BMIIndicator from '../atoms/BMIIndicator.vue'
import { 
  DOCUMENT_TYPE_OPTIONS, 
  GENDER_OPTIONS 
} from '../../../application/stores/useMemberStore'
import { MemberDomainService } from '../../../domain/services/MemberDomainService'
import type { MemberFormState } from '../../../domain/entities/Member.types'

interface Props {
  formState: MemberFormState
  errors?: Record<string, string[]>
  disabled?: boolean
}

interface Emits {
  (e: 'update:form-state', formState: MemberFormState): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const calculatedBMI = computed(() => {
  const weight = Number(props.formState.bodyMetrics.weight_kg)
  const height = Number(props.formState.bodyMetrics.height_cm)
  
  if (weight > 0 && height > 0) {
    try {
      return MemberDomainService.calculateBMI(weight, height)
    } catch {
      return undefined
    }
  }
  return undefined
})

const calculatedAge = computed(() => {
  if (props.formState.basicInfo.date_of_birth) {
    return MemberDomainService.calculateAge(props.formState.basicInfo.date_of_birth)
  }
  return null
})

function updateBasicInfo(field: string, value: any) {
  emit('update:form-state', {
    ...props.formState,
    basicInfo: {
      ...props.formState.basicInfo,
      [field]: value
    }
  })
}

function updateBodyMetrics(field: string, value: any) {
  emit('update:form-state', {
    ...props.formState,
    bodyMetrics: {
      ...props.formState.bodyMetrics,
      [field]: value
    }
  })
}
</script>

<template>
  <div class="space-y-8">
    <!-- Personal Information Section -->
    <div class="bg-amber-100 rounded-2xl border border-amber-200 p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-semibold font-serif text-stone-900">Información Personal</h2>
          <p class="text-sm text-stone-600 mt-0.5">Datos básicos del gladiador del Coliseo</p>
        </div>
        <div v-if="calculatedAge" class="ml-auto">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-200 text-amber-800">
            {{ calculatedAge }} años
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="md:col-span-2">
          <MemberFormField
            label="Nombre completo"
            :model-value="formState.basicInfo.name_full"
            @update:model-value="updateBasicInfo('name_full', $event)"
            placeholder="Nombre y apellidos completos"
            required
            :disabled="disabled"
            :errors="errors?.name_full"
          />
        </div>

        <MemberFormField
          label="Tipo de documento"
          type="select"
          :model-value="formState.basicInfo.type_document"
          @update:model-value="updateBasicInfo('type_document', $event)"
          :options="DOCUMENT_TYPE_OPTIONS"
          required
          :disabled="disabled"
          :errors="errors?.type_document"
        />

        <MemberFormField
          label="Número de documento"
          :model-value="formState.basicInfo.number_document"
          @update:model-value="updateBasicInfo('number_document', $event)"
          placeholder="Sin puntos ni espacios"
          required
          :disabled="disabled"
          :errors="errors?.number_document"
        />

        <MemberFormField
          label="Fecha de nacimiento"
          type="date"
          :model-value="formState.basicInfo.date_of_birth"
          @update:model-value="updateBasicInfo('date_of_birth', $event)"
          required
          :disabled="disabled"
          :errors="errors?.date_of_birth"
        />

        <MemberFormField
          label="Género"
          type="select"
          :model-value="formState.basicInfo.gender"
          @update:model-value="updateBasicInfo('gender', $event)"
          :options="GENDER_OPTIONS"
          required
          :disabled="disabled"
          :errors="errors?.gender"
        />

        <MemberFormField
          label="Número de teléfono"
          type="tel"
          :model-value="formState.basicInfo.phone_number"
          @update:model-value="updateBasicInfo('phone_number', $event)"
          placeholder="Ej: +57 300 123 4567"
          required
          :disabled="disabled"
          :errors="errors?.phone_number"
        />

        <div class="md:col-span-2">
          <MemberFormField
            label="Dirección de residencia"
            :model-value="formState.basicInfo.address"
            @update:model-value="updateBasicInfo('address', $event)"
            placeholder="Dirección completa con ciudad"
            required
            :disabled="disabled"
            :errors="errors?.address"
          />
        </div>
      </div>
    </div>

    <!-- Body Metrics Section -->
    <div class="bg-amber-100 rounded-2xl border border-amber-200 p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-semibold font-serif text-stone-900">Métricas Corporales</h2>
          <p class="text-sm text-stone-600 mt-0.5">Medidas físicas del guerrero</p>
        </div>
        <BMIIndicator :bmi="calculatedBMI" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Required Metrics -->
        <MemberFormField
          label="Peso"
          type="number"
          :model-value="formState.bodyMetrics.weight_kg"
          @update:model-value="updateBodyMetrics('weight_kg', $event)"
          placeholder="En kilogramos"
          :min="1"
          :max="500"
          :step="0.1"
          required
          description="Peso corporal en kg"
          :disabled="disabled"
          :errors="errors?.weight_kg"
        />

        <MemberFormField
          label="Altura"
          type="number"
          :model-value="formState.bodyMetrics.height_cm"
          @update:model-value="updateBodyMetrics('height_cm', $event)"
          placeholder="En centímetros"
          :min="50"
          :max="250"
          required
          description="Altura en centímetros"
          :disabled="disabled"
          :errors="errors?.height_cm"
        />

        <!-- Optional Metrics -->
        <MemberFormField
          label="Grasa corporal"
          type="number"
          :model-value="formState.bodyMetrics.body_fat_percentage"
          @update:model-value="updateBodyMetrics('body_fat_percentage', $event)"
          placeholder="Porcentaje"
          :min="1"
          :max="50"
          :step="0.1"
          description="% de grasa corporal"
          :disabled="disabled"
          :errors="errors?.body_fat_percentage"
        />

        <MemberFormField
          label="Masa muscular"
          type="number"
          :model-value="formState.bodyMetrics.muscle_mass_kg"
          @update:model-value="updateBodyMetrics('muscle_mass_kg', $event)"
          placeholder="En kilogramos"
          :min="1"
          :max="200"
          :step="0.1"
          description="Masa muscular en kg"
          :disabled="disabled"
          :errors="errors?.muscle_mass_kg"
        />

        <MemberFormField
          label="Pecho"
          type="number"
          :model-value="formState.bodyMetrics.chest_cm"
          @update:model-value="updateBodyMetrics('chest_cm', $event)"
          placeholder="En centímetros"
          :min="50"
          :max="200"
          description="Circunferencia del pecho"
          :disabled="disabled"
          :errors="errors?.chest_cm"
        />

        <MemberFormField
          label="Cintura"
          type="number"
          :model-value="formState.bodyMetrics.waist_cm"
          @update:model-value="updateBodyMetrics('waist_cm', $event)"
          placeholder="En centímetros"
          :min="40"
          :max="150"
          description="Circunferencia de la cintura"
          :disabled="disabled"
          :errors="errors?.waist_cm"
        />

        <MemberFormField
          label="Cadera"
          type="number"
          :model-value="formState.bodyMetrics.hip_cm"
          @update:model-value="updateBodyMetrics('hip_cm', $event)"
          placeholder="En centímetros"
          :min="50"
          :max="200"
          description="Circunferencia de la cadera"
          :disabled="disabled"
          :errors="errors?.hip_cm"
        />

        <MemberFormField
          label="Brazo"
          type="number"
          :model-value="formState.bodyMetrics.arm_cm"
          @update:model-value="updateBodyMetrics('arm_cm', $event)"
          placeholder="En centímetros"
          :min="15"
          :max="60"
          description="Circunferencia del brazo"
          :disabled="disabled"
          :errors="errors?.arm_cm"
        />

        <MemberFormField
          label="Pierna"
          type="number"
          :model-value="formState.bodyMetrics.leg_cm"
          @update:model-value="updateBodyMetrics('leg_cm', $event)"
          placeholder="En centímetros"
          :min="30"
          :max="120"
          description="Circunferencia del muslo"
          :disabled="disabled"
          :errors="errors?.leg_cm"
        />
      </div>
    </div>
  </div>
</template>