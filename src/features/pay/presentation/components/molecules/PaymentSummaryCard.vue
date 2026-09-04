<script setup lang="ts">
// ============================================================
// MOLECULE · PaymentSummaryCard
// Resumen visual de la operación antes de guardar.
// ============================================================

import type { PaymentMethod } from '../../../domain/Pay'
import PayMethodBadge from '../atoms/PayMethodBadge.vue'

defineProps<{
  memberName: string
  membershipName: string
  amount: string
  currency: string
  method: PaymentMethod | ''
  paymentDate: string
}>()
</script>

<template>
  <div class="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
    <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">Tu pago</p>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <span
        v-if="memberName"
        class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/70"
      >
        {{ memberName }}
      </span>
      <span
        v-if="membershipName"
        class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/70"
      >
        {{ membershipName }}
      </span>
      <span
        v-if="amount && amount.trim() !== ''"
        class="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1 font-mono text-xs font-bold text-white"
      >
        {{ currency }} {{ amount }}
      </span>
      <PayMethodBadge v-if="method" :method="method as PaymentMethod" />
      <span
        v-if="paymentDate"
        class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/70"
      >
        {{ paymentDate }}
      </span>
    </div>
  </div>
</template>