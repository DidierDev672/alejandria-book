<script setup lang="ts">
// ============================================================
// MOLECULE - Member basic data block for workout detail modal
// ============================================================

import type { MemberSummary } from '../../../domain/entities/MemberSummary.types'
import OrangeGradientBadge from '../atoms/OrangeGradientBadge.vue'

defineProps<{
  member: MemberSummary | null
  memberId: string
  loading?: boolean
}>()
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center gap-2">
      <h3 class="text-sm font-bold font-serif text-stone-900">Datos del miembro</h3>
      <OrangeGradientBadge v-if="member?.genre" :label="member.genre" />
    </div>

    <div
      v-if="loading && !member"
      class="h-20 rounded-xl bg-amber-50 animate-pulse border border-amber-100"
    />

    <div
      v-else-if="member"
      class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"
    >
      <div>
        <p class="text-xs text-stone-400 mb-0.5">Nombre completo</p>
        <p class="font-semibold text-stone-900">{{ member.name_full || '—' }}</p>
      </div>
      <div>
        <p class="text-xs text-stone-400 mb-0.5">Documento</p>
        <p class="text-stone-700">
          {{ member.type_document }} {{ member.number_document }}
        </p>
      </div>
      <div>
        <p class="text-xs text-stone-400 mb-0.5">Teléfono</p>
        <p class="text-stone-700">{{ member.phone_number || '—' }}</p>
      </div>
      <div>
        <p class="text-xs text-stone-400 mb-0.5">Dirección</p>
        <p class="text-stone-700 truncate" :title="member.address">
          {{ member.address || '—' }}
        </p>
      </div>
      <div class="sm:col-span-2">
        <p class="text-xs text-stone-400 mb-0.5">ID miembro</p>
        <p class="font-mono text-xs text-stone-500">{{ member.id || memberId }}</p>
      </div>
    </div>

    <div v-else class="text-sm text-stone-500">
      <p class="font-mono text-xs text-stone-400">{{ memberId }}</p>
      <p class="mt-1">No se pudo cargar la ficha del miembro.</p>
    </div>
  </section>
</template>
