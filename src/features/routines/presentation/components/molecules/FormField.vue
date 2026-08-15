<script setup lang="ts">
// ============================================================
// MOLECULE - Form Field Component (Label + Input + Error)
// ============================================================

import BaseInput from '../atoms/BaseInput.vue'
import BaseTextArea from '../atoms/BaseTextArea.vue'

interface Props {
  label: string
  modelValue: string | number
  type?: 'text' | 'number' | 'email' | 'tel' | 'textarea'
  placeholder?: string
  disabled?: boolean
  error?: string[]
  required?: boolean
  hint?: string
  min?: number
  max?: number
  step?: number
  rows?: number
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  required: false,
  hint: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <div class="space-y-2">
    <!-- Label -->
    <label class="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
      <span v-if="hint" class="text-xs font-normal text-stone-400 ml-1">({{ hint }})</span>
    </label>

    <!-- Input -->
    <BaseTextArea
      v-if="type === 'textarea'"
      :model-value="modelValue as string"
      :placeholder="placeholder"
      :disabled="disabled"
      :error="!!error"
      :rows="rows"
      :max-length="maxLength"
      @update:model-value="emit('update:modelValue', $event)"
    />
    
    <BaseInput
      v-else
      :model-value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :error="!!error"
      :min="min"
      :max="max"
      :step="step"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <!-- Error Message -->
    <div v-if="error && error.length > 0" class="flex items-center gap-1.5 text-red-600 text-xs">
      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error[0] }}</span>
    </div>
  </div>
</template>
