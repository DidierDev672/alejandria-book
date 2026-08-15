<script setup lang="ts">
import { computed } from 'vue'
import {
  isLightPencilColor,
  PENCIL_COLOR_NAMES,
  type PencilColor,
} from '../../../domain/entities/DigitalBookPencil.types'

const props = defineProps<{
  color: PencilColor
  selected: boolean
}>()

defineEmits<{
  select: []
}>()

const name = computed(() => PENCIL_COLOR_NAMES[props.color])
</script>

<template>
  <button
    type="button"
    class="relative h-7 w-7 rounded-full transition-transform duration-150
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
           focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFBF5]
           hover:scale-110"
    :class="selected ? 'scale-110' : ''"
    :style="{ backgroundColor: color }"
    :aria-label="`${name} ${color}`"
    :aria-pressed="selected"
    @click="$emit('select')"
  >
    <span
      v-if="isLightPencilColor(color)"
      class="absolute inset-0 rounded-full border border-stone-300/90"
    />
    <span
      v-if="selected"
      class="absolute -inset-1 rounded-full border-2 border-amber-600 pointer-events-none"
    />
  </button>
</template>
