<script setup lang="ts">
import {
  PENCIL_SIZE_OPTIONS,
  type PencilKit,
  type PencilSize,
} from '../../../domain/entities/DigitalBookPencil.types'
import PencilSizeButton from '../atoms/PencilSizeButton.vue'

defineProps<{
  selected: PencilSize | null
  colors: PencilKit
}>()

defineEmits<{
  select: [size: PencilSize]
}>()
</script>

<template>
  <div
    class="flex flex-col items-center gap-2 overflow-visible"
    role="group"
    aria-label="Grosor del lápiz"
  >
    <PencilSizeButton
      v-for="option in PENCIL_SIZE_OPTIONS"
      :key="option.id"
      :size="option.id"
      :color="colors[option.id]"
      :label="option.label"
      :selected="selected === option.id"
      @select="$emit('select', option.id)"
    />
  </div>
</template>
