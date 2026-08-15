<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { PencilColor } from '../../../domain/entities/DigitalBookPencil.types'
import {
  NOTE_MAX_ZOOM,
  NOTE_MIN_ZOOM,
  NOTE_ZOOM_STEP,
  createEmptyHighlightNote,
  createNoteCard,
  type HighlightNote,
  type NoteFontId,
  type NoteStrokeSize,
} from '../../../domain/entities/DigitalBookNote.types'
import ModalBackdrop from '../atoms/ModalBackdrop.vue'
import NoteCloseButton from '../atoms/NoteCloseButton.vue'
import NoteFabButton from '../atoms/NoteFabButton.vue'
import NoteZoomControls from '../atoms/NoteZoomControls.vue'
import NoteCardMenu from '../molecules/NoteCardMenu.vue'
import NoteFontMenu from '../molecules/NoteFontMenu.vue'
import NoteGridBoard from '../molecules/NoteGridBoard.vue'
import NoteStrokeCase from '../molecules/NoteStrokeCase.vue'
import NoteSquarePickerModal from './NoteSquarePickerModal.vue'

const props = defineProps<{
  visible: boolean
  quotedText: string
  highlightId: string
  initialNote: HighlightNote | null
}>()

const emit = defineEmits<{
  close: []
  save: [note: HighlightNote]
  clear: []
}>()

const draft = ref<HighlightNote>(createEmptyHighlightNote('', ''))
const gridRef = ref<{ focusBoard: () => void } | null>(null)
const pickerOpen = ref(false)

watch(
  () => [props.visible, props.highlightId, props.initialNote] as const,
  () => {
    if (!props.visible) return
    pickerOpen.value = false
    draft.value = props.initialNote
      ? {
          ...props.initialNote,
          cards: props.initialNote.cards.map((card) => ({ ...card })),
        }
      : createEmptyHighlightNote(props.highlightId, props.quotedText)
  },
  { immediate: true },
)

const stroke = computed({
  get: () => draft.value.stroke,
  set: (value: NoteStrokeSize) => {
    draft.value = { ...draft.value, stroke: value }
  },
})

const color = computed({
  get: () => activeCard.value?.color ?? '#382E27',
  set: (value: PencilColor) => {
    const id = draft.value.activeCardId
    if (!id) return
    draft.value = {
      ...draft.value,
      cards: draft.value.cards.map((card) =>
        card.id === id ? { ...card, color: value } : card,
      ),
    }
  },
})

const font = computed({
  get: () => draft.value.font,
  set: (value: NoteFontId) => {
    draft.value = { ...draft.value, font: value }
  },
})

const activeCard = computed(
  () => draft.value.cards.find((card) => card.id === draft.value.activeCardId) ?? null,
)

const activeContent = computed({
  get: () => activeCard.value?.content ?? '',
  set: (value: string) => {
    const id = draft.value.activeCardId
    if (!id) return
    draft.value = {
      ...draft.value,
      cards: draft.value.cards.map((card) =>
        card.id === id ? { ...card, content: value } : card,
      ),
    }
  },
})

function zoomIn() {
  draft.value = {
    ...draft.value,
    zoom: Math.min(NOTE_MAX_ZOOM, Number((draft.value.zoom + NOTE_ZOOM_STEP).toFixed(2))),
  }
}

function zoomOut() {
  draft.value = {
    ...draft.value,
    zoom: Math.max(NOTE_MIN_ZOOM, Number((draft.value.zoom - NOTE_ZOOM_STEP).toFixed(2))),
  }
}

function openNotePicker() {
  pickerOpen.value = true
}

function addNoteFromSquare(squareColor: PencilColor) {
  const card = createNoteCard(squareColor)
  draft.value = {
    ...draft.value,
    cards: [...draft.value.cards, card],
    activeCardId: card.id,
  }
  pickerOpen.value = false
  void nextTick(() => gridRef.value?.focusBoard())
}

function selectCard(id: string) {
  draft.value = { ...draft.value, activeCardId: id }
  void nextTick(() => gridRef.value?.focusBoard())
}

function clearContent() {
  const id = draft.value.activeCardId
  if (!id) {
    emit('clear')
    return
  }
  draft.value = {
    ...draft.value,
    cards: draft.value.cards.map((card) =>
      card.id === id ? { ...card, content: '' } : card,
    ),
  }
  emit('clear')
}

function saveNote() {
  emit('save', {
    ...draft.value,
    highlightId: props.highlightId,
    quotedText: props.quotedText,
  })
}
</script>

<template>
  <ModalBackdrop :visible="visible" :dismissible="true" @close="emit('close')">
    <div
      v-if="visible"
      v-motion
      :initial="{ opacity: 0, scale: 0.92, y: 18 }"
      :enter="{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 280, damping: 20 },
      }"
      class="relative flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-2xl
             border border-[#C4A35A] shadow-2xl shadow-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="highlight-note-title"
      @click.stop
    >
      <header
        class="flex items-center justify-between gap-3 px-5 py-3
               bg-[#1C1408] border-b border-[#C4A35A]/40"
      >
        <div>
          <h2 id="highlight-note-title" class="font-serif text-xl font-semibold text-[#F5E6A3]">
            Notas para el subrayado
          </h2>
          <p v-if="quotedText" class="mt-0.5 max-w-xl truncate text-xs text-[#E8C547]/80">
            “{{ quotedText }}”
          </p>
        </div>
        <NoteCloseButton @close="emit('close')" />
      </header>

      <div class="relative flex min-h-0 flex-1 flex-col gap-3 overflow-visible bg-[#e8c547] p-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <NoteFontMenu v-model="font" />
          <NoteZoomControls
            :zoom="draft.zoom"
            :min="NOTE_MIN_ZOOM"
            :max="NOTE_MAX_ZOOM"
            @zoom-in="zoomIn"
            @zoom-out="zoomOut"
          />
        </div>

        <NoteCardMenu
          :cards="draft.cards"
          :active-id="draft.activeCardId"
          @select="selectCard"
        />

        <div class="flex min-h-0 flex-1 gap-3">
          <NoteStrokeCase v-model:size="stroke" v-model:color="color" />
          <div class="relative min-w-0 flex-1">
            <NoteGridBoard
              ref="gridRef"
              v-model="activeContent"
              :card="activeCard"
              :font="draft.font"
              :stroke="draft.stroke"
              :zoom="draft.zoom"
            />
            <div class="pointer-events-none absolute bottom-4 right-4">
              <div class="pointer-events-auto">
                <NoteFabButton @create="openNotePicker" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer
        class="flex flex-wrap items-center justify-end gap-3 px-5 py-3
               bg-[#1C1408] border-t border-[#C4A35A]/40"
      >
        <button
          type="button"
          class="inline-flex items-center rounded-lg border border-[#C4A35A] text-[#F5E6A3]
                 text-sm font-medium px-4 py-2 hover:bg-white/10 transition-colors"
          @click="clearContent"
        >
          Borrar contenido
        </button>
        <button
          type="button"
          class="inline-flex items-center rounded-lg bg-amber-600 hover:bg-amber-700
                 text-white text-sm font-medium px-4 py-2 shadow-sm transition-colors"
          @click="saveNote"
        >
          Guardar la nota
        </button>
      </footer>

      <NoteSquarePickerModal
        :visible="pickerOpen"
        @close="pickerOpen = false"
        @select="addNoteFromSquare"
      />
    </div>
  </ModalBackdrop>
</template>
