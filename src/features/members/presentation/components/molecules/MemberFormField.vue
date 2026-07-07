<script setup lang="ts">
import { computed } from 'vue'
import MemberFieldLabel from '../atoms/MemberFieldLabel.vue'
import MemberInput from '../atoms/MemberInput.vue'
import MemberSelect from '../atoms/MemberSelect.vue'
import MemberTextarea from '../atoms/MemberTextarea.vue'

interface Option {
  value: string
  label: string
}

interface Props {
  label: string
  modelValue: string | number
  type?: 'text' | 'number' | 'email' | 'tel' | 'date' | 'select' | 'textarea'
  placeholder?: string
  required?: boolean
  description?: string
  disabled?: boolean
  errors?: string[]
  options?: Option[] // For select type
  min?: string | number
  max?: string | number
  step?: string | number
  rows?: number // For textarea type
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text'
})

defineEmits<Emits>()

const hasError = computed(() => props.errors && props.errors.length > 0)
</script>

<template>
  <div class="space-y-1.5">
    <MemberFieldLabel
      :label="label"
      :required="required"
      :description="description"
    />
    
    <!-- Text/Number/Email/Tel/Date Input -->
    <MemberInput
      v-if="type !== 'select' && type !== 'textarea'"
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
    
    <!-- Select Input -->
    <MemberSelect
      v-else-if="type === 'select'"
      :model-value="String(modelValue)"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="options || []"
      :placeholder="placeholder"
      :disabled="disabled"
      :error="hasError"
    />
    
    <!-- Textarea Input -->
    <MemberTextarea
      v-else-if="type === 'textarea'"
      :model-value="String(modelValue)"
      @update:model-value="$emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :disabled="disabled"
      :error="hasError"
      :rows="rows"
    />
    
    <!-- Error Messages -->
    <div v-if="hasError" class="space-y-1">
      <p 
        v-for="error in errors" 
        :key="error" 
        class="text-xs text-red-600 font-medium"
      >
        {{ error }}
      </p>
    </div>
  </div>
</template>