<script setup lang="ts">
/**
 * PAGE - Detalle de libro digital
 * GET /digital-books/{id} · Vertical slice + Onion + Atomic Design
 */
import { computed, defineAsyncComponent, onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useDigitalBookDetailStore } from '../../application/useDigitalBookDetailStore'
import { DigitalBookCoverResolver } from '../../domain/services/DigitalBookCoverResolver'
import GenreChromaticBadge from '../components/atoms/GenreChromaticBadge.vue'

const DigitalBookPhotoCarousel = defineAsyncComponent(
  () => import('../components/molecules/DigitalBookPhotoCarousel.vue'),
)
const DigitalBookZReader = defineAsyncComponent(
  () => import('../components/organisms/DigitalBookZReader.vue'),
)

const route = useRoute()
const router = useRouter()
const detailStore = useDigitalBookDetailStore()
const { book, isLoading, kind, feedback, pdfUrl, pdfKind, pdfFeedback } =
  storeToRefs(detailStore)

const photoSrcs = computed(() =>
  DigitalBookCoverResolver.fromPhotos(book.value?.photos ?? []),
)

const bookId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : Array.isArray(id) ? id[0] : ''
})

watch(
  bookId,
  (id) => {
    if (id) void detailStore.fetchDigitalBook(id)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  detailStore.reset()
})

function goToShelf() {
  void router.push({ name: 'digital-books' })
}
</script>

<template>
  <div class="min-h-screen bg-[#FFFBF5] px-4 sm:px-6 py-10">
    <div class="pointer-events-none fixed right-0 top-0 opacity-10 -z-10">
      <svg width="320" height="240" viewBox="0 0 320 240" fill="none">
        <circle cx="280" cy="-10" r="140" fill="#f59e0b" />
        <circle cx="230" cy="60" r="70" fill="#ea580c" />
      </svg>
    </div>

    <div class="max-w-4xl mx-auto space-y-8">
      <header
        v-motion
        :initial="{ opacity: 0, y: 24 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 0.45 } }"
        class="relative overflow-hidden rounded-3xl px-6 py-6
               bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600
               shadow-xl shadow-orange-500/25
               flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <h1 class="font-serif text-3xl sm:text-4xl font-bold text-white">
            Ficha del libro
          </h1>
          <p class="mt-1 text-sm text-orange-50/95 max-w-xl">
            Portadas, autor, géneros y lectura en patrón Z.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 self-start
                 bg-white/95 hover:bg-white text-amber-800 text-sm font-semibold
                 px-4 py-2 rounded-lg shadow-sm transition-colors"
          @click="goToShelf"
        >
          Volver a la estantería
        </button>
      </header>

      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        <span class="ml-3 text-sm text-stone-500">Trayendo la ficha…</span>
      </div>

      <div
        v-else-if="kind === 'error'"
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h2 class="font-serif text-lg font-semibold text-stone-700 mb-1 max-w-md">
          {{ feedback?.title ?? 'Este libro no se pudo abrir ahora' }}
        </h2>
        <p class="text-sm text-stone-500 max-w-md leading-relaxed">
          {{ feedback?.message }}
        </p>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700
                   text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            @click="detailStore.fetchDigitalBook(bookId)"
          >
            Intentar de nuevo
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 border border-amber-600 text-amber-700
                   hover:bg-amber-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            @click="goToShelf"
          >
            Volver a la estantería
          </button>
        </div>
      </div>

      <article v-else-if="kind === 'ok' && book" class="space-y-8">
        <Suspense>
          <DigitalBookPhotoCarousel :photos="photoSrcs" :book-name="book.name" />
          <template #fallback>
            <p class="text-sm text-stone-500 text-center">Preparando las imágenes…</p>
          </template>
        </Suspense>

        <div class="text-center space-y-2">
          <h2 class="font-serif text-3xl font-bold text-stone-900">
            {{ book.name }}
          </h2>
          <p class="text-base text-stone-500">{{ book.author }}</p>
        </div>

        <div v-if="book.genres.length" class="flex flex-wrap justify-center gap-2">
          <GenreChromaticBadge
            v-for="genre in book.genres"
            :key="genre"
            :label="genre"
          />
        </div>

        <Suspense>
          <DigitalBookZReader
            :pdf-url="pdfUrl"
            :pdf-kind="pdfKind"
            :pdf-feedback="pdfFeedback"
            :book-name="book.name"
            @back="goToShelf"
          />
          <template #fallback>
            <p class="text-sm text-stone-500">Preparando la lectura…</p>
          </template>
        </Suspense>
      </article>
    </div>
  </div>
</template>
