<script setup lang="ts">
import BaseInput from '@/utils/components/BaseInput.vue'
import BaseModal from '@/utils/components/BaseModal.vue'
import LoadingView from '@/utils/loading/presentation/components/LoadingView.vue'
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { useMembershipFormStore } from '../../application/stores/useMembershipFormStore'
import type {
  MembershipDraft,
  MembershipDurationDays,
  MembershipType,
  MembershipValidationErrors,
} from '../../domain/entities/Membership.types'
import {
  MEMBERSHIP_DURATION_OPTIONS,
  MembershipDomainService,
} from '../../domain/services/MembershipDomainService'

const formStore = useMembershipFormStore()
const form = reactive<MembershipDraft>(MembershipDomainService.createDraft())
const errors = ref<MembershipValidationErrors>({})

const isByClass = computed(() => form.type === 'BY_CLASS')
const isByPeriod = computed(() => form.type === 'BY_PERIOD')
const isResultOpen = computed(() => formStore.submitOutcome !== null)
const isSuccess = computed(() => formStore.submitOutcome === 'success')

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  enter: { opacity: 1, y: 0, transition: { duration: 600 } },
  animate: { opacity: 1, y: 0 },
}

function selectType(type: MembershipType): void {
  form.type = type
  errors.value = { ...errors.value, type: undefined }
}

function selectDuration(days: MembershipDurationDays): void {
  form.durationDays = days
  errors.value = { ...errors.value, durationDays: undefined }
}

async function handleSubmit(): Promise<void> {
  if (formStore.isSubmitting) return

  const nextErrors = MembershipDomainService.validate(form)
  errors.value = nextErrors
  if (MembershipDomainService.hasErrors(nextErrors)) return

  await formStore.submitPlan(form)
}

function closeResult(): void {
  if (formStore.isSubmitting) return

  const wasSuccess = formStore.submitOutcome === 'success'
  formStore.clearSubmitOutcome()
  if (wasSuccess) {
    Object.assign(form, MembershipDomainService.createDraft())
    errors.value = {}
  }
}

onUnmounted(() => {
  formStore.$reset()
})

watch(
  () => form.type,
  (type) => {
    if (type === 'BY_CLASS') {
      form.durationDays = null
      errors.value = { ...errors.value, durationDays: undefined }
      return
    }
    if (type === 'BY_PERIOD') {
      form.priceClass = ''
      errors.value = { ...errors.value, priceClass: undefined }
    }
  },
)
</script>

<template>
  <div class="min-h-screen bg-[#FFFBF5] px-6 py-8">
    <LoadingView
      :is-loading="formStore.isSubmitting"
      title="Estamos guardando este plan"
      description="Respira. El lugar de esta membresía se está escribiendo con calma; no se pierde nada de lo que elegiste."
    />
    <div class="pointer-events-none fixed top-0 right-0 -z-10 opacity-10">
      <svg width="360" height="260" viewBox="0 0 360 260" fill="none" aria-hidden="true">
        <circle cx="320" cy="-20" r="160" fill="#f59e0b" />
        <circle cx="270" cy="55" r="80" fill="#ea580c" />
      </svg>
    </div>

    <div class="mx-auto max-w-3xl space-y-6">
      <header
        v-motion
        :initial="fadeUp.initial"
        :enter="fadeUp.enter"
        :animate="fadeUp.animate"
        class="relative overflow-hidden rounded-xl border border-amber-200 bg-amber-100 px-5 py-6 shadow-sm sm:px-8"
      >
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 opacity-90" />
        <div class="pointer-events-none absolute top-0 right-0 opacity-20">
          <svg width="200" height="130" viewBox="0 0 200 130" fill="none" aria-hidden="true">
            <circle cx="180" cy="-10" r="95" fill="#FDE68A" />
            <circle cx="140" cy="35" r="48" fill="#FB923C" />
          </svg>
        </div>
        <div class="relative">
          <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/90">
            Coliseo · Membresías
          </p>
          <h1 class="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
            Crear registro de membresía
          </h1>
          <p class="mt-1 max-w-xl text-sm text-amber-50/80">
            Un plan no es un precio: es la forma en que alguien se queda. Aquí defines, con calma, cómo va a pertenecer.
          </p>
        </div>
      </header>

      <section
        v-motion
        :initial="fadeUp.initial"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 120 } }"
        :animate="fadeUp.animate"
        class="overflow-hidden rounded-xl border border-amber-200 bg-amber-100 p-5 shadow-sm sm:p-8"
      >
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <BaseInput
            v-model="form.name"
            label="Nombre"
            placeholder="Ej. Mensualidad calma, Clase suelta"
            helper-text="Un nombre cercano ayuda a elegir sin pensar demasiado."
            :error="errors.name"
            :required="true"
          />

          <fieldset>
            <legend class="mb-2 text-sm font-medium text-stone-700">
              Tipo <span class="text-rose-600">*</span>
            </legend>
            <div class="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                class="rounded-xl border px-4 py-3 text-left transition-colors"
                :class="isByClass
                  ? 'border-amber-600 bg-amber-50 text-stone-800'
                  : 'border-amber-300 bg-[#FFFBF5] text-stone-700 hover:bg-amber-50'"
                @click="selectType('BY_CLASS')"
              >
                <span class="block text-sm font-semibold">Por clase</span>
                <span class="mt-1 block text-xs text-stone-500">Cada visita cuenta. Ideal cuando el ritmo aún no es fijo.</span>
              </button>
              <button
                type="button"
                class="rounded-xl border px-4 py-3 text-left transition-colors"
                :class="isByPeriod
                  ? 'border-amber-600 bg-amber-50 text-stone-800'
                  : 'border-amber-300 bg-[#FFFBF5] text-stone-700 hover:bg-amber-50'"
                @click="selectType('BY_PERIOD')"
              >
                <span class="block text-sm font-semibold">Por periodo</span>
                <span class="mt-1 block text-xs text-stone-500">Un tiempo propio: 30, 90, 180 o 365 días.</span>
              </button>
            </div>
            <p v-if="errors.type" class="mt-2 text-xs text-rose-600">{{ errors.type }}</p>
          </fieldset>

          <fieldset v-if="isByPeriod">
            <legend class="mb-2 text-sm font-medium text-stone-700">
              Duración en días <span class="text-rose-600">*</span>
            </legend>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                v-for="days in MEMBERSHIP_DURATION_OPTIONS"
                :key="days"
                type="button"
                class="rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors"
                :class="form.durationDays === days
                  ? 'border-amber-600 bg-amber-50 text-amber-800'
                  : 'border-amber-300 bg-[#FFFBF5] text-stone-700 hover:bg-amber-50'"
                @click="selectDuration(days)"
              >
                {{ days }}
              </button>
            </div>
            <p class="mt-2 text-xs text-stone-500">
              {{ form.durationDays ? MembershipDomainService.durationLabel(form.durationDays) : 'Elige el tiempo que este plan va a sostener.' }}
            </p>
            <p v-if="errors.durationDays" class="mt-1 text-xs text-rose-600">{{ errors.durationDays }}</p>
          </fieldset>

          <p v-else-if="isByClass" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-stone-600">
            Por clase no hace falta duración: el ritmo lo marca cada visita, así que los días quedan en vacío a propósito.
          </p>

          <div class="grid gap-4 sm:grid-cols-2">
            <BaseInput
              v-model="form.price"
              type="number"
              label="Precio del plan completo"
              placeholder="0"
              helper-text="Lo que cuesta pertenecer a este plan, entero."
              :error="errors.price"
              :required="true"
            />
            <BaseInput
              v-if="isByClass"
              v-model="form.priceClass"
              type="number"
              label="Precio por clase"
              placeholder="0"
              helper-text="Solo aplica cuando el tipo es por clase."
              :error="errors.priceClass"
              :required="true"
            />
          </div>

          <BaseInput
            v-if="isByPeriod"
            v-model="form.classesIncluded"
            type="number"
            label="Clases incluidas (opcional)"
            placeholder="Ej. 12"
            helper-text="Si el periodo limita clases al mes, escríbelo. Si no hay tope, déjalo en blanco."
            :error="errors.classesIncluded"
          />

          <div class="flex items-start justify-between gap-4 rounded-xl border border-amber-300 bg-[#FFFBF5] px-4 py-3">
            <div>
              <p class="text-sm font-medium text-stone-800">Plan activo</p>
              <p class="mt-0.5 text-xs text-stone-500">
                Puedes apagarlo después, sin borrarlo, cuando deje de ofrecerse.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="form.isActivo"
              class="relative h-7 w-12 shrink-0 rounded-full transition-colors"
              :class="form.isActivo ? 'bg-amber-600' : 'bg-stone-300'"
              @click="form.isActivo = !form.isActivo"
            >
              <span
                class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform"
                :class="form.isActivo ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              class="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700 disabled:pointer-events-none disabled:opacity-50"
              :disabled="formStore.isSubmitting"
            >
              Guardar membresía
            </button>
          </div>
        </form>
      </section>
    </div>

    <BaseModal :is-open="isResultOpen" max-with-class="max-w-md" :expandable="false" @close="closeResult">
      <template #header>
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            :class="isSuccess ? 'bg-white/15 ring-1 ring-white/20' : 'bg-rose-500/20 ring-1 ring-rose-200/30'"
          >
            <svg
              v-if="isSuccess"
              class="h-6 w-6 text-emerald-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-else
              class="h-6 w-6 text-rose-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-serif text-2xl font-bold tracking-wide text-white">
              {{ isSuccess ? 'El plan ya tiene un lugar' : 'No pudimos crear la membresía' }}
            </h3>
            <p class="mt-1 text-sm text-amber-100/80">
              {{ isSuccess ? 'La registramos con calma. Nadie se perdió en el camino.' : 'El envío no llegó bien, pero lo que escribiste sigue aquí.' }}
            </p>
          </div>
        </div>
      </template>
      <template #content>
        <div v-if="isSuccess" class="py-4 text-center">
          <p class="text-base leading-relaxed text-stone-600">
            {{ MembershipDomainService.submitSuccessMessage() }}
          </p>
        </div>
        <div v-else class="flex items-start gap-4 rounded-2xl border border-rose-200/80 bg-rose-50 p-4">
          <p class="text-sm leading-relaxed text-stone-600">
            {{ MembershipDomainService.submitErrorMessage() }}
          </p>
        </div>
      </template>
      <template #footer>
        <button
          v-if="isSuccess"
          type="button"
          class="inline-flex w-full items-center justify-center rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-700"
          @click="closeResult"
        >
          Crear otra
        </button>
        <button
          v-else
          type="button"
          class="inline-flex w-full items-center justify-center rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-700"
          @click="closeResult"
        >
          Intentarlo otra vez
        </button>
      </template>
    </BaseModal>
  </div>
</template>
