<script setup lang="ts">
import { ref } from 'vue'
import {
  type NoteCard,
  type NoteFontId,
  type NoteStrokeSize,
} from '../../../domain/entities/DigitalBookNote.types'
import NoteWritingSheet from './NoteWritingSheet.vue'

defineProps<{
  card: NoteCard | null
  font: NoteFontId
  stroke: NoteStrokeSize
  zoom: number
}>()

const content = defineModel<string>({ required: true })
const sheetRef = ref<{ focusSheet: () => void } | null>(null)

function focusBoard() {
  sheetRef.value?.focusSheet()
}

defineExpose({ focusBoard })
</script>

<template>
  <div class="note-dune-board relative min-h-[22rem] overflow-auto rounded-xl">
    <div
      class="origin-top-left"
      :style="{
        transform: `scale(${zoom})`,
        width: `${100 / zoom}%`,
        minHeight: `${22 / zoom}rem`,
      }"
    >
      <div class="note-dune-grid flex min-h-[22rem] w-full items-start justify-center px-5 py-8">
        <NoteWritingSheet
          v-if="card"
          :key="card.id"
          ref="sheetRef"
          v-model="content"
          :color="card.color"
          :font="font"
          :stroke="stroke"
        />
        <p
          v-else
          class="self-center text-center text-sm text-[#1C1408]/45 max-w-xs"
        >
          Pulsa Crear nota y elige un cuadro. La nota se posará sobre la cuadrícula.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-dune-board {
  background-color: #e8c547;
  background-image: linear-gradient(180deg, #f3d76a 0%, #e8c547 46%, #d4a017 100%);
}

.note-dune-grid {
  min-height: 22rem;
  background-image:
    linear-gradient(rgba(28, 20, 8, 0.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(28, 20, 8, 0.18) 1px, transparent 1px);
  background-size: 28px 28px;
}
</style>
