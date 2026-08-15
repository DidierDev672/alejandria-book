<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full
           text-xs font-semibold uppercase tracking-wide
           bg-amber-100 text-amber-800 border border-amber-200"
  >
    {{ label }}
  </span>
</template>
