<script setup lang="ts">
defineProps<{
  name: string
  phone: string
}>()
</script>

<template>
  <div class="flex-1 min-w-0">
    <p class="font-medium text-stone-800 truncate">{{ name }}</p>
    <p class="text-sm text-stone-500 truncate">
      {{ phone || 'Sin teléfono' }}
    </p>
  </div>
</template>
