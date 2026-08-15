<script setup lang="ts">
/**
 * PAGE - Biblioteca digital
 * GET /digital-books · Vertical slice + Onion + Atomic Design
 */
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useDigitalBookListStore } from '../../application/useDigitalBookListStore'
import { DigitalBookSearch } from '../../domain/services/DigitalBookSearch'
import DigitalBookSearchField from '../components/molecules/DigitalBookSearchField.vue'

const DigitalBookCardList = defineAsyncComponent(
  () => import('../components/organisms/DigitalBookCardList.vue'),
)
const DigitalBookEmptyLibrary = defineAsyncComponent(
  () => import('../components/organisms/DigitalBookEmptyLibrary.vue'),
)

const router = useRouter()
const listStore = useDigitalBookListStore()
const { books, isLoading, kind, feedback, totalBooks } = storeToRefs(listStore)

const searchQuery = ref('')
const filteredBooks = computed(() =>
  DigitalBookSearch.filter(books.value, searchQuery.value),
)
const hasActiveSearch = computed(() => DigitalBookSearch.normalize(searchQuery.value).length > 0)
const visibleCount = computed(() => filteredBooks.value.length)

onMounted(() => {
  void listStore.fetchDigitalBooks()
})

function goToCreate() {
  void router.push({ name: 'create-book' })
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

    <div class="max-w-7xl mx-auto space-y-8">
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
            Biblioteca digital
          </h1>
          <p class="mt-1 text-sm text-orange-50/95 max-w-xl">
            Portadas, autores y géneros de tus libros en Alejandría.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 self-start
                 bg-white/95 hover:bg-white text-amber-800 text-sm font-semibold
                 px-4 py-2 rounded-lg shadow-sm transition-colors"
          @click="goToCreate"
        >
          Registrar libro
        </button>
      </header>

      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        <span class="ml-3 text-sm text-stone-500">Abriendo tu estantería…</span>
      </div>

      <div
        v-else-if="kind === 'error'"
        class="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3"
      >
        <svg class="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <div>
          <p class="font-serif text-lg font-semibold text-red-700">
            {{ feedback?.title ?? 'No pudimos abrir la biblioteca' }}
          </p>
          <p class="text-sm text-red-700 mt-1">
            {{ feedback?.message }}
          </p>
          <button
            type="button"
            class="mt-2 text-xs font-medium text-amber-700 hover:underline"
            @click="listStore.fetchDigitalBooks()"
          >
            Reintentar
          </button>
        </div>
      </div>

      <DigitalBookEmptyLibrary
        v-else-if="kind === 'empty'"
        :title="feedback?.title ?? 'Tu estantería todavía espera su primer libro'"
        :message="feedback?.message ?? 'Alejandría está lista. Registra tu primer libro cuando quieras.'"
        @register="goToCreate"
      />

      <section v-else-if="kind === 'ok'" class="space-y-4">
        <DigitalBookSearchField v-model="searchQuery" />

        <p class="text-sm font-medium text-stone-500">
          <template v-if="hasActiveSearch">
            {{ visibleCount }} de {{ totalBooks }}
            {{ totalBooks === 1 ? 'libro' : 'libros' }} coinciden con “{{ searchQuery.trim() }}”
          </template>
          <template v-else>
            {{ totalBooks }} {{ totalBooks === 1 ? 'libro' : 'libros' }} en la estantería
          </template>
        </p>

        <div
          v-if="hasActiveSearch && visibleCount === 0"
          class="flex flex-col items-center justify-center py-16 text-center px-6
                 rounded-xl border border-amber-200 bg-amber-100"
        >
          <h2 class="font-serif text-lg font-semibold text-stone-700 mb-1">
            Ningún libro coincide con esa búsqueda
          </h2>
          <p class="text-sm text-stone-500 max-w-md leading-relaxed">
            Prueba con otra parte del nombre, del autor o de un género. La coincidencia no tiene que ser exacta.
          </p>
        </div>

        <Suspense v-else>
          <DigitalBookCardList :books="filteredBooks" />
          <template #fallback>
            <p class="text-sm text-stone-500">Preparando las portadas…</p>
          </template>
        </Suspense>
      </section>
    </div>
  </div>
</template>
