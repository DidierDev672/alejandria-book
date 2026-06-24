<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useBookStore } from '../../../books/application/useBookStore';
import type { Book, CreateBookPayload } from '../../domain/BookEntity';
import { AxiosBookRepository } from '../../../books/infrastructure/repositories/AxiosBookRepository';
import axiosInstance from '../../../../infrastructure/http/axiosInstance';
import BaseModal from '../../../../utils/components/BaseModal.vue';
import ImageViewer from '../../../../utils/components/ImageViewer.vue';
import BaseInput from '../../../../utils/components/BaseInput.vue';


const bookStore = useBookStore();

const bookRepo = new AxiosBookRepository();

// // Sincronización nativa al montar el componente (SOLID-compliant)
onMounted(async () => {
  try {
    await bookStore.loadBooks();
  } catch {
    books.value = [];
  } finally {
    loading.value = false;
  }
});

const books = ref<Book[]>([])
const loading = ref(true)
const showModal = ref(false)
const editingId = ref<string | null>(null)
const showImageViewer = ref(false)
const viewerImages = ref<string[]>([])
const viewerIndex = ref(0)
const searchQuery = ref('')

const filteredBooks = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return bookStore.booksList
  return bookStore.booksList.filter(book =>
    book.title.toLowerCase().includes(q) ||
    book.author.toLowerCase().includes(q) ||
    book.genres.some(g => g.toLowerCase().includes(q))
  )
})

const form = reactive<CreateBookPayload>({
  title: '',
  description: '',
  author: '',
  genres: [],
  photos: [] as string[],
  publicationDate: '',
})

const genreInput = ref('')

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

function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    if (!form.photos) {
      form.photos = []
    }
    form.photos.push(reader.result as string)
  }
  reader.readAsDataURL(file)
    ; (event.target as HTMLInputElement).value = ''
}

function removePhoto(idx: number) {
  if (form.photos) {
    form.photos.splice(idx, 1)
  }
}

function openAdd() {
  editingId.value = null
  form.title = ''
  form.description = ''
  form.author = ''
  form.genres = []
  form.photos = []
  form.publicationDate = ''
  genreInput.value = ''
  showModal.value = true
}

function openEdit(book: Book) {
  editingId.value = book.ID || ''
  form.title = book.title
  form.description = book.description
  form.author = book.author
  form.genres = [...book.genres]
  form.photos = [...book.photos]
  form.publicationDate = book.publicationDate
  genreInput.value = ''
  showModal.value = true
}

function openImageViewer(images: string[], index: number) {
  viewerImages.value = images
  viewerIndex.value = index
  showImageViewer.value = true
}

async function save() {
  try {
    if (editingId.value) {
      const updated = await bookRepo.update(editingId.value, { ...form })
      const idx = books.value.findIndex(b => b.ID === editingId.value)
      if (idx !== -1) books.value[idx] = updated
    } else {
      const created = await bookRepo.save({ ...form } as any)
      books.value.unshift(created)
    }
    showModal.value = false
  } catch (err: any) {
    alert(err?.response?.data?.error || 'Error al guardar el libro')
  }
}

async function remove(id: string) {
  if (!confirm('¿Eliminar este libro?')) return
  try {
    await axiosInstance.delete(`/books/${id}`)
    books.value = books.value.filter(b => b.ID !== id)
  } catch (err: any) {
    alert(err?.response?.data?.error || 'Error al eliminar')
  }
}

const formatDate = (date: string | undefined): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  catch {
    return date;
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Loading State Mejorado -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="text-center">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 mb-4">
          <svg class="h-8 w-8 animate-spin text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <p class="text-gray-600 font-medium">Cargando tu biblioteca...</p>
        <p class="text-sm text-gray-400 mt-1">Preparando los libros para ti</p>
      </div>
    </div>

    <!-- Empty State Mejorado -->
    <template v-else-if="bookStore.booksList.length === 0">
      <div v-motion :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
        class="rounded-3xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50/50 to-orange-50/50 py-24 px-6 text-center">
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 mb-6">
          <svg class="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Biblioteca Vacía</h3>
        <p class="text-gray-600 mb-6 max-w-sm mx-auto">
          No hay libros registrados aún. ¡Comienza tu colección agregando tu primer libro!
        </p>
        <button type="button"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-amber-600/30"
          @click="$emit('create-new')">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar Primer Libro
        </button>
      </div>
    </template>

    <template v-else>
      <!-- Buscador -->
      <div class="w-full max-w-md">
        <BaseInput v-model="searchQuery" label="Buscar libro" type="search" placeholder="Título, autor o género..." />
      </div>

      <div v-if="filteredBooks.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-sm">No se encontraron libros con "{{ searchQuery }}"</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <transition-group name="grid-fade" tag="div" class="contents">
        <!-- Card de Libro -->
        <div v-for="(book, index) in filteredBooks" :key="book.ID" v-motion :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: index * 50, duration: 400 } }"
          class="group rounded-2xl border-2 border-amber-200/40 bg-white shadow-lg hover:shadow-2xl hover:border-amber-400/60 transition-all duration-300 overflow-hidden">
          <!-- Imagen/Portada con Overlay -->
          <div
            class="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-orange-100 aspect-[3/4] h-48 sm:h-56">
            <!-- Imagen -->
            <img v-if="book.photos[0]" :src="book.photos[0]" :alt="book.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

            <!-- Icono por defecto -->
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="h-16 w-16 text-amber-300/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>

            <!-- Overlay en Hover -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3">
              <div class="flex gap-2">
                <button type="button" v-if="book.photos.length"
                  class="p-2 rounded-full bg-white/90 hover:bg-white text-amber-700 transition-all duration-300 shadow-lg"
                  @click="openImageViewer(book.photos, 0)" title="Ver imagen">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
                <button type="button"
                  class="p-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white transition-all duration-300 shadow-lg"
                  @click="openEdit(book)" title="Editar">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Badge de géneros en esquina -->
            <div
              class="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-amber-200">
              <span class="text-xs font-bold text-amber-700">
                {{ book.genres.length }}
              </span>
            </div>
          </div>

          <!-- Contenido de la Card -->
          <div class="p-4 sm:p-5 space-y-3">
            <!-- Título -->
            <div>
              <h3
                class="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-amber-700 transition-colors">
                {{ book.title }}
              </h3>
              <p class="text-xs sm:text-sm text-gray-500 line-clamp-1 mt-1">
                {{ book.author }}
              </p>
            </div>

            <!-- Géneros como badges -->
            <div class="flex flex-wrap gap-1.5">
              <span v-for="(genre, i) in book.genres.slice(0, 2)" :key="`${book.ID}-${i}`"
                class="inline-flex items-center rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-amber-800 border border-amber-200/60">
                {{ genre }}
              </span>
              <span v-if="book.genres.length > 2"
                class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-gray-600 border border-gray-200/60">
                +{{ book.genres.length - 2 }}
              </span>
            </div>

            <!-- Info de fechas -->
            <div v-if="book.publicationDate || book.createdAt" class="text-[10px] text-gray-400 space-y-0.5">
              <p v-if="book.publicationDate" class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M5.757 4.071a.5.5 0 01 .07.707L3.07 7.464a.5.5 0 11-.707-.707l2.757-2.757a.5.5 0 01.707.07z"
                    clip-rule="evenodd" />
                </svg>
                Publicado: {{ formatDate(book.publicationDate) }}
              </p>
            </div>
          </div>

          <!-- Divider -->
          <div class="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>

          <!-- Botones de Acción -->
          <div class="px-4 sm:px-5 py-3 flex gap-2">
            <!-- Botón Editar -->
            <button type="button"
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 hover:border-amber-300 transition-all duration-300 active:scale-95"
              @click="openEdit(book)" title="Editar libro">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span class="hidden sm:inline">Editar</span>
            </button>

            <!-- Botón Eliminar -->
            <button type="button"
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 hover:border-red-300 transition-all duration-300 active:scale-95"
              @click="remove(book.ID || '')" title="Eliminar libro">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span class="hidden sm:inline">Eliminar</span>
            </button>
          </div>
        </div>
      </transition-group>
    </div>
    </template>
  </div>

  <!-- Modal para Agregar/Editar Libro -->
  <BaseModal :is-open="showModal" :max-with-class="'max-w-2xl'" @close="showModal = false">
    <template #header>
      <h3 class="text-lg font-serif font-bold text-[#111110]">
        {{ editingId ? 'Editar Libro' : 'Agregar Libro' }}
      </h3>
    </template>

    <template #content>
      <form @submit.prevent="save" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700">Título</label>
          <input v-model="form.title" type="text" required
            class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Título del libro" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea v-model="form.description" rows="3"
            class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Descripción del libro"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Autor</label>
          <input v-model="form.author" type="text" required
            class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Nombre del autor" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Géneros</label>
          <div class="mt-1 flex gap-2">
            <input v-model="genreInput" type="text" @keydown.enter.prevent="addGenre"
              class="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Agregar género" />
            <button type="button" @click="addGenre"
              class="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors">
              +
            </button>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <span v-for="(genre, i) in form.genres" :key="i"
              class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              {{ genre }}
              <button type="button" @click="removeGenre(i)" class="text-amber-600 hover:text-amber-800">&times;</button>
            </span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Fecha de publicación</label>
          <input v-model="form.publicationDate" type="date"
            class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Portada</label>
          <input type="file" accept="image/*" @change="onFileSelected"
            class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
          <div v-if="form.photos && form.photos.length" class="mt-2 flex flex-wrap gap-2">
            <div v-for="(photo, i) in form.photos" :key="i" class="relative">
              <img :src="photo" class="h-20 w-20 rounded-lg object-cover border border-amber-200" />
              <button type="button" @click="removePhoto(i)"
                class="absolute -top-2 -right-2 rounded-full bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs">&times;</button>
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <button type="button" @click="showModal = false"
        class="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-200">
        Cancelar
      </button>
      <button type="button" @click="save"
        class="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg shadow-amber-600/30">
        {{ editingId ? 'Actualizar' : 'Guardar' }}
      </button>
    </template>
  </BaseModal>

  <ImageViewer :is-open="showImageViewer" :images="viewerImages" :initial-index="viewerIndex"
    @close="showImageViewer = false" />
</template>

<style scoped>
/* Transiciones para Grid */
.grid-fade-enter-active,
.grid-fade-leave-active {
  transition: all 0.3s ease;
}

.grid-fade-enter-form {
  opacity: 0;
  transform: translateX(10px);
}

.grid-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.grid-fade-move {
  transition: transform 0.3s ease;
}

/* Aspect ratio para portada */
.aspect-\[3\/4\] {
  aspect-ratio: 3 / 4;
}

/* Line clamp */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>