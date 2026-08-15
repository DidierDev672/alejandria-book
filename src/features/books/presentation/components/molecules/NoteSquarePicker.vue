<script setup lang="ts">
import { PENCIL_PALETTE, type PencilColor } from '../../../domain/entities/DigitalBookPencil.types'
import NoteColorSquare from '../atoms/NoteColorSquare.vue'

defineProps<{
  selected?: PencilColor | null
}>()

defineEmits<{
  select: [color: PencilColor]
}>()
</script>

<template>
  <div
    class="grid grid-cols-6 gap-2 sm:grid-cols-8"
    role="group"
    aria-label="Cuadros de color para la nota"
  >
    <NoteColorSquare
      v-for="color in PENCIL_PALETTE"
      :key="color"
      :color="color"
      :selected="selected === color"
      @select="$emit('select', color)"
    />
  </div>
</template>
