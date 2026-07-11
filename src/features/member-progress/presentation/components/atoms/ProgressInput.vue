<script setup lang="ts">
interface Props { modelValue: string | number; type?: string; placeholder?: string; disabled?: boolean; error?: boolean; min?: string | number; max?: string | number; step?: string | number }
interface Emits { (e: 'update:modelValue', value: string | number): void }
defineProps<Props>()
defineEmits<Emits>()
</script>
<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :type="type || 'text'"
    :placeholder="placeholder"
    :disabled="disabled"
    :min="min"
    :max="max"
    :step="step"
    :class="[
      'w-full border rounded-lg px-3 py-2.5 text-sm text-stone-800 bg-white',
      'placeholder-stone-400 focus:outline-none focus:ring-2 transition-all duration-200',
      error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-amber-300 focus:ring-amber-500 focus:border-amber-500',
      disabled && 'bg-stone-50 cursor-not-allowed opacity-70'
    ]"
  />
</template>