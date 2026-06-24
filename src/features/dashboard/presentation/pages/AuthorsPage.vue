<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { Author, CreateAuthorPayload } from '../../domain/AuthorEntity'
import { AuthorApi } from '../../infrastructure/AuthorApi'

const api = new AuthorApi()

const authors = ref<Author[]>([])
const loading = ref(true)
const deleting = ref<string | null>(null)
const showModal = ref(false)
const editingId = ref<string | null>(null)

const form = reactive<CreateAuthorPayload>({
  name: '',
  country: '',
  genres: [],
  birthDay: '',
})

const genreInput = ref('')
const submitting = ref(false)
const apiError = ref('')

onMounted(async () => {
  try {
    authors.value = (await api.getAll()) ?? []
  } catch {
    authors.value = []
  } finally {
    loading.value = false
  }
})

function addGenre() {
  const val = genreInput.value.trim()
  if (val && !form.genres.includes(val)) {
    form.genres.push(val)
  }
  genreInput.value = ''
}

function removeGenre(idx: number) {
  form.genres.splice(idx, 1)
}

function openAdd() {
  editingId.value = null
  form.name = ''
  form.country = ''
  form.genres = []
  form.birthDay = ''
  genreInput.value = ''
  apiError.value = ''
  showModal.value = true
}

function openEdit(author: Author) {
  editingId.value = author.id
  form.name = author.name
  form.country = author.country
  form.genres = [...author.genres]
  form.birthDay = author.birthDay
  genreInput.value = ''
  apiError.value = ''
  showModal.value = true
}

async function save() {
  if (submitting.value) return
  submitting.value = true
  apiError.value = ''
  try {
    if (editingId.value) {
      const updated = await api.update(editingId.value, { ...form })
      const idx = authors.value.findIndex(a => a.id === editingId.value)
      if (idx !== -1) authors.value[idx] = updated
    } else {
      const created = await api.create({ ...form })
      authors.value.unshift(created)
    }
    showModal.value = false
  } catch (err: any) {
    apiError.value = err?.response?.data?.error || err.message || 'Error al guardar el autor'
  } finally {
    submitting.value = false
  }
}

async function remove(id: string) {
  if (deleting.value) return
  deleting.value = id
  try {
    await api.remove(id)
    authors.value = authors.value.filter(a => a.id !== id)
  } catch (err: any) {
    alert(err?.response?.data?.error || 'Error al eliminar el autor')
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Autores</h1>
        <p class="mt-1 text-sm text-gray-500">Gestiona los autores registrados en la biblioteca.</p>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-amber-700 hover:to-orange-700"
        @click="openAdd"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Añadir autor
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="h-8 w-8 animate-spin text-amber-600" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Empty -->
    <div
      v-else-if="authors.length === 0"
      class="rounded-2xl border border-dashed border-amber-200/60 py-20 text-center text-sm text-gray-400"
    >
      No hay autores registrados. ¡Añade tu primer autor!
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="author in authors"
        :key="author.id"
        class="group rounded-2xl border border-amber-200/50 bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <!-- Avatar -->
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
          <span class="text-xl font-bold text-amber-600">{{ author.name.charAt(0).toUpperCase() }}</span>
        </div>

        <h3 class="truncate text-center text-sm font-semibold text-gray-900">{{ author.name }}</h3>

        <div class="mt-1 flex items-center justify-center gap-1 text-xs text-gray-500">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ author.country }}
        </div>

        <div class="mt-3 flex flex-wrap justify-center gap-1">
          <span
            v-for="g in author.genres.slice(0, 3)"
            :key="g"
            class="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700"
          >
            {{ g }}
          </span>
          <span v-if="author.genres.length > 3" class="text-[10px] text-gray-400">+{{ author.genres.length - 3 }}</span>
        </div>

        <div class="mt-4 flex gap-1.5 border-t border-gray-100 pt-3">
          <button
            type="button"
            class="flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-amber-50 hover:text-amber-700"
            @click="openEdit(author)"
          >
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          <button
            type="button"
            :disabled="deleting === author.id"
            class="flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition"
            :class="deleting === author.id
              ? 'cursor-not-allowed text-gray-300'
              : 'text-gray-500 hover:bg-red-50 hover:text-red-600'"
            @click="remove(author.id)"
          >
            <svg v-if="deleting === author.id" class="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <svg v-else class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {{ deleting === author.id ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
        @click.self="showModal = false"
      >
        <div class="w-full max-w-lg rounded-2xl border border-amber-200/50 bg-white p-6 shadow-2xl">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="font-display text-lg font-bold text-gray-900">{{ editingId ? 'Editar autor' : 'Añadir autor' }}</h2>
            <button
              type="button"
              class="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              @click="showModal = false"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="save" class="space-y-4">
            <!-- Nombre -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Nombre *</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                placeholder="Nombre completo del autor"
              />
            </div>

            <!-- País -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">País *</label>
              <input
                v-model="form.country"
                type="text"
                required
                class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                placeholder="País de origen"
              />
            </div>

            <!-- Géneros -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Géneros literarios *</label>
              <div class="flex gap-2">
                <input
                  v-model="genreInput"
                  type="text"
                  class="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Ej: Realismo mágico"
                  @keydown.enter.prevent="addGenre"
                />
                <button
                  type="button"
                  class="rounded-xl bg-amber-100 px-3 text-sm font-medium text-amber-700 transition hover:bg-amber-200"
                  @click="addGenre"
                >
                  Añadir
                </button>
              </div>
              <div v-if="form.genres.length" class="mt-2 flex flex-wrap gap-1.5">
                <span
                  v-for="(g, i) in form.genres"
                  :key="i"
                  class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
                >
                  {{ g }}
                  <button type="button" class="text-amber-500 hover:text-amber-700" @click="removeGenre(i)">&times;</button>
                </span>
              </div>
            </div>

            <!-- Fecha de nacimiento -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Fecha de nacimiento *</label>
              <input
                v-model="form.birthDay"
                type="date"
                required
                class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <!-- Error del API -->
            <p v-if="apiError" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ apiError }}</p>

            <!-- Botones -->
            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                @click="showModal = false"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="submitting || !form.name.trim() || !form.country.trim() || form.genres.length === 0 || !form.birthDay.trim()"
                class="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-amber-700 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg v-if="submitting" class="mr-1.5 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ submitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Añadir autor' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>
