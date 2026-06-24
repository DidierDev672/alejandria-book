<script setup lang="ts">
import { computed, ref } from 'vue';
import { useBookStore } from '../../application/useBookStore';
import { BookFactory } from '../../domain/entities/Book';

const bookStore = useBookStore();
const form = ref({ ...BookFactory.createEmpty() });
const isSuccess = ref(false);



// Tipos
interface BookForm {
  title: string
  description: string
  author: string
  genres: string[]
  photos: string[]
  publicationDate: string
  createdAt: string
  updatedAt: string
}

// Campo temporal para agregar géneros
const newGenre = ref('')

// Computed para validación visual
const isFormValid = computed(() => {
  return form.value.title.trim() !== '' && form.value.author.trim() !== ''
})

const genresList = computed(() => form.value.genres)

const currentGenre = ref('');

// Agregar género
const addGenre = () => {
  const val = currentGenre.value.trim();
  if (val && !form.value.genres.includes(val)) {
    form.value.genres.push(val);
    currentGenre.value = '';
  }
}

// Eliminar género
const removeGenre = (index: number) => {
  form.value.genres.splice(index, 1)
}

// Referencia al input file
const photoInputRef = ref<HTMLInputElement | null>(null)

// Abrir selector de archivos del dispositivo
const openFileSelector = () => {
  photoInputRef.value?.click()
}

// Manejar selección de archivo del dispositivo
const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        form.value.photos.push(result)
      }
    }
    reader.readAsDataURL(file)
  }

  // Limpiar el input para permitir seleccionar el mismo archivo
  target.value = ''
}

// Cargar foto de ejemplo (fallback cuando no hay selección)
const handlePhotoUpload = () => {
  const mockPhotos = [
    `https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=600&fit=crop&random=${Date.now()}`,
  ]
  form.value.photos.push(...mockPhotos)
}

// Eliminar foto
const removePhoto = (index: number) => {
  form.value.photos.splice(index, 1)
}

const currentPhoto = ref('');



// Manejar envío del formulario
const handleSubmit = async () => {
  const success = await bookStore.registerBook(form.value);
  if (success) {
    isSuccess.value = true;
    form.value = BookFactory.createEmpty();
    setTimeout(() => {
      isSuccess.value = false;
    }, 5000);
  }
}

// Resetear formulario
const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    author: '',
    genres: [],
    photos: [],
    publicationDate: '',
  }
  newGenre.value = ''
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-amber-50 via-white-50 to-orange-50 to-stone-100 py-12 px-4 sm:px-6 lg:px-8">
    <!-- Decoracion de fondo animada -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full blur-3xl opacity-10"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full blur-3xl opacity-10"></div>
    </div>


    <div class="max-w-5xl mx-auto">
      <!-- Header Premium -->
      <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }" class="text-center mb-12">
        <div class="inline-flex items-center justify-center gap-3 mb-4">
          <div class="h-1 w-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
          <p class="text-xs font-bold uppercase tracking-widest text-amber-700">Nueva Historia</p>
          <div class="h-1 w-12 bg-gradient-to-l from-amber-400 to-orange-500 rounded-full"></div>
        </div>
        <h1 class="font-serif text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight mb-3">Nuevo Libro</h1>
        <p class="text-lg text-gray-600 font-light max-w-lg mx-auto leading-relaxed">
          Completa los detalles de tu próxima gran historia. Cada página cuenta una verdad.
        </p>
      </div>

      <!-- Card Principal del formulario -->
      <form v-motion :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0 }"
        class="bg-white rounded-3xl shadow-2xl border border-amber-100/60 overflow-hidden"
        @submit.prevent="handleSubmit">
        <!-- Header Card con Gradiente -->
        <div class="relative bg-gradient-to-r from-amber-600 to-orange-600 px-8 sm:px-10 py-10">
          <!-- Patron decorativo SVG -->
          <div class="absolute inset-0 opacity-10">
            <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <pattern id="books-design" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <rect x="10" y="10" width="15" height="50" fill="white" opacity="0.3" rx="2" />
                  <rect x="30" y="10" width="15" height="55" fill="white" opacity="0.2" rx="2" />
                  <rect x="50" y="10" width="15" height="45" fill="white" opacity="0.3" rx="2" />
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#books-design)" />
            </svg>
          </div>

          <div class="relative z-10">
            <p class="text-amber-100 text-xs font-bold uppercase tracking-widest mb-2">Formulario Completo</p>
            <h2 class="text-3xl font-serif text-white tracking-wide">Detalles del Libro</h2>
          </div>
        </div>

        <!-- Contenido del formulario -->
        <div class="px-8 sm:px-10 py-10 space-y-8">
          <!-- SECCION 1: Informacion Basica -->
          <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="space-y-6">
            <!--Campo: Título  -->
            <div class="group">
              <label for="title"
                class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-800 mb-3">
                <div class="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
                  <svg class="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Título
                <span class="text-rose-500">*</span>
              </label>
              <input id="title" v-model="form.title" type="text" required placeholder="Ej: Cien años de soledad"
                class="w-full px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 group-hover:border-amber-300" />
              <p class="text-xs text-gray-500 mt-2">El título es lo primero que verán los lectores</p>

            </div>

            <!-- Autor -->
            <div class="group">
              <label for="author"
                class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-800 mb-3">
                <div class="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
                  <svg class="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Autor
                <span class="text-rose-500">*</span>
              </label>
              <input id="author" v-model="form.author" type="text" required placeholder="Ej: Gabriel García Márquez"
                class="w-full px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 group-hover:border-amber-300" />
              <p class="text-xs text-gray-500 mt-2">Autor o autores de la obra</p>
            </div>
            <!-- Descripcion -->
            <div class="group">
              <label for="description"
                class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-800 mb-3">
                <div class="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
                  <svg class="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                Descripción
              </label>
              <textarea id="description" v-model="form.description" rows="5"
                placeholder="Describe la trama, los personajes principales y el mundo de tu historia..."
                class="w-full px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 resize-none group-hover:border-amber-300" />
              <p class="text-xs text-gray-500 mt-2">{{ form.description.length }}/500 caracteres</p>
            </div>
          </div>

          <!-- Divider -->
          <div class="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>

          <!-- SECCION 3: Generos -->
          <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="space-y-6">
            <label class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-800 mb-4">
              <div class="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
                <svg class="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              Géneros
            </label>
            <div class="flex gap-2 mb-4">
              <input v-model="currentGenre" type="text" placeholder="Ej: Fantasía, Romance, Thriller..."
                class="flex-1 px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300"
                @keydown.enter.prevent="addGenre" />
              <button type="button"
                class="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 active:scale-95 shadow-lg shadow-amber-600/30 flex items-center justify-center"
                @click="addGenre">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <!-- Lista de géneros -->
            <!-- Lista de géneros -->
            <transition-group v-if="genresList.length > 0" name="list-fade" tag="div" class="flex flex-wrap gap-2">
              <span v-for="(genre, index) in genresList" :key="`${genre}-${index}`" v-motion
                :initial="{ scale: 0, opacity: 0 }" :enter="{ scale: 1, opacity: 1 }"
                class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 rounded-full text-sm font-bold border-2 border-amber-200 hover:border-amber-400 transition-all duration-300">
                {{ genre }}
                <button type="button"
                  class="w-5 h-5 flex items-center justify-center rounded-full hover:bg-amber-200 transition-colors"
                  @click="removeGenre(index)">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd" />
                  </svg>
                </button>
              </span>
            </transition-group>
            <div v-else class="p-4 rounded-xl bg-amber-50 border-2 border-dashed border-amber-200 text-center">
              <p class="text-sm text-amber-700 font-medium">No hay géneros agregados aún. Agrega al menos uno.</p>
            </div>
          </div>

          <!-- Divider -->
          <div class="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
          <!-- SECCION 3: Fotos -->
          <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="group">
            <label class="block text-sm font-medium text-slate-700 mb-2 tracking-wide">
              Fotos / Portadas
            </label>

            <!-- Input file oculto -->
            <input
              ref="photoInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileSelected"
            />

            <!-- Botones de selección -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <!-- Botón principal: Seleccionar del dispositivo -->
              <button type="button"
                class="py-6 border-2 border-dashed border-amber-400 rounded-2xl text-amber-700 hover:border-amber-600 hover:text-amber-900 hover:bg-amber-50 transition-all duration-300 flex flex-col items-center justify-center gap-2 font-medium"
                @click="openFileSelector">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 13v8m-4-4l4-4 4 4" />
                </svg>
                <span class="text-sm font-semibold">Seleccionar del dispositivo</span>
                <span class="text-xs text-amber-500">JPG, PNG hasta 5MB</span>
              </button>

              <!-- Botón fallback: Foto de ejemplo -->
              <button type="button"
                class="py-6 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/30 transition-all duration-300 flex flex-col items-center justify-center gap-2 font-medium"
                @click="handlePhotoUpload">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-sm">Usar foto de ejemplo</span>
                <span class="text-xs text-gray-400">Desde Unsplash</span>
              </button>
            </div>
            <!-- Galería mejorada -->
            <transition-group v-if="form.photos.length > 0" name="gallery-fade" tag="div"
              class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              <div v-for="(photo, index) in form.photos" :key="`${photo}-${index}`" v-motion
                :initial="{ scale: 0, opacity: 0 }" :enter="{ scale: 1, opacity: 1 }"
                class="relative aspect-[3/4] rounded-2xl overflow-hidden group border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 shadow-lg hover:shadow-xl">
                <img :src="photo" :alt="`Foto ${index + 1}`" class="w-full h-full object-cover" />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3">
                  <button type="button"
                    class="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center font-bold text-lg transition-all duration-300"
                    @click="removePhoto(index)">
                    ×
                  </button>
                </div>
              </div>
            </transition-group>
          </div>
          <!-- Divider -->
          <div class="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
          <!-- SECCIÓN 4: Fechas -->
          <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="mb-6">
            <label for="publicationDate"
              class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-800 mb-3">
              <div class="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
                <svg class="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              Publicación
            </label>
            <input id="publicationDate" v-model="form.publicationDate" type="date"
              class="w-full px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 group-hover:border-amber-300" />
          </div>
        </div>



        <!-- Footer con Botones -->
        <div
          class="px-8 sm:px-10 py-8 border-t-2 border-amber-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50 flex flex-col sm:flex-row justify-end gap-4">
          <button v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" type="submit"
            :disabled="!isFormValid"
            class="flex-1 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-300 shadow-lg shadow-amber-600/30 hover:shadow-xl flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Guardar Libro
          </button>

          <button type="button" v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
            class="px-8 py-4 border-2 border-amber-300 text-amber-700 hover:text-amber-900 hover:bg-amber-100/50 font-bold rounded-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            @click="resetForm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar
          </button>
        </div>
      </form>

      <!-- Footer decorativo -->
      <div class="text-center mt-12">
        <p class="text-amber-700 text-xl font-serif italic">
          "Cada libro es un mundo por descubrir"
        </p>
        <div class="flex items-center justify-center gap-2 mt-4">
          <div class="h-1 w-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
          <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
          </svg>
          <div class="h-1 w-12 bg-gradient-to-l from-amber-400 to-orange-500 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Transiciones para géneros */
.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.3s ease;
}

.list-fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.list-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Transiciones para galería */
.gallery-fade-enter-active,
.gallery-fade-leave-active {
  transition: all 0.3s ease;
}

.gallery-fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.gallery-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Scroll personalizado */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(217, 119, 6, 0.05);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(217, 119, 6, 0.3);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(217, 119, 6, 0.5);
}
</style>
