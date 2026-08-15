<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { DigitalBook } from '../../../domain/entities/DigitalBook.types'
import DigitalBookCard from '../molecules/DigitalBookCard.vue'

defineProps<{
  books: DigitalBook[]
}>()
</script>

<template>
  <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 list-none p-0 m-0">
    <li v-for="book in books" :key="book.id">
      <RouterLink
        :to="{ name: 'digital-book-detail', params: { id: book.id } }"
        class="block h-full rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <DigitalBookCard :book="book" />
      </RouterLink>
    </li>
  </ul>
</template>
