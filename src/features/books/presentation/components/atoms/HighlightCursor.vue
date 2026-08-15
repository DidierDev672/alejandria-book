<script setup lang="ts">
import { computed } from 'vue'
import {
  isLightPencilColor,
  type PencilColor,
} from '../../../domain/entities/DigitalBookPencil.types'

const props = defineProps<{
  color: PencilColor
  diameter: number
  x: number
  y: number
  visible: boolean
  drawing: boolean
}>()

const fill = computed(() => {
  const alpha = props.drawing ? 0.55 : 0.38
  const hex = props.color.replace('#', '')
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
})

const rim = computed(() =>
  isLightPencilColor(props.color) ? '#78716C' : props.color,
)
</script>

<template>
  <Teleport to="body">
    <div
      v-show="visible"
      class="pointer-events-none fixed z-50 rounded-full"
      :style="{
        width: `${diameter}px`,
        height: `${diameter}px`,
        left: `${x}px`,
        top: `${y}px`,
        backgroundColor: fill,
        border: `2px solid ${rim}`,
        boxShadow: drawing
          ? `0 0 0 3px ${fill}`
          : '0 1px 4px rgba(28, 25, 23, 0.18)',
        transform: 'translate(-50%, -50%)',
      }"
      aria-hidden="true"
    />
  </Teleport>
</template>
