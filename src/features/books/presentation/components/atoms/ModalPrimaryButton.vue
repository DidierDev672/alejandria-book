<script setup lang="ts">
defineProps<{
  label?: string
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700
           text-white text-sm font-semibold px-6 py-2.5 rounded-xl
           shadow-sm transition-colors"
    @click="$emit('click')"
  >
    {{ label || 'Entendido' }}
  </button>
</template>
