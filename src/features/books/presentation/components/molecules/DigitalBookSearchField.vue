<script setup lang="ts">
const query = defineModel<string>({ default: '' })
</script>

<template>
  <div class="flex flex-col gap-1 max-w-md">
    <label for="digital-book-search" class="text-sm font-medium text-stone-700">
      Buscar en la estantería
    </label>
    <div class="relative">
      <svg
        class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
        />
      </svg>
      <input
        id="digital-book-search"
        v-model="query"
        type="search"
        placeholder="Nombre, autor o género…"
        class="w-full border border-amber-300 rounded-lg pl-10 pr-3 py-2 text-sm text-stone-800 bg-white
               placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
               transition"
      />
    </div>
  </div>
</template>
