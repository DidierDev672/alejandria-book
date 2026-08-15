<script setup lang="ts">
import { computed } from 'vue'
import {
  isLightPencilColor,
  PENCIL_COLOR_NAMES,
  type PencilColor,
} from '../../../domain/entities/DigitalBookPencil.types'

const props = defineProps<{
  color: PencilColor
  selected?: boolean
  size?: 'sm' | 'md'
}>()

defineEmits<{
  select: []
}>()

const box = computed(() => (props.size === 'sm' ? 'h-8 w-8' : 'h-11 w-11'))
</script>

<template>
  <button
    type="button"
    class="relative shrink-0 rounded-lg border transition-transform duration-150
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A017]
           hover:scale-105"
    :class="[
      box,
      selected ? 'ring-2 ring-[#1C1408] ring-offset-2 ring-offset-[#F5E6A3] scale-105' : 'border-[#1C1408]/20',
    ]"
    :style="{ backgroundColor: color }"
    :aria-label="PENCIL_COLOR_NAMES[color]"
    :aria-pressed="selected"
    @click="$emit('select')"
  >
    <span
      v-if="isLightPencilColor(color)"
      class="absolute inset-0 rounded-lg border border-stone-400/70"
    />
  </button>
</template>
