<script setup lang="ts">
// ============================================================
// ATOM - Base TextArea Component
// ============================================================

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  error?: boolean
  rows?: number
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  error: false,
  rows: 3,
  maxLength: 500
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="relative">
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :maxlength="maxLength"
      @input="handleInput"
      class="w-full px-4 py-3 rounded-xl border-2 bg-white text-stone-800 font-medium
             transition-all duration-200 outline-none resize-none
             placeholder:text-stone-400
             disabled:bg-stone-100 disabled:cursor-not-allowed
             focus:ring-2 focus:ring-amber-500/20"
      :class="error 
        ? 'border-red-300 focus:border-red-500' 
        : 'border-stone-200 focus:border-amber-500 hover:border-amber-300'"
    />
    <div v-if="maxLength" class="absolute bottom-2 right-3 text-xs text-stone-400">
      {{ modelValue.length }}/{{ maxLength }}
    </div>
  </div>
</template>
