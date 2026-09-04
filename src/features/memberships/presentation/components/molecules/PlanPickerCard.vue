<script setup lang="ts">
import type { MembershipPlanPayload } from '../../../domain/entities/Membership.types'
import { MembershipDomainService } from '../../../domain/services/MembershipDomainService'

interface Props {
  plan: MembershipPlanPayload
  selected: boolean
  index: number
}

defineProps<Props>()

defineEmits<{
  (e: 'select', plan: MembershipPlanPayload): void
}>()

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 450 } },
  animate: { opacity: 1, y: 0 },
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function durationLabel(days: number | null): string {
  if (!days) return '—'
  return `${days} día${days !== 1 ? 's' : ''}`
}
</script>

<template>
  <article
    v-motion
    :initial="fadeIn.initial"
    :enter="{ ...fadeIn.enter, transition: { duration: 450, delay: index * 60 } }"
    :animate="fadeIn.animate"
    role="radio"
    :aria-checked="selected"
    tabindex="0"
    class="group relative flex flex-col rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
    :class="selected
      ? 'border-amber-600 bg-amber-50 shadow-sm ring-1 ring-amber-600/30'
      : 'border-amber-200 bg-[#FFFBF5] shadow-sm hover:border-amber-400 hover:bg-amber-50/60'"
    @click="$emit('select', plan)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="truncate text-sm font-bold text-stone-800">{{ plan.name }}</p>
        <span
          class="mt-1.5 inline-flex items-center rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-orange-800"
        >
          {{ MembershipDomainService.typeLabel(plan.type) }}
        </span>
      </div>

      <div
        class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
        :class="selected
          ? 'border-amber-600 bg-amber-600 text-white'
          : 'border-stone-300 bg-white text-transparent group-hover:border-amber-500'"
        aria-hidden="true"
      >
        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>

    <dl class="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 text-xs">
      <div class="flex flex-col gap-0.5">
        <span class="text-stone-400">Duración</span>
        <span class="font-semibold text-stone-700">{{ durationLabel(plan.duration_days) }}</span>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-stone-400">Precio</span>
        <span class="font-semibold text-stone-700">{{ formatPrice(plan.price) }}</span>
      </div>
      <div class="flex flex-col items-end gap-0.5">
        <span class="text-stone-400">Estado</span>
        <span
          class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          :class="plan.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'"
        >
          <span
            class="h-1.5 w-1.5 rounded-full"
            :class="plan.is_active ? 'bg-emerald-500' : 'bg-stone-400'"
            aria-hidden="true"
          />
          {{ plan.is_active ? 'Activo' : 'Inactivo' }}
        </span>
      </div>
    </dl>
  </article>
</template>
