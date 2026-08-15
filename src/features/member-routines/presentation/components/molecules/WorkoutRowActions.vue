<script setup lang="ts">
// ============================================================
// MOLECULE - Row action buttons (view / edit / delete)
// ============================================================

import IconActionButton from '../atoms/IconActionButton.vue'

defineEmits<{
  (e: 'view'): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()
</script>

<template>
  <div class="inline-flex items-center justify-center gap-0.5" role="group" aria-label="Acciones">
    <IconActionButton variant="view" @click="$emit('view')" />
    <IconActionButton variant="edit" @click="$emit('edit')" />
    <IconActionButton variant="delete" @click="$emit('delete')" />
  </div>
</template>
