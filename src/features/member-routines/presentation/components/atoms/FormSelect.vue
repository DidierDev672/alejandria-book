<script setup lang="ts">
// ============================================================
// ATOM - Select with design-system styling
// ============================================================

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue: string
  options: Option[]
  disabled?: boolean
  error?: boolean
  id?: string
}

defineProps<Props>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <select
    :id="id"
    :value="modelValue"
    :disabled="disabled"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    :class="[
      'w-full border rounded-lg px-3 py-2.5 text-sm text-stone-800 bg-white',
      'focus:outline-none focus:ring-2 transition-all duration-200',
      error
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-amber-300 focus:ring-amber-500 focus:border-amber-500',
      disabled && 'bg-stone-50 cursor-not-allowed opacity-70',
    ]"
  >
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>
