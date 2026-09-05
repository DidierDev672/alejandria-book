<script setup lang="ts">
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
});
</script>

<template>
  <header
    v-motion
    :initial="{ opacity: 0, y: -16 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 500, ease: 'easeOut' } }"
    class="bg-header-gradient rounded-2xl px-8 py-7 text-stone-50 shadow-lg shadow-black/20"
  >
    <p
      v-if="eyebrow"
      class="text-xs font-semibold uppercase tracking-widest text-orange-100/80"
    >
      {{ eyebrow }}
    </p>

    <h1 class="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">
      {{ title }}
    </h1>

    <p v-if="description" class="mt-3 max-w-2xl text-sm text-orange-50/85 md:text-base">
      {{ description }}
    </p>

    <slot />
  </header>
</template>
