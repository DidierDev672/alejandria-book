<script setup lang="ts">
import { computed } from 'vue'
import MemberFormField from '../molecules/MemberFormField.vue'
import HealthConditionCard from '../molecules/HealthConditionCard.vue'
import MemberGoalCard from '../molecules/MemberGoalCard.vue'
import { MOOD_OPTIONS } from '../../../application/stores/useMemberStore'
import type { 
  MemberFormState, 
  HealthCondition, 
  MemberGoal 
} from '../../../domain/entities/Member.types'

interface Props {
  formState: MemberFormState
  errors?: {
    mentalHealth?: Record<string, string[]>
    healthConditions?: Record<number, Record<string, string[]>>
    goals?: Record<number, Record<string, string[]>>
  }
  disabled?: boolean
}

interface Emits {
  (e: 'update:form-state', formState: MemberFormState): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const stressLevelColor = computed(() => {
  const level = props.formState.mentalHealth.stress_level
  if (level <= 3) return 'text-emerald-600'
  if (level <= 6) return 'text-amber-600' 
  return 'text-red-600'
})

const stressLevelLabel = computed(() => {
  const level = props.formState.mentalHealth.stress_level
  if (level <= 3) return 'Bajo'
  if (level <= 6) return 'Moderado'
  return 'Alto'
})

function updateMentalHealth(field: string, value: any) {
  emit('update:form-state', {
    ...props.formState,
    mentalHealth: {
      ...props.formState.mentalHealth,
      [field]: value
    }
  })
}

function addHealthCondition() {
  const newCondition: Omit<HealthCondition, 'id' | 'created_at' | 'updated_at'> = {
    condition_name: '',
    severity: 'LEVE',
    notes: '',
    is_active: true
  }
  
  emit('update:form-state', {
    ...props.formState,
    healthConditions: [...props.formState.healthConditions, newCondition]
  })
}

function updateHealthCondition(index: number, condition: Omit<HealthCondition, 'id' | 'created_at' | 'updated_at'>) {
  const conditions = [...props.formState.healthConditions]
  conditions[index] = condition
  
  emit('update:form-state', {
    ...props.formState,
    healthConditions: conditions
  })
}

function removeHealthCondition(index: number) {
  const conditions = props.formState.healthConditions.filter((_, i) => i !== index)
  
  emit('update:form-state', {
    ...props.formState,
    healthConditions: conditions
  })
}

function addGoal() {
  const newGoal: Omit<MemberGoal, 'id' | 'created_at' | 'updated_at'> = {
    goal_type: 'MANTENIMIENTO',
    target_value: '',
    is_achieved: false
  }
  
  emit('update:form-state', {
    ...props.formState,
    goals: [...props.formState.goals, newGoal]
  })
}

function updateGoal(index: number, goal: Omit<MemberGoal, 'id' | 'created_at' | 'updated_at'>) {
  const goals = [...props.formState.goals]
  goals[index] = goal
  
  emit('update:form-state', {
    ...props.formState,
    goals: goals
  })
}

function removeGoal(index: number) {
  const goals = props.formState.goals.filter((_, i) => i !== index)
  
  emit('update:form-state', {
    ...props.formState,
    goals: goals
  })
}
</script>

<template>
  <div class="space-y-8">
    <!-- Mental Health Section -->
    <div class="bg-amber-100 rounded-2xl border border-amber-200 p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-semibold font-serif text-stone-900">Salud Mental</h2>
          <p class="text-sm text-stone-600 mt-0.5">Estado psicológico y bienestar general</p>
        </div>
        <div>
          <span :class="['inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', 
                        stressLevelColor.replace('text-', 'bg-').replace('-600', '-100'), 
                        stressLevelColor]">
            Estrés: {{ stressLevelLabel }} ({{ formState.mentalHealth.stress_level }}/10)
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Stress Level Slider -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-stone-700">
            Nivel de estrés
            <span class="text-red-500 ml-0.5">*</span>
          </label>
          <div class="px-3 py-4 bg-white border border-amber-300 rounded-lg">
            <input
              type="range"
              :value="formState.mentalHealth.stress_level"
              @input="updateMentalHealth('stress_level', Number(($event.target as HTMLInputElement).value))"
              min="1"
              max="10"
              step="1"
              :disabled="disabled"
              class="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
            />
            <div class="flex justify-between text-xs text-stone-500 mt-2">
              <span>1 - Muy bajo</span>
              <span>5 - Moderado</span>
              <span>10 - Muy alto</span>
            </div>
          </div>
          <div v-if="errors?.mentalHealth?.stress_level" class="space-y-1">
            <p 
              v-for="error in errors.mentalHealth.stress_level" 
              :key="error" 
              class="text-xs text-red-600 font-medium"
            >
              {{ error }}
            </p>
          </div>
        </div>

        <MemberFormField
          label="Estado de ánimo"
          type="select"
          :model-value="formState.mentalHealth.mood"
          @update:model-value="updateMentalHealth('mood', $event)"
          :options="MOOD_OPTIONS"
          required
          description="Estado general predominante"
          :disabled="disabled"
          :errors="errors?.mentalHealth?.mood"
        />

        <MemberFormField
          label="Horas de sueño"
          type="number"
          :model-value="formState.mentalHealth.sleep_hours"
          @update:model-value="updateMentalHealth('sleep_hours', $event)"
          placeholder="Promedio diario"
          :min="1"
          :max="24"
          :step="0.5"
          required
          description="Horas promedio por noche"
          :disabled="disabled"
          :errors="errors?.mentalHealth?.sleep_hours"
        />

        <div class="md:col-span-2 lg:col-span-3">
          <MemberFormField
            label="Notas sobre salud mental"
            type="textarea"
            :model-value="formState.mentalHealth.notes"
            @update:model-value="updateMentalHealth('notes', $event)"
            placeholder="Describe tu estado mental, factores de estrés, técnicas de relajación..."
            :rows="3"
            :disabled="disabled"
            :errors="errors?.mentalHealth?.notes"
          />
        </div>
      </div>
    </div>

    <!-- Health Conditions Section -->
    <div class="bg-amber-100 rounded-2xl border border-amber-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-semibold font-serif text-stone-900">Condiciones de Salud</h2>
            <p class="text-sm text-stone-600 mt-0.5">Condiciones médicas actuales o históricas</p>
          </div>
        </div>
        
        <button
          type="button"
          @click="addHealthCondition"
          :disabled="disabled"
          class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white 
                 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar condición
        </button>
      </div>

      <div v-if="formState.healthConditions.length === 0" class="text-center py-8">
        <div class="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p class="text-stone-600 text-sm">
          No hay condiciones de salud registradas
        </p>
        <p class="text-stone-500 text-xs mt-1">
          Agrega condiciones médicas relevantes para un mejor seguimiento
        </p>
      </div>

      <div v-else class="space-y-4">
        <HealthConditionCard
          v-for="(condition, index) in formState.healthConditions"
          :key="`condition-${index}`"
          :condition="condition"
          :index="index"
          :errors="errors?.healthConditions?.[index]"
          :disabled="disabled"
          @update:condition="updateHealthCondition(index, $event)"
          @remove="removeHealthCondition(index)"
        />
      </div>
    </div>

    <!-- Goals Section -->
    <div class="bg-amber-100 rounded-2xl border border-amber-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-semibold font-serif text-stone-900">Objetivos del Miembro</h2>
            <p class="text-sm text-stone-600 mt-0.5">Metas y aspiraciones de entrenamiento</p>
          </div>
        </div>
        
        <button
          type="button"
          @click="addGoal"
          :disabled="disabled"
          class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white 
                 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar objetivo
        </button>
      </div>

      <div v-if="formState.goals.length === 0" class="text-center py-8">
        <div class="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p class="text-stone-600 text-sm">
          No hay objetivos definidos
        </p>
        <p class="text-stone-500 text-xs mt-1">
          Define las metas del guerrero para su entrenamiento
        </p>
      </div>

      <div v-else class="space-y-4">
        <MemberGoalCard
          v-for="(goal, index) in formState.goals"
          :key="`goal-${index}`"
          :goal="goal"
          :index="index"
          :errors="errors?.goals?.[index]"
          :disabled="disabled"
          @update:goal="updateGoal(index, $event)"
          @remove="removeGoal(index)"
        />
      </div>
    </div>
  </div>
</template>