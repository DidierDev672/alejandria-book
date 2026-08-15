<script setup lang="ts">
import {
  PENCIL_PALETTE,
  type PencilColor,
} from '../../../domain/entities/DigitalBookPencil.types'
import PaletteSwatch from '../atoms/PaletteSwatch.vue'

defineProps<{
  selected: PencilColor
}>()

defineEmits<{
  select: [color: PencilColor]
}>()
</script>

<template>
  <div
    class="grid grid-cols-5 gap-1.5"
    role="group"
    aria-label="Paleta de colores"
  >
    <PaletteSwatch
      v-for="color in PENCIL_PALETTE"
      :key="color"
      :color="color"
      :selected="selected === color"
      @select="$emit('select', color)"
    />
  </div>
</template>
