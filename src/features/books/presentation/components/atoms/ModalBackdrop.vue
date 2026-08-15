<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <slot />
    </div>
  </Teleport>
</template>
