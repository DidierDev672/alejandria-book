<script setup lang="ts">
defineProps<{
  zoom: number
  min: number
  max: number
}>()

defineEmits<{
  zoomIn: []
  zoomOut: []
}>()
</script>

<template>
  <div
    class="inline-flex items-center gap-1 rounded-xl border border-[#C4A35A]/60 bg-[#1C1408]/8 px-1 py-1"
    role="group"
    aria-label="Zoom de la cuadrícula"
  >
    <button
      type="button"
      class="h-8 w-8 rounded-lg text-[#3D2914] font-semibold hover:bg-[#1C1408]/10
             disabled:opacity-40
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A017]"
      :disabled="zoom <= min"
      aria-label="Alejar"
      @click="$emit('zoomOut')"
    >
      −
    </button>
    <span class="min-w-12 text-center text-xs font-semibold tabular-nums text-[#5C4033]">
      {{ Math.round(zoom * 100) }}%
    </span>
    <button
      type="button"
      class="h-8 w-8 rounded-lg text-[#3D2914] font-semibold hover:bg-[#1C1408]/10
             disabled:opacity-40
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A017]"
      :disabled="zoom >= max"
      aria-label="Acercar"
      @click="$emit('zoomIn')"
    >
      +
    </button>
  </div>
</template>
