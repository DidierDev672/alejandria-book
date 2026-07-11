<script setup lang="ts">
import { computed } from 'vue'
import ProgressFieldLabel from '../atoms/ProgressFieldLabel.vue'
import ProgressInput from '../atoms/ProgressInput.vue'
import ProgressSelect from '../atoms/ProgressSelect.vue'
import ProgressTextarea from '../atoms/ProgressTextarea.vue'

interface Option { value: string; label: string }

interface Props {
  label: string
  modelValue: string | number
  type?: 'text' | 'number' | 'email' | 'tel' | 'date' | 'month' | 'select' | 'textarea'
  placeholder?: string
  required?: boolean
  description?: string
  disabled?: boolean
  errors?: string[]
  options?: Option[]
  min?: string | number
  max?: string | number
  step?: string | number
  rows?: number
}

interface Emits { (e: 'update:modelValue', value: string | number): void }

const props = withDefaults(defineProps<Props>(), { type: 'text' })
defineEmits<Emits>()
const hasError = computed(() => props.errors && props.errors.length > 0)
</script>
<template>
  <div class="space-y-1.5">
    <ProgressFieldLabel :label="label" :required="required" :description="description" />
    <ProgressInput
      v-if="type !== 'select' && type !== 'textarea' && type !== 'month'"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :error="hasError"
      :min="min"
      :max="max"
      :step="step"
    />
    <input
      v-else-if="type === 'month'"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      type="month"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full border rounded-lg px-3 py-2.5 text-sm text-stone-800 bg-white',
        'placeholder-stone-400 focus:outline-none focus:ring-2 transition-all duration-200',
        hasError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-amber-300 focus:ring-amber-500 focus:border-amber-500',
        disabled && 'bg-stone-50 cursor-not-allowed opacity-70'
      ]"
    />
    <ProgressSelect
      v-else-if="type === 'select'"
      :model-value="String(modelValue)"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="options || []"
      :placeholder="placeholder"
      :disabled="disabled"
      :error="hasError"
    />
    <ProgressTextarea
      v-else-if="type === 'textarea'"
      :model-value="String(modelValue)"
      @update:model-value="$emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :disabled="disabled"
      :error="hasError"
      :rows="rows"
    />
    <div v-if="hasError" class="space-y-1">
      <p v-for="error in errors" :key="error" class="text-xs text-red-600 font-medium">{{ error }}</p>
    </div>
  </div>
</template>