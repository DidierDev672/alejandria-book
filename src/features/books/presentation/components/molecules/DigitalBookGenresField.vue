<script setup lang="ts">
import { ref } from 'vue'

const genres = defineModel<string[]>('genres', { required: true })
const draft = ref('')

function addGenre() {
  const value = draft.value.trim()
  if (!value || genres.value.includes(value)) return
  genres.value = [...genres.value, value]
  draft.value = ''
}

function removeGenre(index: number) {
  genres.value = genres.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div>
    <label class="block text-sm font-semibold text-stone-800 mb-2">Géneros</label>
    <div class="flex gap-2 mb-3">
      <input
        v-model="draft"
        type="text"
        placeholder="Ej: Ciencia ficción"
        class="flex-1 px-4 py-3 rounded-xl border-2 border-amber-200 bg-[#FFFBF5]
               text-stone-900 placeholder:text-stone-400
               focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        @keydown.enter.prevent="addGenre"
      />
      <button
        type="button"
        class="px-5 py-3 rounded-xl bg-amber-600 text-white font-semibold
               hover:bg-amber-700 transition-colors"
        @click="addGenre"
      >
        Añadir
      </button>
    </div>

    <div v-if="genres.length" class="flex flex-wrap gap-2">
      <span
        v-for="(genre, index) in genres"
        :key="`${genre}-${index}`"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
               bg-amber-100 text-amber-900 border border-amber-200"
      >
        {{ genre }}
        <button
          type="button"
          class="w-5 h-5 rounded-md hover:bg-amber-200 text-amber-800"
          @click="removeGenre(index)"
        >
          ×
        </button>
      </span>
    </div>
    <p v-else class="text-sm text-stone-500">Aún no hay géneros. Añade al menos uno.</p>
  </div>
</template>
