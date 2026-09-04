<script setup lang="ts">
// ============================================================
// MOLECULE · MembershipPlanCard
// Tarjeta seleccionable de membresía: arriba la información
// básica del miembro, debajo la del plan que la sostiene
// (consumida desde /planes/{id} vía el store).
// ============================================================

import { computed, onMounted } from 'vue'
import type { Member } from '../../../../members/domain/entities/Member.types'
import { MembershipDomainService } from '../../../../memberships/domain/services/MembershipDomainService'
import { usePayRegisterStore } from '../../../application/stores/usePayRegisterStore'
import type { PayMembership } from '../../../domain/Pay'
import Badge from '../atoms/Badge.vue'
import PlanStatusBadge from '../atoms/PlanStatusBadge.vue'

interface Props {
  member: Member
  membership: PayMembership
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
})

defineEmits<{
  (e: 'select'): void
}>()

const store = usePayRegisterStore()

const planId = computed(() => props.membership.plan_id)
const plan = computed(() => store.plans[planId.value])
const planKind = computed(() => store.planKinds[planId.value] ?? 'idle')
const planError = computed(() => store.planErrorMessages[planId.value] ?? '')

const isLoading = computed(() => planKind.value === 'loading')
const hasError = computed(() => planKind.value === 'error')

const planTypeLabel = computed(() =>
  plan.value ? MembershipDomainService.typeLabel(plan.value.type) : '',
)
const planDurationLabel = computed(() =>
  plan.value && plan.value.duration_days ? MembershipDomainService.durationLabel(plan.value.duration_days) : '',
)
const planPrice = computed(() => (plan.value ? formatAmount(plan.value.price) : '—'))

onMounted(() => {
  store.fetchPlan(planId.value)
})

function formatAmount(value: number): string {
  return value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<template>
  <button type="button" role="radio" :aria-checked="selected"
    class="group w-full rounded-2xl border-2 bg-white p-4 text-left transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-500/20 active:scale-[0.99]"
    :class="selected
      ? 'border-amber-600 shadow-md ring-2 ring-amber-600/15'
      : 'border-stone-100 hover:border-amber-300 hover:shadow-sm'
      " @click="$emit('select')">
    <!-- ── Información básica del miembro ── -->
    <div class="flex items-center gap-3">
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-sm font-black text-amber-700">
        {{ member.name_full.slice(0, 1).toUpperCase() }}
      </span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-stone-800">{{ member.name_full }}</p>
        <p class="mt-0.5 truncate text-xs font-medium text-stone-500">
          {{ member.number_document }} · {{ member.phone_number }}
        </p>
      </div>
      <span v-if="selected"
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white"
        aria-hidden="true">
        <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clip-rule="evenodd" />
        </svg>
      </span>
    </div>

    <!-- ── Información básica del plan ── -->
    <div class="mt-3 rounded-xl bg-stone-50 px-4 py-3">
      <template v-if="isLoading">
        <div class="flex items-center gap-3">
          <div class="h-4 w-4 rounded-full border-2 border-amber-200 border-t-amber-600 animate-spin"
            aria-hidden="true" />
          <p class="text-xs text-stone-500">Cargando el detalle del plan…</p>
        </div>
      </template>

      <template v-else-if="hasError">
        <div class="flex items-start gap-2">
          <svg class="mt-0.5 h-4 w-4 shrink-0 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p class="text-xs leading-relaxed text-stone-600">{{ planError }}</p>
        </div>
      </template>

      <template v-else-if="plan">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <p class="truncate text-sm font-bold text-stone-800">{{ plan.name }}</p>
              <Badge v-if="plan.duration_days" tone="orange" dot size="sm"
                :label="`Período: ${plan.duration_days} días`">
                {{ plan.duration_days }} días
              </Badge>
            </div>
            <p class="mt-1 text-xs font-medium text-stone-500">{{ planTypeLabel }}</p>
          </div>
          <PlanStatusBadge :active="plan.is_active" />
        </div>

        <div class="mt-3 border-t border-stone-200 pt-3">
          <dl class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <div class="flex items-baseline gap-1">
              <dt class="text-stone-400">Precio</dt>
              <dd class="font-mono text-sm font-black text-amber-700">S/ {{ planPrice }}</dd>
            </div>
            <div v-if="plan.price_per_class > 0" class="flex items-baseline gap-1">
              <dt class="text-stone-400">Por clase</dt>
              <dd class="font-mono font-bold text-stone-700">S/ {{ plan.price_per_class.toLocaleString('es-PE') }}</dd>
            </div>
            <div v-if="plan.classes_included > 0" class="flex items-baseline gap-1">
              <dt class="text-stone-400">Clases incluidas</dt>
              <dd class="font-bold text-stone-700">{{ plan.classes_included }}</dd>
            </div>
          </dl>
        </div>
      </template>
    </div>
  </button>
</template>
