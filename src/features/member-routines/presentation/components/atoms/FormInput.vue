<script setup lang="ts">
// ============================================================
// ATOM - Text / Date input with design-system styling
// ============================================================

interface Props {
  modelValue: string
  type?: 'text' | 'date'
  placeholder?: string
  disabled?: boolean
  error?: boolean
  mono?: boolean
  maxlength?: number
  min?: string
  id?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
})

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <input
    :id="id"
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :maxlength="maxlength"
    :min="min"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :class="[
      'w-full border rounded-lg px-3 py-2.5 text-sm text-stone-800 bg-white',
      'placeholder-stone-400 focus:outline-none focus:ring-2 transition-all duration-200',
      mono && 'font-mono text-xs',
      error
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-amber-300 focus:ring-amber-500 focus:border-amber-500',
      disabled && 'bg-stone-50 cursor-not-allowed opacity-70',
    ]"
  />
</template>
