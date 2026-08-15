<script setup lang="ts">
defineProps<{
  title: string
  message: string
}>()

defineEmits<{
  register: []
}>()
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 16 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }"
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
      {{ title }}
    </h2>
    <p class="text-sm text-stone-500 max-w-md leading-relaxed">
      {{ message }}
    </p>
    <button
      type="button"
      class="mt-6 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700
             text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
      @click="$emit('register')"
    >
      Registrar un libro digital
    </button>
  </div>
</template>
