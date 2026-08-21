<script setup lang="ts">
import AssignmentCheckbox from '../atoms/AssignmentCheckbox.vue'

defineProps<{
  name: string
  phone: string
  documentNumber: string
  isSelected: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <article
    class="flex cursor-pointer items-center gap-4 rounded-xl border p-4 shadow-sm transition-all duration-200"
    :class="isSelected
      ? 'border-amber-500 bg-amber-100 ring-1 ring-amber-500/30'
      : 'border-amber-200 bg-amber-50 hover:border-amber-300 hover:shadow-md'"
    @click="$emit('toggle')"
  >
    <div
      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 font-serif text-lg font-bold text-white"
    >
      {{ name.charAt(0).toUpperCase() }}
    </div>
    <div class="min-w-0 flex-1">
      <h3 class="truncate font-semibold text-stone-800">{{ name }}</h3>
      <p class="mt-0.5 text-sm text-stone-500">Teléfono: {{ phone || '—' }}</p>
      <p class="text-sm text-stone-500">Documento: {{ documentNumber || '—' }}</p>
    </div>
    <AssignmentCheckbox :is-selected="isSelected" @toggle="$emit('toggle')" />
  </article>
</template>
