<script setup lang="ts">
/**
 * AuthorsPage — Página de gestión de autores.
 *
 * Arquitectura:
 *   Vertical Slicing  → Domain / Infrastructure / Presentation
 *   Onion Architecture → Domain (centro) → Infrastructure → Presentation (borde)
 *   Atomic Design      → Atoms (inputs, badges, buttons) → Molecules (AuthorCard, AuthorForm)
 *                       → Organisms (AuthorGrid, AuthorModal) → Page (AuthorsPage)
 *   SOLID              → SRP: cada función/composable tiene una única responsabilidad
 *                       → DIP: AuthorApi se inyecta como dependencia
 *                       → OCP: composables reutilizables sin modificar la page
 */
import { computed, onMounted, ref } from 'vue'
import { useAuthorForm } from '../composables/useAuthorForm'
import { useAuthorCrud } from '../composables/useAuthorCrud'
import AuthorModal from '../components/AuthorModal.vue'
import type { Author } from '../../domain/AuthorEntity'

// ─── Estado de la page ───────────────────────────────────────────────
const searchQuery = ref('')
const showCreateModal = ref(false)
const editingAuthor = ref<Author | null>(null)

// ─── Estado del modal de confirmación de eliminación ─────────────────
const showConfirmModal = ref(false)
const authorToDelete = ref<Author | null>(null)
const confirmInput = ref('')
const deletingInProgress = ref(false)

// ─── Estado del modal de éxito ───────────────────────────────────────
const showSuccessModal = ref(false)
const deletedAuthorName = ref('')

// ─── Estado del modal de error ───────────────────────────────────────
const showErrorModal = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')

// ─── Composables (SRP + DIP) ─────────────────────────────────────────
const { authors, loading, deleting, fetchAuthors, removeAuthor } = useAuthorCrud()
const {
  form,
  genreInput,
  submitting,
  apiError,
  canSubmit,
  addGenre,
  removeGenre,
  resetForm,
  populateForm,
  saveAuthor,
} = useAuthorForm()

// ─── Filtrado reactivo ────────────────────────────────────────────────
const filteredAuthors = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return authors.value
  return authors.value.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q) ||
      a.genres.some((g) => g.toLowerCase().includes(q)),
  )
})

// ─── Contadores para el header ────────────────────────────────────────
const totalAuthors = computed(() => authors.value.length)
const totalCountries = computed(() => new Set(authors.value.map((a) => a.country)).size)
const totalGenres = computed(() => new Set(authors.value.flatMap((a) => a.genres)).size)

// ─── Handlers ─────────────────────────────────────────────────────────
function openAdd() {
  editingAuthor.value = null
  resetForm()
  showCreateModal.value = true
}

function openEdit(author: Author) {
  editingAuthor.value = author
  populateForm(author)
  showCreateModal.value = true
}

async function handleSave() {
  const result = await saveAuthor(editingAuthor.value?.id)
  if (result) {
    if (editingAuthor.value) {
      const idx = authors.value.findIndex((a) => a.id === editingAuthor.value!.id)
      if (idx !== -1) authors.value[idx] = result
    } else {
      authors.value.unshift(result)
    }
    showCreateModal.value = false
    editingAuthor.value = null
  }
}

async function handleDelete(id: string) {
  const author = authors.value.find((a) => a.id === id)
  if (!author) return
  authorToDelete.value = author
  confirmInput.value = ''
  showConfirmModal.value = true
}

async function confirmDelete() {
  if (!authorToDelete.value || deletingInProgress.value) return
  deletingInProgress.value = true
  try {
    const success = await removeAuthor(authorToDelete.value.id)
    if (success) {
      deletedAuthorName.value = authorToDelete.value.name
      showConfirmModal.value = false
      authorToDelete.value = null
      confirmInput.value = ''
      showSuccessModal.value = true
      setTimeout(() => {
        showSuccessModal.value = false
        deletedAuthorName.value = ''
      }, 3500)
    } else {
      errorMessage.value = 'No se pudo eliminar el autor'
      errorDetails.value = 'El servidor no confirmó la eliminación. Verifica tu conexión e intenta de nuevo.'
      showConfirmModal.value = false
      showErrorModal.value = true
    }
  } catch (err: any) {
    const status = err?.response?.status
    const serverMsg = err?.response?.data?.error
    if (status === 404) {
      errorMessage.value = 'Autor no encontrado'
      errorDetails.value = 'Es posible que este autor ya haya sido eliminado por otro usuario. Actualiza la página para ver los cambios.'
    } else if (status === 409) {
      errorMessage.value = 'No se puede eliminar'
      errorDetails.value = 'Este autor tiene libros asociados. Desasocia los libros antes de eliminar al autor.'
    } else if (status === 401 || status === 403) {
      errorMessage.value = 'Sin permisos'
      errorDetails.value = 'No tienes autorización para eliminar autores. Contacta al administrador.'
    } else if (status === 500) {
      errorMessage.value = 'Error del servidor'
      errorDetails.value = 'Ocurrió un error interno. Intenta nuevamente en unos segundos.'
    } else if (!navigator.onLine) {
      errorMessage.value = 'Sin conexión'
      errorDetails.value = 'No se detectó conexión a internet. Verifica tu red e intenta de nuevo.'
    } else {
      errorMessage.value = 'Error inesperado'
      errorDetails.value = serverMsg || err?.message || 'Ocurrió un error desconocido. Intenta de nuevo.'
    }
    showConfirmModal.value = false
    showErrorModal.value = true
  }
  deletingInProgress.value = false
}

function cancelDelete() {
  showConfirmModal.value = false
  authorToDelete.value = null
  confirmInput.value = ''
}

function handleCloseModal() {
  showCreateModal.value = false
  editingAuthor.value = null
}

// ─── Lifecycle ────────────────────────────────────────────────────────
onMounted(() => fetchAuthors())
</script>

<template>
  <!-- ═══ PAGE SHELL ═══ -->
  <div class="min-h-full space-y-6">

    <!-- ═══ HEADER ═══ -->
    <header
      v-motion
      :initial="{ opacity: 0, y: -20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 500, ease: [0.16, 1, 0.3, 1] } }"
      class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 shadow-lg shadow-amber-500/20 sm:p-8"
    >
      <!-- Patrón decorativo SVG de fondo -->
      <div class="pointer-events-none absolute inset-0 opacity-10">
        <svg class="h-full w-full" viewBox="0 0 600 200" preserveAspectRatio="none">
          <defs>
            <pattern id="header-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect x="10" y="10" width="14" height="50" fill="white" opacity="0.4" rx="2" />
              <rect x="32" y="10" width="14" height="56" fill="white" opacity="0.25" rx="2" />
              <rect x="54" y="10" width="14" height="44" fill="white" opacity="0.35" rx="2" />
            </pattern>
          </defs>
          <rect width="600" height="200" fill="url(#header-pattern)" />
        </svg>
      </div>

      <!-- Círculos decorativos decorativos -->
      <div class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div class="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10" />

      <!-- Contenido -->
      <div class="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <!-- Título + estadísticas -->
        <div>
          <h1
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 100, duration: 500 } }"
            class="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Autores
          </h1>
          <p
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 200, duration: 500 } }"
            class="mt-1 text-sm text-white/80"
          >
            Gestiona los autores registrados en la biblioteca.
          </p>

          <!-- Badges de resumen -->
          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-motion
              :initial="{ opacity: 0, scale: 0.8 }"
              :enter="{ opacity: 1, scale: 1, transition: { delay: 300, duration: 400 } }"
              class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ totalAuthors }} autores
            </span>
            <span
              v-motion
              :initial="{ opacity: 0, scale: 0.8 }"
              :enter="{ opacity: 1, scale: 1, transition: { delay: 400, duration: 400 } }"
              class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ totalCountries }} países
            </span>
            <span
              v-motion
              :initial="{ opacity: 0, scale: 0.8 }"
              :enter="{ opacity: 1, scale: 1, transition: { delay: 500, duration: 400 } }"
              class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {{ totalGenres }} géneros
            </span>
          </div>
        </div>

        <!-- Botón crear -->
        <button
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{ opacity: 1, scale: 1, transition: { delay: 300, duration: 400 } }"
          type="button"
          class="flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-amber-700 shadow-lg shadow-black/10 transition hover:bg-amber-50 active:scale-95"
          @click="openAdd"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Añadir autor
        </button>
      </div>
    </header>

    <!-- ═══ SEARCH BAR ═══ -->
    <section
      v-if="!loading && authors.length > 0"
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 100, duration: 400 } }"
    >
      <div class="relative max-w-md">
        <svg
          class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Buscar por nombre, país o género..."
          class="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          @click="searchQuery = ''"
        >
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </section>

    <!-- ═══ LOADING STATE ═══ -->
    <main v-if="loading" class="flex items-center justify-center py-24">
      <div class="text-center">
        <div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
          <svg class="h-8 w-8 animate-spin text-amber-600" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <p class="font-medium text-gray-600">Cargando autores...</p>
        <p class="mt-1 text-sm text-gray-400">Preparando el catálogo</p>
      </div>
    </main>

    <!-- ═══ EMPTY STATE ═══ -->
    <section
      v-else-if="authors.length === 0"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
      class="rounded-3xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50/50 to-orange-50/50 py-24 text-center"
    >
      <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
        <svg class="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h3 class="mb-2 text-xl font-bold text-gray-900">Sin Autores</h3>
      <p class="mx-auto mb-6 max-w-sm text-gray-600">
        No hay autores registrados aún. ¡Añade tu primer autor para comenzar!
      </p>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 font-bold text-white shadow-lg shadow-amber-600/30 transition-all duration-300 hover:from-amber-700 hover:to-orange-700 active:scale-95"
        @click="openAdd"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Añadir Primer Autor
      </button>
    </section>

    <!-- ═══ SEARCH NO RESULTS ═══ -->
    <section
      v-else-if="filteredAuthors.length === 0"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { duration: 300 } }"
      class="py-12 text-center"
    >
      <svg class="mx-auto mb-3 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p class="text-sm text-gray-500">No se encontraron autores con "{{ searchQuery }}"</p>
    </section>

    <!-- ═══ AUTHORS GRID ═══ -->
    <section v-else>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <article
          v-for="(author, index) in filteredAuthors"
          :key="author.id"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: index * 50, duration: 400 } }"
          :hover="{ x: -6, transition: { duration: 250, ease: [0.16, 1, 0.3, 1] } }"
          class="group relative flex flex-col rounded-2xl border border-amber-200/50 bg-white p-5 shadow-sm transition-shadow duration-300 hover:border-amber-300/60 hover:shadow-xl hover:shadow-amber-500/10"
        >
          <!-- ── Avatar (Atom) ── -->
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 ring-4 ring-white transition-all duration-300 group-hover:scale-110 group-hover:ring-amber-100">
            <span class="text-xl font-bold text-amber-600">
              {{ author.name.charAt(0).toUpperCase() }}
            </span>
          </div>

          <!-- ── Nombre (Atom) ── -->
          <h3 class="truncate text-center text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
            {{ author.name }}
          </h3>

          <!-- ── País (Atom) ── -->
          <div class="mt-1 flex items-center justify-center gap-1 text-xs text-gray-500">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ author.country }}
          </div>

          <!-- ── Géneros (Molecule: badges) ── -->
          <div class="mt-3 flex flex-1 flex-wrap justify-center gap-1">
            <span
              v-for="g in author.genres.slice(0, 3)"
              :key="g"
              class="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 transition-colors group-hover:bg-amber-200/70"
            >
              {{ g }}
            </span>
            <span
              v-if="author.genres.length > 3"
              class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500"
            >
              +{{ author.genres.length - 3 }}
            </span>
          </div>

          <!-- ── Fecha de nacimiento (Atom) ── -->
          <div class="mt-2 text-center text-[10px] text-gray-400">
            <svg class="mr-1 inline h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ author.birthDay }}
          </div>

          <!-- ── Divider decorativo ── -->
          <div class="mt-4 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

          <!-- ── Acciones (Molecule: botones con gradiente) ── -->
          <div class="mt-3 flex gap-2">
            <!-- Editar: gradiente amarillo cromático -->
            <button
              type="button"
              class="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-2.5 text-xs font-bold text-white shadow-sm shadow-amber-400/30 transition-all duration-200 hover:from-amber-500 hover:to-yellow-600 hover:shadow-md hover:shadow-amber-400/40 active:scale-95"
              @click="openEdit(author)"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <!-- Eliminar: gradiente rojo y naranja cromático -->
            <button
              type="button"
              :disabled="deleting === author.id"
              class="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95"
              :class="
                deleting === author.id
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm shadow-red-400/30 hover:from-red-600 hover:to-orange-600 hover:shadow-md hover:shadow-red-400/40'
              "
              @click="handleDelete(author.id)"
            >
              <svg v-if="deleting === author.id" class="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <svg v-else class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {{ deleting === author.id ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- ═══ AUTHOR MODAL (Organism) ═══ -->
    <AuthorModal
      :is-open="showCreateModal"
      :editing="!!editingAuthor"
      :form="form"
      :genre-input="genreInput"
      :submitting="submitting"
      :api-error="apiError"
      :can-submit="canSubmit"
      @close="handleCloseModal"
      @save="handleSave"
      @update:genre-input="(v: string) => (genreInput = v)"
      @add-genre="addGenre"
      @remove-genre="removeGenre"
    />

    <!-- ═══ MODAL CONFIRMACIÓN ELIMINAR ═══ -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showConfirmModal"
          class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <!-- Overlay -->
          <div
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { duration: 250 } }"
            :leave="{ opacity: 0, transition: { duration: 200 } }"
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            @click="cancelDelete"
          />

          <!-- Card del modal -->
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.9, y: 20 }"
            :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 350, ease: [0.16, 1, 0.3, 1] } }"
            :leave="{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 200 } }"
            class="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <!-- Header rojo con icono de alerta -->
            <div class="relative bg-gradient-to-r from-red-500 to-orange-500 px-6 py-8 text-center">
              <!-- Patrón decorativo -->
              <div class="pointer-events-none absolute inset-0 opacity-10">
                <svg class="h-full w-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                  <defs>
                    <pattern id="warn-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="20" cy="20" r="8" fill="white" opacity="0.3" />
                    </pattern>
                  </defs>
                  <rect width="400" height="150" fill="url(#warn-pattern)" />
                </svg>
              </div>

              <!-- Icono de alerta animado -->
              <div
                v-motion
                :initial="{ scale: 0, rotate: -180 }"
                :enter="{ scale: 1, rotate: 0, transition: { delay: 150, duration: 500, type: 'spring', stiffness: 200 } }"
                class="relative z-10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
              >
                <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h3
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 400 } }"
                class="relative z-10 text-xl font-bold text-white"
              >
                Eliminar Autor
              </h3>
            </div>

            <!-- Contenido con advertencias psicológicas -->
            <div class="px-6 py-6">
              <!-- Nombre del autor a eliminar -->
              <div
                v-motion
                :initial="{ opacity: 0, x: -10 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: 250, duration: 400 } }"
                class="mb-5 flex items-center gap-3 rounded-xl bg-gray-50 p-4"
              >
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100">
                  <span class="text-sm font-bold text-red-600">{{ authorToDelete?.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">{{ authorToDelete?.name }}</p>
                  <p class="text-xs text-gray-500">{{ authorToDelete?.country }} · {{ authorToDelete?.genres.join(', ') }}</p>
                </div>
              </div>

              <!-- Advertencias psicológicas -->
              <div class="space-y-3">
                <div
                  v-motion
                  :initial="{ opacity: 0, x: -15 }"
                  :enter="{ opacity: 1, x: 0, transition: { delay: 300, duration: 400 } }"
                  class="flex gap-3 rounded-lg bg-red-50 p-3"
                >
                  <svg class="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <p class="text-xs leading-relaxed text-red-700">
                    <span class="font-bold">Pérdida irreversible:</span> Todos los libros asociados a este autor perderán su referencia. Esta acción no se puede deshacer.
                  </p>
                </div>

                <div
                  v-motion
                  :initial="{ opacity: 0, x: -15 }"
                  :enter="{ opacity: 1, x: 0, transition: { delay: 400, duration: 400 } }"
                  class="flex gap-3 rounded-lg bg-orange-50 p-3"
                >
                  <svg class="h-5 w-5 shrink-0 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p class="text-xs leading-relaxed text-orange-700">
                    <span class="font-bold">Impacto en el catálogo:</span> {{ totalAuthors }} autores activos. Eliminar reduce la diversidad literaria de tu biblioteca.
                  </p>
                </div>

                <div
                  v-motion
                  :initial="{ opacity: 0, x: -15 }"
                  :enter="{ opacity: 1, x: 0, transition: { delay: 500, duration: 400 } }"
                  class="flex gap-3 rounded-lg bg-amber-50 p-3"
                >
                  <svg class="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-xs leading-relaxed text-amber-700">
                    <span class="font-bold">Considera alternativas:</span> Podrías editar los datos del autor en lugar de eliminarlo por completo.
                  </p>
                </div>
              </div>

              <!-- Input de confirmación -->
              <div
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 600, duration: 400 } }"
                class="mt-5"
              >
                <label class="mb-1.5 block text-xs font-semibold text-gray-600">
                  Escribe <span class="font-bold text-red-600">ELIMINAR</span> para confirmar:
                </label>
                <input
                  v-model="confirmInput"
                  type="text"
                  placeholder="ELIMINAR"
                  class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  @keydown.enter="confirmInput === 'ELIMINAR' && confirmDelete()"
                />
              </div>
            </div>

            <!-- Footer con botones -->
            <div class="flex gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                class="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-95"
                @click="cancelDelete"
              >
                Cancelar
              </button>
              <button
                type="button"
                :disabled="confirmInput !== 'ELIMINAR' || deletingInProgress"
                class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-red-400/30 transition-all duration-200 hover:from-red-600 hover:to-orange-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
                @click="confirmDelete"
              >
                <svg v-if="deletingInProgress" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {{ deletingInProgress ? 'Eliminando...' : 'Eliminar definitivamente' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ═══ MODAL ÉXITO ═══ -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showSuccessModal"
          class="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          <!-- Overlay -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <!-- Card de éxito -->
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.8, y: 30 }"
            :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 450, ease: [0.16, 1, 0.3, 1] } }"
            :leave="{ opacity: 0, scale: 0.8, y: 30, transition: { duration: 250 } }"
            class="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <!-- Header verde con check animado -->
            <div class="bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-10 text-center">
              <!-- Anillo de pulso -->
              <div
                v-motion
                :initial="{ scale: 0 }"
                :enter="{ scale: [0, 1.2, 1], transition: { delay: 100, duration: 600, ease: [0.16, 1, 0.3, 1] } }"
                class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
              >
                <svg
                  v-motion
                  :initial="{ pathLength: 0, opacity: 0 }"
                  :enter="{ pathLength: 1, opacity: 1, transition: { delay: 300, duration: 600 } }"
                  class="h-10 w-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 400, duration: 400 } }"
                class="text-xl font-bold text-white"
              >
                Autor Eliminado
              </h3>
            </div>

            <!-- Contenido -->
            <div class="px-6 py-6 text-center">
              <p
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 400 } }"
                class="text-sm text-gray-600"
              >
                <span class="font-bold text-gray-900">{{ deletedAuthorName }}</span>
                ha sido eliminado del catálogo de forma permanente.
              </p>

              <!-- Barra de progreso automática -->
              <div
                v-motion
                :initial="{ opacity: 0 }"
                :enter="{ opacity: 1, transition: { delay: 600, duration: 300 } }"
                class="mt-5"
              >
                <div class="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    v-motion
                    :initial="{ width: '100%' }"
                    :enter="{ width: '0%', transition: { delay: 700, duration: 3000, ease: 'linear' } }"
                    class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                  />
                </div>
                <p class="mt-2 text-[10px] text-gray-400">Este mensaje se cerrará automáticamente</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ═══ MODAL ERROR ═══ -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-250"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showErrorModal"
          class="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          <!-- Overlay -->
          <div
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { duration: 250 } }"
            :leave="{ opacity: 0, transition: { duration: 200 } }"
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            @click="showErrorModal = false"
          />

          <!-- Card del error -->
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.85, y: 25 }"
            :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 400, ease: [0.16, 1, 0.3, 1] } }"
            :leave="{ opacity: 0, scale: 0.85, y: 25, transition: { duration: 220 } }"
            class="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <!-- Header rojo-coral con icono de error -->
            <div class="relative bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 px-6 py-8 text-center">
              <!-- Ondas decorativas -->
              <div class="pointer-events-none absolute inset-0 opacity-10">
                <svg class="h-full w-full" viewBox="0 0 400 140" preserveAspectRatio="none">
                  <defs>
                    <pattern id="error-waves" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                      <circle cx="30" cy="30" r="12" fill="none" stroke="white" stroke-width="1.5" opacity="0.4" />
                      <circle cx="30" cy="30" r="6" fill="none" stroke="white" stroke-width="1" opacity="0.25" />
                    </pattern>
                  </defs>
                  <rect width="400" height="140" fill="url(#error-waves)" />
                </svg>
              </div>

              <!-- Icono de error con shake -->
              <div
                v-motion
                :initial="{ scale: 0, rotate: -90 }"
                :enter="{ scale: 1, rotate: 0, transition: { delay: 100, duration: 500, type: 'spring', stiffness: 180, damping: 12 } }"
                class="relative z-10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
              >
                <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>

              <h3
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 400 } }"
                class="relative z-10 text-xl font-bold text-white"
              >
                Error al Eliminar
              </h3>
            </div>

            <!-- Contenido del error -->
            <div class="px-6 py-6">
              <!-- Mensaje principal -->
              <div
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 250, duration: 400 } }"
                class="mb-4 text-center"
              >
                <p class="text-sm font-bold text-gray-900">{{ errorMessage }}</p>
              </div>

              <!-- Detalles del error -->
              <div
                v-motion
                :initial="{ opacity: 0, x: -10 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: 350, duration: 400 } }"
                class="rounded-xl bg-rose-50 p-4"
              >
                <div class="flex gap-3">
                  <svg class="h-5 w-5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-xs leading-relaxed text-rose-700">{{ errorDetails }}</p>
                </div>
              </div>

              <!-- Sugerencia de acción -->
              <div
                v-motion
                :initial="{ opacity: 0, x: -10 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: 450, duration: 400 } }"
                class="mt-3 flex gap-3 rounded-xl bg-amber-50 p-3"
              >
                <svg class="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p class="text-xs text-amber-700">
                  <span class="font-bold">Sugerencia:</span> Verifica tu conexión, revisa los permisos o contacta al administrador si el problema persiste.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-rose-400/30 transition-all duration-200 hover:from-rose-600 hover:to-orange-600 hover:shadow-md active:scale-95"
                @click="showErrorModal = false"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Intentar de nuevo
              </button>
              <button
                type="button"
                class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-95"
                @click="showErrorModal = false"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
