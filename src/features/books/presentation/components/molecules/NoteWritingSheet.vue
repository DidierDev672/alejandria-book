<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import {
  isLightPencilColor,
  type PencilColor,
} from '../../../domain/entities/DigitalBookPencil.types'
import {
  noteFontOption,
  noteStrokeOption,
  type NoteFontId,
  type NoteStrokeSize,
} from '../../../domain/entities/DigitalBookNote.types'

const props = defineProps<{
  color: PencilColor
  font: NoteFontId
  stroke: NoteStrokeSize
}>()

const content = defineModel<string>({ required: true })
const sheetRef = ref<HTMLElement | null>(null)

const ink = computed(() => (isLightPencilColor(props.color) ? '#1C1408' : '#FDFEFA'))

watch(
  () => content.value,
  async (value) => {
    await nextTick()
    const sheet = sheetRef.value
    if (!sheet) return
    if (sheet.innerText === value) return
    sheet.innerText = value
  },
)

onMounted(() => {
  if (sheetRef.value && content.value) {
    sheetRef.value.innerText = content.value
  }
})

function onInput(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLElement)) return
  content.value = target.innerText
}

function focusSheet() {
  sheetRef.value?.focus()
}

defineExpose({ focusSheet })
</script>

<template>
  <div
    class="mx-auto w-[min(100%,28rem)] min-h-[14rem] rounded-xl px-4 py-4 shadow-lg
           border border-[#1C1408]/15"
    :style="{ backgroundColor: color }"
  >
    <div
      ref="sheetRef"
      class="min-h-[12rem] w-full outline-none"
      contenteditable="true"
      role="textbox"
      aria-label="Escribir el contenido de la nota"
      spellcheck="true"
      :style="{
        color: ink,
        fontFamily: noteFontOption(font).family,
        fontSize: noteStrokeOption(stroke).fontSize,
        lineHeight: 1.7,
        caretColor: ink,
      }"
      @input="onInput"
    />
  </div>
</template>
