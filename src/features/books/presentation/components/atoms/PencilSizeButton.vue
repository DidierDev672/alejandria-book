<script setup lang="ts">
import { computed } from 'vue'
import {
  isLightPencilColor,
  type PencilColor,
  type PencilSize,
} from '../../../domain/entities/DigitalBookPencil.types'

const props = defineProps<{
  size: PencilSize
  color: PencilColor
  label: string
  selected: boolean
}>()

defineEmits<{
  select: []
}>()

const leadWidth = computed(() => {
  const widths: Record<PencilSize, number> = {
    small: 3.2,
    medium: 6,
    large: 10,
    xlarge: 16,
  }
  return widths[props.size]
})

const circleSize = computed(() => {
  const sizes: Record<PencilSize, string> = {
    small: 'h-12 w-12',
    medium: 'h-14 w-14',
    large: 'h-16 w-16',
    xlarge: 'h-[4.5rem] w-[4.5rem]',
  }
  return sizes[props.size]
})

const pencilLength = computed(() => {
  const lengths: Record<PencilSize, string> = {
    small: 'w-10',
    medium: 'w-11',
    large: 'w-14',
    xlarge: 'w-16',
  }
  return lengths[props.size]
})

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '')
  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const circleStyle = computed(() => {
  const light = isLightPencilColor(props.color)
  const inner = hexToRgba(props.color, light ? 0.62 : 0.48)
  const outer = hexToRgba(props.color, light ? 0.16 : 0.1)
  const rim = hexToRgba(props.color, light ? 0.55 : 0.4)
  return {
    background: `radial-gradient(circle at 32% 28%, ${inner}, ${outer} 72%)`,
    boxShadow: `inset 0 1px 2px rgba(253, 254, 250, 0.45), 0 0 0 1px ${rim}`,
  }
})
</script>

<template>
  <button
    type="button"
    class="group flex items-center justify-center overflow-visible
           rounded-full p-0.5
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
           focus-visible:ring-offset-2 focus-visible:ring-offset-amber-100"
    :aria-label="label"
    :aria-pressed="selected"
    @click="$emit('select')"
  >
    <span
      class="relative flex items-center justify-center overflow-visible rounded-full"
      :class="[
        circleSize,
        selected ? 'ring-2 ring-amber-600 ring-offset-2 ring-offset-amber-100' : '',
      ]"
    >
      <span
        class="absolute inset-0 rounded-full"
        :style="circleStyle"
        aria-hidden="true"
      />
      <span
        v-motion
        class="relative z-10 flex items-center justify-center"
        :initial="{ x: 10, y: 0, opacity: 0.9 }"
        :enter="{ x: selected ? -8 : 4, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 18 } }"
        :hovered="{
          x: -28,
          y: 0,
          transition: { type: 'spring', stiffness: 340, damping: 16 },
        }"
      >
        <svg
          class="h-4 shrink-0 drop-shadow-sm"
          :class="pencilLength"
          viewBox="0 0 80 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            :d="`M 4 12 L 18 ${12 - leadWidth / 2} L 18 ${12 + leadWidth / 2} Z`"
            :fill="color"
          />
          <path d="M30 7 L18 12 L30 12 Z" fill="#C1AD99" />
          <path d="M30 17 L18 12 L30 12 Z" fill="#B6987C" />
          <rect x="30" y="7" width="38" height="10" rx="1" :fill="color" />
          <rect x="30" y="9.5" width="38" height="1.2" fill="#FDFEFA" opacity="0.28" />
          <rect x="67" y="6.5" width="3" height="11" fill="#CECECE" />
          <rect x="69.5" y="7" width="1" height="10" fill="#F4F4F4" />
          <rect x="71" y="7" width="7" height="10" rx="1.5" fill="#C1AD99" />
        </svg>
      </span>
    </span>
  </button>
</template>
