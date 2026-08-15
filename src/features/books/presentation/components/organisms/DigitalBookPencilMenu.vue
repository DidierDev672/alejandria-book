<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  PENCIL_COLOR_NAMES,
  pencilOption,
  type PencilColor,
  type PencilKit,
  type PencilSize,
} from '../../../domain/entities/DigitalBookPencil.types'
import PencilPaletteGrid from '../molecules/PencilPaletteGrid.vue'
import PencilSizePicker from '../molecules/PencilSizePicker.vue'

const size = defineModel<PencilSize>('size', { required: true })
const colors = defineModel<PencilKit>('colors', { required: true })
const armed = defineModel<boolean>('armed', { default: false })

const paletteOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const activeColor = computed(() => colors.value[size.value])
const activeOption = computed(() => pencilOption(size.value))
const activeColorName = computed(() => PENCIL_COLOR_NAMES[activeColor.value])

function selectSize(next: PencilSize) {
  if (paletteOpen.value && size.value === next) {
    paletteOpen.value = false
    return
  }
  size.value = next
  paletteOpen.value = true
  armed.value = true
}

function selectColor(next: PencilColor) {
  colors.value = {
    ...colors.value,
    [size.value]: next,
  }
  armed.value = true
}

function closePalette() {
  paletteOpen.value = false
}

function onDocumentPointerDown(event: PointerEvent) {
  const el = rootRef.value
  if (!el || !paletteOpen.value) return
  if (!el.contains(event.target as Node)) {
    closePalette()
  }
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closePalette()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<template>
  <Teleport to="body">
    <aside
      ref="rootRef"
      v-motion
      :initial="{ opacity: 0, x: 24 }"
      :enter="{ opacity: 1, x: 0, transition: { duration: 0.4 } }"
      class="fixed right-0 top-1/2 z-40 -translate-y-1/2 overflow-visible
             rounded-l-2xl border border-r-0 border-amber-200
             bg-amber-100/95 backdrop-blur-sm
             px-2.5 py-3 shadow-xl shadow-amber-900/15"
      role="toolbar"
      aria-label="Estuche de lápices"
      :aria-expanded="paletteOpen"
    >
      <p class="mb-2 text-center font-serif text-sm font-semibold text-stone-800">
        Estuche
      </p>

      <PencilSizePicker
        :selected="armed ? size : null"
        :colors="colors"
        @select="selectSize"
      />

      <div
        class="absolute right-full top-1/2 mr-3 w-56 -translate-y-1/2"
      >
        <div
          v-if="paletteOpen"
          v-motion
          :initial="{ opacity: 0, x: 36 }"
          :enter="{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } }"
          :leave="{ opacity: 0, x: 24, transition: { duration: 0.2 } }"
          class="rounded-2xl border border-amber-200 bg-[#FDFEFA]
                 px-3 py-3 shadow-xl shadow-amber-900/15"
        >
          <div class="mb-2.5 flex items-baseline justify-between gap-2">
            <p class="text-xs font-medium uppercase tracking-widest text-stone-400">
              Paleta
            </p>
            <p class="text-[10px] font-semibold text-amber-800 text-right leading-tight">
              {{ activeOption.label }} · {{ activeColorName }}
            </p>
          </div>
          <PencilPaletteGrid
            :selected="activeColor"
            @select="selectColor"
          />
        </div>
      </div>
    </aside>
  </Teleport>
</template>
