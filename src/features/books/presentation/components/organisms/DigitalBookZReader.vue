<script setup lang="ts">
import type { DigitalBookFeedbackCopy } from '../../../domain/services/DigitalBookFeedbackMessages'

defineProps<{
  pdfUrl: string
  pdfKind: 'idle' | 'loading' | 'ok' | 'error'
  pdfFeedback: DigitalBookFeedbackCopy | null
  bookName: string
}>()

defineEmits<{
  back: []
}>()
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between gap-4">
      <h2 class="font-serif text-2xl font-semibold text-stone-800">
        Contenido del libro
      </h2>
      <p class="hidden sm:block text-xs font-medium uppercase tracking-widest text-stone-400">
        Lectura en patrón Z
      </p>
    </div>

    <div
      v-if="pdfKind === 'loading'"
      class="flex items-center justify-center py-16 rounded-xl border border-amber-200 bg-amber-100"
    >
      <div class="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      <span class="ml-3 text-sm text-stone-500">Abriendo las páginas…</span>
    </div>

    <div
      v-else-if="pdfKind === 'error'"
      v-motion
      :initial="{ opacity: 0, y: 12 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 0.35 } }"
      class="flex flex-col items-center justify-center py-16 text-center px-6
             rounded-xl border border-amber-200 bg-amber-100"
    >
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
        <svg class="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      </div>
      <h3 class="font-serif text-lg font-semibold text-stone-700 mb-1 max-w-md">
        {{ pdfFeedback?.title ?? 'Las páginas se quedaron a medias' }}
      </h3>
      <p class="text-sm text-stone-500 max-w-md leading-relaxed">
        {{ pdfFeedback?.message }}
      </p>
    </div>

    <div
      v-else-if="pdfKind === 'ok' && pdfUrl"
      class="overflow-hidden rounded-2xl border border-amber-200 bg-[#FFF8EE] shadow-sm"
    >
      <!-- Recorrido Z: título izq → acción der / páginas / volver izq → abrir der -->
      <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-amber-200">
        <span class="text-sm font-medium text-stone-700 truncate">{{ bookName }}</span>
        <a
          :href="pdfUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="shrink-0 text-sm font-medium text-amber-700 hover:underline"
        >
          Abrir en otra pestaña
        </a>
      </div>

      <div class="relative">
        <div
          class="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-10 -translate-x-1/2
                 bg-gradient-to-r from-stone-900/10 via-transparent to-stone-900/10"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px bg-amber-300/70"
          aria-hidden="true"
        />
        <iframe
          :src="pdfUrl"
          :title="`Lectura de ${bookName}`"
          class="block min-h-[70vh] w-full bg-[#FFFBF5]"
        />
      </div>

      <div class="flex items-center justify-between gap-3 px-4 py-3 border-t border-amber-200">
        <button
          type="button"
          class="text-sm font-medium text-amber-700 hover:underline"
          @click="$emit('back')"
        >
          Volver a la estantería
        </button>
        <span class="text-xs text-stone-400">Izquierda → derecha, como un libro abierto</span>
      </div>
    </div>
  </section>
</template>
