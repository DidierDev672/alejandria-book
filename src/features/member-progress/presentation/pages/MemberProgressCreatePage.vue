<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberProgressStore } from '../../application/stores/useMemberProgressStore'
import { MemberProgressDomainService } from '../../domain/services/MemberProgressDomainService'
import MemberProgressFormContent from '../components/organisms/MemberProgressFormContent.vue'
import type { MemberProgressValidationErrors } from '../../domain/entities/MemberProgress.types'

const router = useRouter()
const store = useMemberProgressStore()

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const validationErrors = ref<MemberProgressValidationErrors>({})
const formState = ref(store.createEmptyFormState())

function validate(): boolean {
  const errors: MemberProgressValidationErrors = {}

  if (!formState.value.user_id) {
    errors.user_id = ['Debes seleccionar un miembro']
  }

  if (!formState.value.month_year) {
    errors.month_year = ['El mes y año son obligatorios']
  }

  if (formState.value.recorded_value === '' || Number(formState.value.recorded_value) < 0) {
    errors.recorded_value = ['El valor registrado debe ser un número positivo']
  }

  const hasErrors = Object.keys(errors).length > 0
  if (hasErrors) validationErrors.value = errors
  return !hasErrors
}

async function handleSubmit() {
  if (!validate()) return

  isSubmitting.value = true
  submitError.value = null

  try {
    const dto = MemberProgressDomainService.formStateToDTO(formState.value)
    const created = await store.createProgress(dto)
    if (created) {
      router.push({ name: 'member-progress-list' })
    }
  } catch (error: any) {
    submitError.value = error.message || 'Error al registrar el progreso'
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  router.back()
}

const canSubmit = computed(() => {
  return formState.value.user_id !== '' && formState.value.month_year !== '' && formState.value.recorded_value !== ''
})

onMounted(() => {
  const token = localStorage.getItem('auth_token')
  if (!token) router.push({ name: 'login' })
})
</script>
<template>
  <div class="min-h-screen bg-[#FFFBF5] px-6 py-8">
    <div class="pointer-events-none fixed right-0 top-0 opacity-10 -z-10">
      <svg width="360" height="260" viewBox="0 0 360 260" fill="none">
        <circle cx="320" cy="-20" r="160" fill="#f59e0b" /><circle cx="270" cy="55" r="80" fill="#ea580c" />
      </svg>
    </div>
    <div class="pointer-events-none fixed bottom-0 left-0 opacity-5 -z-10">
      <svg width="240" height="200" viewBox="0 0 240 200" fill="none"><circle cx="0" cy="200" r="140" fill="#f59e0b" /></svg>
    </div>
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-white/80 backdrop-blur-sm px-6 py-5 shadow-xl shadow-amber-100/60">
        <div class="pointer-events-none absolute right-0 top-0 opacity-10">
          <svg width="180" height="120" viewBox="0 0 180 120" fill="none"><circle cx="160" cy="-10" r="90" fill="#f59e0b" /><circle cx="120" cy="30" r="45" fill="#ea580c" /></svg>
        </div>
        <div class="flex items-center gap-4">
          <button @click="handleCancel"
            class="w-10 h-10 bg-amber-100 hover:bg-amber-200 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-colors border border-amber-200">
            <svg class="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="text-3xl font-bold font-serif text-stone-900">Registrar Progreso</h1>
            <p class="text-sm text-stone-500 mt-0.5">Registro de progreso de objetivos de un miembro del Coliseo</p>
          </div>
        </div>
      </div>

      <div v-if="submitError" class="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-red-700">{{ submitError }}</p>
          <button @click="submitError = null" class="mt-2 text-xs font-medium text-amber-700 hover:underline">Cerrar</button>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" novalidate>
        <div class="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 backdrop-blur-sm p-6 shadow-xl shadow-amber-100/40">
          <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          <MemberProgressFormContent
            :form-state="formState"
            :errors="validationErrors"
            :disabled="isSubmitting"
            @update:form-state="formState = $event"
          />
        </div>

        <div class="bg-amber-100 rounded-2xl border border-amber-200 p-6 flex items-center justify-between mt-8">
          <button type="button" @click="handleCancel" :disabled="isSubmitting"
            class="inline-flex items-center gap-2 border-2 border-stone-200 text-stone-600 hover:border-amber-200 hover:bg-amber-50 hover:text-stone-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            Cancelar
          </button>
          <button type="submit" :disabled="!canSubmit || isSubmitting"
            class="relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <svg v-if="isSubmitting" class="w-4 h-4 animate-spin relative" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <svg v-else class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="relative">{{ isSubmitting ? 'Registrando...' : 'Registrar Progreso' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>