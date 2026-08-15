<script setup lang="ts">
import type { PencilColor } from '../../../domain/entities/DigitalBookPencil.types'
import NoteCloseButton from '../atoms/NoteCloseButton.vue'
import NoteSquarePicker from '../molecules/NoteSquarePicker.vue'

defineProps<{
  visible: boolean
}>()

defineEmits<{
  close: []
  select: [color: PencilColor]
}>()
</script>

<template>
  <div
    v-if="visible"
    class="absolute inset-0 z-30 flex items-center justify-center bg-[#1C1408]/55 p-4"
    @click.self="$emit('close')"
  >
    <div
      v-motion
      :initial="{ opacity: 0, scale: 0.92, y: 12 }"
      :enter="{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 320, damping: 22 },
      }"
      class="w-full max-w-lg rounded-2xl border border-[#C4A35A] bg-[#F5E6A3] p-4 shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-square-title"
      @click.stop
    >
      <div class="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 id="note-square-title" class="font-serif text-lg font-semibold text-[#1C1408]">
            Selecciona un cuadro
          </h3>
          <p class="mt-0.5 text-xs text-[#5C4033]">
            El cuadro se convierte en el contenedor de la nota sobre la cuadrícula.
          </p>
        </div>
        <NoteCloseButton tone="on-light" @close="$emit('close')" />
      </div>
      <NoteSquarePicker @select="$emit('select', $event)" />
    </div>
  </div>
</template>
