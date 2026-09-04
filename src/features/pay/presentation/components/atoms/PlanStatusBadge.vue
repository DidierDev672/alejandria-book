<script setup lang="ts">
// ============================================================
// ATOM · PlanStatusBadge
// Cápsula que comunica si un plan está activo o inactivo.
// Presentación pura: recibe el booleano y decide el color.
// ============================================================

withDefaults(
  defineProps<{
    active: boolean
  }>(),
  {
    active: false,
  },
)
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
    :class="active ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="active ? 'bg-emerald-500' : 'bg-orange-500'" aria-hidden="true" />
    {{ active ? 'Activo' : 'Inactivo' }}
  </span>
</template>
