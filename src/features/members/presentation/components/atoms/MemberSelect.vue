<script setup lang="ts">
interface Option {
  value: string
  label: string
}

interface Props {
  modelValue: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    :disabled="disabled"
    :class="[
      'w-full border rounded-lg px-3 py-2.5 text-sm text-stone-800 bg-white',
      'focus:outline-none focus:ring-2 transition-all duration-200',
      error
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-amber-300 focus:ring-amber-500 focus:border-amber-500',
      disabled && 'bg-stone-50 cursor-not-allowed opacity-70'
    ]"
  >
    <option value="" disabled>{{ placeholder || 'Seleccionar...' }}</option>
    <option 
      v-for="option in options" 
      :key="option.value" 
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>