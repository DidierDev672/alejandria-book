<script setup lang="ts">
const model = defineModel<boolean>({ default: true })
</script>

<template>
  <button
    type="button"
    role="switch"
    class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
    :class="model ? 'bg-amber-600' : 'bg-stone-300'"
    :aria-checked="model"
    @click="model = !model"
  >
    <span
      class="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
      :class="model ? 'translate-x-6' : 'translate-x-1'"
    />
  </button>
</template>
