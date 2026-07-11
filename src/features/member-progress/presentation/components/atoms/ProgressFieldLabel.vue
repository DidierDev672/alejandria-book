<script setup lang="ts">
interface Props { label: string; required?: boolean; description?: string }
defineProps<Props>()
</script>
<template>
  <div class="flex flex-col gap-1">
    <label class="text-sm font-medium text-stone-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <p v-if="description" class="text-xs text-stone-500 leading-relaxed">{{ description }}</p>
  </div>
</template>