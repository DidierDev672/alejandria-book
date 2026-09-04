<script setup lang="ts">
// ============================================================
// ATOM · MembershipPillBadge
// Cápsula compacta que nombra una membresía a partir de su
// plan_id, con su estado como segundo dato de lectura rápida.
// ============================================================

import type { PayMembership } from '../../../domain/Pay'

interface Props {
  membership: PayMembership
  selected?: boolean
}

withDefaults(defineProps<Props>(), {
  selected: false,
})

defineEmits<{
  (e: 'select'): void
}>()

function statusLabel(status: string): string {
  return status.toUpperCase()
}
</script>

<template>
  <button
    type="button"
    role="radio"
    :aria-checked="selected"
    class="group inline-flex items-center gap-2 rounded-full border-2 py-1.5 pr-3.5 pl-4 text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-500/30 active:scale-[0.97]"
    :class="
      selected
        ? 'border-amber-600 bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/20'
        : 'border-amber-200 bg-amber-50/80 text-stone-700 hover:border-amber-400 hover:bg-amber-100'
    "
    @click="$emit('select')"
  >
    <span
      class="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
      :class="selected ? 'border-white/50 text-white' : 'border-amber-300 text-transparent group-hover:border-amber-400'"
      aria-hidden="true"
    >
      <svg v-if="selected" class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clip-rule="evenodd"
        />
      </svg>
    </span>

    <span class="font-mono text-[11px] tracking-tight">
      {{ membership.plan_id }}
    </span>

    <span
      class="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
      :class="selected ? 'bg-white/20 text-amber-50' : 'bg-emerald-100 text-emerald-700'"
    >
      {{ statusLabel(membership.status) }}
    </span>
  </button>
</template>