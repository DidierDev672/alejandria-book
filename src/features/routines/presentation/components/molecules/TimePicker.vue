<script setup lang="ts">
// ============================================================
// MOLECULE - Time Picker Component
// ============================================================

import { computed } from 'vue'
import BaseInput from '../atoms/BaseInput.vue'

interface Props {
  modelValue: number | ''
  disabled?: boolean
  error?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number | '']
}>()

const timeOptions = computed(() => [
  { value: 5, label: '5 minutos' },
  { value: 10, label: '10 minutos' },
  { value: 15, label: '15 minutos' },
  { value: 20, label: '20 minutos' },
  { value: 25, label: '25 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 hora 30 minutos' },
  { value: 120, label: '2 horas' }
])

function selectOption(value: number) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="space-y-3">
    <!-- Quick Select Buttons -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in timeOptions"
        :key="option.value"
        type="button"
        @click="selectOption(option.value)"
        :disabled="disabled"
        class="px-3 py-1.5 text-xs font-medium rounded-lg border-2 
               transition-all duration-200
               disabled:opacity-50 disabled:cursor-not-allowed"
        :class="modelValue === option.value
          ? 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-200/50'
          : 'border-stone-200 bg-white text-stone-600 hover:border-amber-300 hover:bg-amber-50'"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Custom Input -->
    <div class="relative">
      <BaseInput
        :model-value="modelValue"
        type="number"
        placeholder="O ingresa minutos personalizados"
        :disabled="disabled"
        :error="!!error"
        :min="1"
        :max="600"
        :step="5"
        @update:model-value="emit('update:modelValue', $event as number | '')"
      />
      <div class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 pointer-events-none">
        min
      </div>
    </div>

    <!-- Preview -->
    <div v-if="modelValue && modelValue > 0" class="flex items-center gap-2 text-sm text-stone-600">
      <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        Duración: 
        <span class="font-semibold text-amber-600">{{ modelValue }} minuto{{ modelValue !== 1 ? 's' : '' }}</span>
      </span>
    </div>
  </div>
</template>
