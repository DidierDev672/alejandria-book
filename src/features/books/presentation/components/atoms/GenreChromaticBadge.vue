<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <span
    class="inline-flex items-center px-3 py-1 rounded-full
           text-xs font-semibold uppercase tracking-wide text-white
           bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600
           shadow-sm shadow-orange-500/30"
  >
    {{ label }}
  </span>
</template>
