<script setup lang="ts">
// ============================================================
// ATOM · PayMethodBadge
// Chip compacto de método de pago (icono + etiqueta).
// ============================================================

import { PaymentDomainService } from '../../../domain/Pay'
import type { PaymentMethod } from '../../../domain/Pay'
import PayMethodIcon from './PayMethodIcon.vue'

defineProps<{
  method: PaymentMethod
}>()
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/70"
  >
    <PayMethodIcon :method="method" :size="14" />
    {{ PaymentDomainService.methodLabel(method) }}
  </span>
</template>