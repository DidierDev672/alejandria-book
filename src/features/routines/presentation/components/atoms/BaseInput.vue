<script setup lang="ts">
// ============================================================
// ATOM - Base Input Component
// ============================================================

interface Props {
  modelValue: string | number
  type?: 'text' | 'number' | 'email' | 'tel'
  placeholder?: string
  disabled?: boolean
  error?: boolean
  min?: number
  max?: number
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  error: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? (target.value === '' ? '' : Number(target.value)) : target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :min="min"
    :max="max"
    :step="step"
    @input="handleInput"
    class="w-full px-4 py-3 rounded-xl border-2 bg-white text-stone-800 font-medium
           transition-all duration-200 outline-none
           placeholder:text-stone-400
           disabled:bg-stone-100 disabled:cursor-not-allowed
           focus:ring-2 focus:ring-amber-500/20"
    :class="error 
      ? 'border-red-300 focus:border-red-500' 
      : 'border-stone-200 focus:border-amber-500 hover:border-amber-300'"
  />
</template>
