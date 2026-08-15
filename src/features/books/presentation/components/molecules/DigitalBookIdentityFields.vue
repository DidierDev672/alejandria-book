<script setup lang="ts">
const title = defineModel<string>('title', { required: true })
const author = defineModel<string>('author', { required: true })
const description = defineModel<string>('description', { required: true })
</script>

<template>
  <div class="space-y-6">
    <div>
      <label for="digital-book-title" class="block text-sm font-semibold text-stone-800 mb-2">
        Título <span class="text-rose-600">*</span>
      </label>
      <input
        id="digital-book-title"
        v-model="title"
        type="text"
        required
        placeholder="Ej: Dune"
        class="w-full px-4 py-3 rounded-xl border-2 border-amber-200 bg-[#FFFBF5]
               text-stone-900 placeholder:text-stone-400
               focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
      />
    </div>

    <div>
      <label for="digital-book-author" class="block text-sm font-semibold text-stone-800 mb-2">
        Autor <span class="text-rose-600">*</span>
      </label>
      <input
        id="digital-book-author"
        v-model="author"
        type="text"
        required
        placeholder="Ej: Frank Herbert"
        class="w-full px-4 py-3 rounded-xl border-2 border-amber-200 bg-[#FFFBF5]
               text-stone-900 placeholder:text-stone-400
               focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
      />
    </div>

    <div>
      <label for="digital-book-description" class="block text-sm font-semibold text-stone-800 mb-2">
        Descripción
      </label>
      <textarea
        id="digital-book-description"
        v-model="description"
        rows="4"
        maxlength="800"
        placeholder="Sinopsis breve del libro digital…"
        class="w-full px-4 py-3 rounded-xl border-2 border-amber-200 bg-[#FFFBF5]
               text-stone-900 placeholder:text-stone-400 resize-none
               focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
      />
      <p class="mt-1 text-xs text-stone-500">{{ description.length }}/800</p>
    </div>
  </div>
</template>
