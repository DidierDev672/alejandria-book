<script setup lang="ts">
// ============================================================
// MOLECULE - Form field: label + control (slot) + error + hint
// ============================================================

interface Props {
  label: string
  forId?: string
  required?: boolean
  optional?: boolean
  error?: string
  hint?: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="forId" class="text-sm font-medium text-stone-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
      <span v-else-if="optional" class="text-xs text-stone-400 font-normal ml-1">(opcional)</span>
    </label>

    <slot />

    <div v-if="error || hint" class="flex items-start justify-between gap-2">
      <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
      <p v-if="hint" class="text-xs text-stone-400 ml-auto">{{ hint }}</p>
    </div>
  </div>
</template>
