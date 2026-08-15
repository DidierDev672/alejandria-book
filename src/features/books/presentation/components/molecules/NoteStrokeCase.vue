<script setup lang="ts">
import { ref } from 'vue'
import type { PencilColor } from '../../../domain/entities/DigitalBookPencil.types'
import {
  NOTE_STROKE_OPTIONS,
  type NoteStrokeSize,
} from '../../../domain/entities/DigitalBookNote.types'
import PencilPaletteGrid from './PencilPaletteGrid.vue'
import NoteStrokeSample from '../atoms/NoteStrokeSample.vue'

const size = defineModel<NoteStrokeSize>('size', { required: true })
const color = defineModel<PencilColor>('color', { required: true })

const paletteOpen = ref(false)

function selectStroke(next: NoteStrokeSize) {
  size.value = next
  paletteOpen.value = true
}

function selectColor(next: PencilColor) {
  color.value = next
  paletteOpen.value = false
}
</script>

<template>
  <div class="relative">
    <div
      class="rounded-2xl border border-[#C4A35A]/70 bg-[#F5E6A3]/50 p-2"
      role="group"
      aria-label="Estuche de trazos"
    >
      <p class="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#5C4033]">
        Estuche de trazos
      </p>
      <div class="flex flex-col gap-1">
        <NoteStrokeSample
          v-for="option in NOTE_STROKE_OPTIONS"
          :key="option.id"
          :size="option.id"
          :label="option.label"
          :width="option.width"
          :color="color"
          :selected="size === option.id"
          @select="selectStroke(option.id)"
        />
      </div>
    </div>

    <div
      v-if="paletteOpen"
      v-motion
      :initial="{ opacity: 0, x: -12 }"
      :enter="{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }"
      class="absolute left-full top-0 z-10 ml-2 w-56 rounded-2xl border border-[#C4A35A]
             bg-[#FDFEFA] px-3 py-3 shadow-xl shadow-[#1C1408]/20"
    >
      <p class="mb-2 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
        Paleta
      </p>
      <PencilPaletteGrid :selected="color" @select="selectColor" />
    </div>
  </div>
</template>
