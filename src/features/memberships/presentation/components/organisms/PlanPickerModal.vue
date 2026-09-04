<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseModal from '@/utils/components/BaseModal.vue'
import { useMembershipListStore } from '../../../application/stores/useMembershipListStore'
import type { MembershipPlanPayload } from '../../../domain/entities/Membership.types'
import PlanPickerCard from '../molecules/PlanPickerCard.vue'

interface Props {
  isOpen: boolean
  selectedPlanName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', plan: MembershipPlanPayload): void
}>()

const planStore = useMembershipListStore()
const localSelected = ref<string | null>(null)

function handleSelect(plan: MembershipPlanPayload): void {
  localSelected.value = plan.name
}

function confirmSelection(): void {
  const chosen = planStore.plans.find((p) => p.name === localSelected.value)
  if (chosen) {
    emit('select', chosen)
  }
}

function handleClose(): void {
  emit('close')
}

function loadPlans(): void {
  if (planStore.plans.length === 0 && planStore.kind !== 'loading') {
    planStore.fetchPlans()
  }
  localSelected.value = props.selectedPlanName ?? null
}

onMounted(loadPlans)
</script>

<template>
  <BaseModal :is-open="isOpen" max-with-class="max-w-3xl" :expandable="false" @close="handleClose">
    <template #header>
      <div>
        <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/90">Coliseo · Membresías</p>
        <h3 class="mt-1 font-serif text-2xl font-bold text-white">Elige un plan</h3>
        <p class="mt-1 max-w-md text-sm text-amber-50/80">
          El plan marca el ritmo de la permanencia. Toca la tarjeta del que se ajuste a lo que buscas.
        </p>
      </div>
    </template>

    <template #content>
      <div v-if="planStore.isLoading" class="flex flex-col items-center gap-3 py-14">
        <div class="h-8 w-8 rounded-full border-2 border-amber-200 border-t-amber-600 animate-spin" aria-hidden="true" />
        <p class="text-sm text-stone-500">Estamos trayendo tus planes…</p>
      </div>

      <div v-else-if="planStore.kind === 'error'" class="flex flex-col items-center gap-4 py-12 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 ring-1 ring-rose-200">
          <svg class="h-7 w-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 class="font-serif text-lg font-bold text-stone-800">{{ planStore.feedback?.title }}</h4>
          <p class="mx-auto mt-1 max-w-sm text-sm text-stone-500">{{ planStore.feedback?.description }}</p>
        </div>
        <button
          type="button"
          class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          @click="planStore.fetchPlans"
        >
          Intentar otra vez
        </button>
      </div>

      <div v-else-if="planStore.plans.length === 0" class="flex flex-col items-center gap-3 py-12 text-center">
        <svg class="h-12 w-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm7-9v8a1 1 0 01-1 1h-3v2a1 1 0 01-2 0v-2H7v2a1 1 0 01-2 0v-2H2V8a4 4 0 014-4h12a4 4 0 014 4z" />
        </svg>
        <p class="font-serif text-lg font-bold text-stone-700">Aún no hay planes</p>
        <p class="max-w-sm text-sm text-stone-500">Cuando definas un plan, aparecerá aquí para poder asignarlo a un miembro.</p>
      </div>

      <div v-else class="grid gap-3 sm:grid-cols-2">
        <PlanPickerCard
          v-for="(plan, index) in planStore.plans"
          :key="plan.name + index"
          :plan="plan"
          :index="index"
          :selected="localSelected === plan.name"
          @select="handleSelect"
        />
      </div>
    </template>

    <template #footer>
      <button
        type="button"
        class="inline-flex w-full items-center justify-center rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-700 disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
        :disabled="localSelected === null"
        @click="confirmSelection"
      >
        Confirmar plan
      </button>
      <button
        type="button"
        class="inline-flex w-full items-center justify-center rounded-xl border border-amber-300 bg-white px-6 py-2.5 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-50 sm:w-auto"
        @click="handleClose"
      >
        Cancelar
      </button>
    </template>
  </BaseModal>
</template>
