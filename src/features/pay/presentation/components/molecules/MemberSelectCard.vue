<script setup lang="ts">
// ============================================================
// MOLECULE · MemberSelectCard
// Tarjeta de miembro para el selector modal.
// Presentación pura: recibe el miembro y emite el clic.
// ============================================================

import type { Member } from '../../../../members/domain/entities/Member.types'
import { MemberDomainService } from '../../../../members/domain/services/MemberDomainService'

defineProps<{
  member: Member
}>()

defineEmits<{
  (e: 'select', member: Member): void
}>()
</script>

<template>
  <button
    type="button"
    class="group flex w-full items-center gap-4 rounded-2xl border-2 border-stone-100 bg-white p-4 text-left transition-all duration-200 hover:border-amber-300 hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-amber-500/20 active:scale-[0.99]"
    @click="$emit('select', member)"
  >
    <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-base font-black text-amber-700">
      {{ member.name_full.slice(0, 1).toUpperCase() }}
    </span>

    <span class="min-w-0 flex-1">
      <span class="block truncate text-sm font-bold text-stone-800">{{ member.name_full }}</span>
      <span class="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-stone-500">
        <span class="inline-flex items-center gap-1">
          <svg class="h-3.5 w-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
            />
          </svg>
          {{ member.number_document }}
        </span>
        <span class="inline-flex items-center gap-1">
          <svg class="h-3.5 w-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
            />
          </svg>
          {{ member.phone_number }}
        </span>
      </span>
    </span>

    <svg
      class="h-5 w-5 shrink-0 text-stone-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-amber-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  </button>
</template>