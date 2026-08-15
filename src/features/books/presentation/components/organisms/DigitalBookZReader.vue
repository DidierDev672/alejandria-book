<script setup lang="ts">
import { DigitalBookHighlighter } from '@/features/books/domain/services/DigitalBookHighlighter.ts'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  pencilCursorDiameter,
  type PencilColor,
  type PencilSize,
} from '../../../domain/entities/DigitalBookPencil.types'
import type { HighlightNote } from '../../../domain/entities/DigitalBookNote.types'
import type { BookLanguage } from '../../../domain/entities/DigitalBookTranslation.types'
import type { DigitalBookFeedbackCopy } from '../../../domain/services/DigitalBookFeedbackMessages'
import HighlightCursor from '../atoms/HighlightCursor.vue'
import HighlightNoteModal from './HighlightNoteModal.vue'

const props = defineProps<{
  contentHtml: string
  contentKind: 'idle' | 'loading' | 'ok' | 'error'
  contentFeedback: DigitalBookFeedbackCopy | null
  bookName: string
  activeLanguage: BookLanguage | null
  translating: boolean
  highlightEnabled: boolean
  highlightColor: PencilColor
  highlightSize: PencilSize
}>()

defineEmits<{
  back: []
  translate: [language: BookLanguage]
}>()

const contentRef = ref<HTMLElement | null>(null)
const cursorVisible = ref(false)
const drawing = ref(false)
const cursorX = ref(0)
const cursorY = ref(0)
const noteModalOpen = ref(false)
const noteHighlightId = ref('')
const noteQuotedText = ref('')
const notesById = ref<Record<string, HighlightNote>>({})

const cursorDiameter = computed(() => pencilCursorDiameter(props.highlightSize))
const activeNote = computed(() => notesById.value[noteHighlightId.value] ?? null)

function findHighlightMark(event: Event): HTMLElement | null {
  const target = event.target
  if (!(target instanceof Element)) return null
  const mark = target.closest('mark.pencil-highlight')
  return mark instanceof HTMLElement ? mark : null
}

function updateCursor(event: PointerEvent) {
  cursorX.value = event.clientX
  cursorY.value = event.clientY
}

function onPointerEnter(event: PointerEvent) {
  if (!props.highlightEnabled) return
  cursorVisible.value = true
  updateCursor(event)
}

function onPointerMove(event: PointerEvent) {
  if (!props.highlightEnabled) return
  cursorVisible.value = true
  updateCursor(event)
}

function onPointerLeave() {
  if (!drawing.value) cursorVisible.value = false
}

function onPointerDown(event: PointerEvent) {
  if (findHighlightMark(event)) return
  if (!props.highlightEnabled || event.button !== 0) return
  drawing.value = true
  updateCursor(event)
}

function onWindowPointerMove(event: PointerEvent) {
  if (!drawing.value) return
  updateCursor(event)
}

async function commitHighlight() {
  const root = contentRef.value
  if (!root || !props.highlightEnabled) return;


  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return;


  // Crear el highlight
  DigitalBookHighlighter.wrapSelection(root, props.highlightColor, props.highlightSize);

  // Limpiar seleccion despues del nextTick para asegurar que el DOM se actualizo.
  await nextTick();
  selection.removeAllRanges();
}

function onPointerUp() {
  if (!drawing.value) return
  commitHighlight()
  drawing.value = false
}

function onPointerCancel() {
  drawing.value = false
}

function openHighlightNotes(event: MouseEvent) {
  const mark = findHighlightMark(event)
  if (!mark) return
  event.preventDefault()
  event.stopPropagation()
  drawing.value = false
  cursorVisible.value = false
  if (!mark.dataset.highlightId) {
    mark.dataset.highlightId = `hl-${crypto.randomUUID()}`
  }
  noteHighlightId.value = mark.dataset.highlightId
  noteQuotedText.value = mark.textContent?.replace(/\s+/g, ' ').trim() ?? ''
  noteModalOpen.value = true
}

function closeHighlightNotes() {
  noteModalOpen.value = false
}

function saveHighlightNote(note: HighlightNote) {
  notesById.value = { ...notesById.value, [note.highlightId]: note }
  noteModalOpen.value = false
}

function clearHighlightNote() {
  const id = noteHighlightId.value
  if (!id) return
  const current = notesById.value[id]
  if (!current) return
  notesById.value = {
    ...notesById.value,
    [id]: {
      ...current,
      cards: current.cards.map((card) =>
        card.id === current.activeCardId ? { ...card, content: '' } : card,
      ),
    },
  }
}

onMounted(() => {
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerCancel)
  window.addEventListener('pointermove', onWindowPointerMove)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerCancel)
  window.removeEventListener('pointermove', onWindowPointerMove)
})
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <h2 class="font-serif text-2xl font-semibold text-stone-800">
        Contenido del libro
      </h2>
      <div class="flex flex-col items-stretch sm:items-end gap-2">
        <div class="flex justify-end gap-2">
          <button type="button" class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors" :class="activeLanguage === 'es'
            ? 'bg-amber-600 text-white shadow-sm'
            : 'border border-amber-600 text-amber-700 hover:bg-amber-50'
            " :disabled="translating || contentKind !== 'ok'" @click="$emit('translate', 'es')">
            Español
          </button>
          <button type="button" class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors" :class="activeLanguage === 'en'
            ? 'bg-amber-600 text-white shadow-sm'
            : 'border border-amber-600 text-amber-700 hover:bg-amber-50'
            " :disabled="translating || contentKind !== 'ok'" @click="$emit('translate', 'en')">
            Inglés
          </button>
        </div>
        <p class="text-xs font-medium uppercase tracking-widest text-stone-400 text-right">
          Lectura lineal · serif
        </p>
      </div>
    </div>

    <div v-if="contentKind === 'loading'"
      class="flex items-center justify-center py-16 rounded-xl border border-amber-200 bg-amber-100">
      <div class="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      <span class="ml-3 text-sm text-stone-500">Abriendo las páginas…</span>
    </div>

    <div v-else-if="contentKind === 'error'" v-motion :initial="{ opacity: 0, y: 12 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 0.35 } }" class="flex flex-col items-center justify-center py-16 text-center px-6
             rounded-xl border border-amber-200 bg-amber-100">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
        <svg class="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h3 class="font-serif text-lg font-semibold text-stone-700 mb-1 max-w-md">
        {{ contentFeedback?.title ?? 'Las páginas se quedaron a medias' }}
      </h3>
      <p class="text-sm text-stone-500 max-w-md leading-relaxed">
        {{ contentFeedback?.message }}
      </p>
    </div>

    <div v-else-if="contentKind === 'ok' && contentHtml"
      class="overflow-hidden rounded-2xl border border-amber-200 bg-[#FFF8EE] shadow-sm">
      <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-amber-200">
        <span class="text-sm font-medium text-stone-700 truncate">{{ bookName }}</span>
        <span class="shrink-0 text-xs font-medium uppercase tracking-widest text-stone-400">
          HTML
        </span>
      </div>

      <article ref="contentRef" data-digital-book-content class="digital-book-html relative text-stone-800"
        :class="{ 'is-highlighting': highlightEnabled }" :style="{ '--pencil-highlight': highlightColor }"
        :lang="activeLanguage === 'en' ? 'en' : 'es'" @pointerenter="onPointerEnter" @pointermove="onPointerMove"
        @pointerleave="onPointerLeave" @pointerdown="onPointerDown" @dblclick="openHighlightNotes" v-html="contentHtml" />

      <div class="flex items-center justify-between gap-3 px-4 py-3 border-t border-amber-200">
        <button type="button" class="text-sm font-medium text-amber-700 hover:underline" @click="$emit('back')">
          Volver a la estantería
        </button>
        <span class="text-xs text-stone-400">Izquierda a derecha · arriba abajo</span>
      </div>
    </div>
  </section>

  <HighlightCursor :color="highlightColor" :diameter="cursorDiameter" :x="cursorX" :y="cursorY"
    :visible="highlightEnabled && cursorVisible" :drawing="drawing" />

  <HighlightNoteModal
    :visible="noteModalOpen"
    :highlight-id="noteHighlightId"
    :quoted-text="noteQuotedText"
    :initial-note="activeNote"
    @close="closeHighlightNotes"
    @save="saveHighlightNote"
    @clear="clearHighlightNote"
  />
</template>

<style scoped>
.digital-book-html {
  font-family: Georgia, 'Playfair Display', 'Times New Roman', serif;
  font-size: 1.125rem;
  line-height: 1.9;
  max-width: 42rem;
  margin-inline: auto;
  padding-inline: 1.75rem;
  padding-block: 2.75rem;
  color: #1c1917;
  text-align: justify;
  text-justify: inter-word;
  hyphens: auto;
  -webkit-hyphens: auto;
  overflow-wrap: break-word;
}

@media (min-width: 640px) {
  .digital-book-html {
    font-size: 1.2rem;
    padding-inline: 3.25rem;
    padding-block: 3.5rem;
  }
}

.digital-book-html :deep(.book-page) {
  margin-bottom: 3.25rem;
  padding-bottom: 0.25rem;
}

.digital-book-html :deep(.book-page:last-child) {
  margin-bottom: 0;
}

.digital-book-html :deep(p) {
  margin: 0 0 1.35em;
}

.digital-book-html :deep(p:last-child) {
  margin-bottom: 0;
}

.digital-book-html :deep(h1),
.digital-book-html :deep(h2),
.digital-book-html :deep(h3) {
  font-family: 'Playfair Display', Georgia, serif;
  color: #1c1917;
  margin: 1.75rem 0 0.85rem;
  text-align: left;
  hyphens: none;
}

.digital-book-html :deep(h1:first-child),
.digital-book-html :deep(h2:first-child),
.digital-book-html :deep(h3:first-child) {
  margin-top: 0;
}

.digital-book-html :deep(a) {
  color: #b45309;
  text-decoration: underline;
}

.digital-book-html :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 2rem auto;
}

.digital-book-html.is-highlighting {
  cursor: none;
}

.digital-book-html.is-highlighting ::selection {
  background-color: color-mix(in srgb, var(--pencil-highlight) 48%, transparent);
  color: inherit;
}

.digital-book-html :deep(mark.pencil-highlight) {
  color: inherit;
  border-radius: 0.12em;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  background-color: color-mix(in srgb, var(--pencil-highlight) 42%, transparent);
  cursor: pointer;
}

.digital-book-html.is-highlighting :deep(mark.pencil-highlight) {
  cursor: pointer;
}

.digital-book-html :deep(mark.pencil-highlight[data-size='small']) {
  padding: 0;
  background-color: transparent;
  background-image: linear-gradient(transparent 68%,
      color-mix(in srgb, var(--pencil-highlight) 78%, transparent) 68%);
}

.digital-book-html :deep(mark.pencil-highlight[data-size='medium']) {
  padding: 0.04em 0.06em;
}

.digital-book-html :deep(mark.pencil-highlight[data-size='large']) {
  padding: 0.12em 0.08em;
  background-color: color-mix(in srgb, var(--pencil-highlight) 52%, transparent);
}

.digital-book-html :deep(mark.pencil-highlight[data-size='xlarge']) {
  padding: 0.2em 0.1em;
  background-color: color-mix(in srgb, var(--pencil-highlight) 62%, transparent);
}
</style>
