<script setup lang="ts">
import type { PencilColor } from '../../../domain/entities/DigitalBookPencil.types'
import type { NoteStrokeSize } from '../../../domain/entities/DigitalBookNote.types'

defineProps<{
  size: NoteStrokeSize
  label: string
  width: number
  color: PencilColor
  selected: boolean
}>()

defineEmits<{
  select: []
}>()
</script>

<template>
  <button
    type="button"
    class="flex w-full flex-col items-stretch gap-1.5 rounded-xl px-2.5 py-2
           transition-colors
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A017]"
    :class="selected ? 'bg-[#1C1408]/10 ring-2 ring-[#D4A017]' : 'hover:bg-[#1C1408]/5'"
    :aria-label="label"
    :aria-pressed="selected"
    @click="$emit('select')"
  >
    <span class="text-[10px] font-semibold uppercase tracking-wide text-[#5C4033] text-left">
      {{ label }}
    </span>
    <svg class="h-5 w-full" viewBox="0 0 88 20" fill="none" aria-hidden="true">
      <path
        d="M4 14 C 22 4, 40 18, 56 8 S 78 6, 84 12"
        :stroke="color"
        :stroke-width="width"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>
