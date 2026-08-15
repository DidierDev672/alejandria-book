<script setup lang="ts">
// ============================================================
// ATOM - Chromatic orange gradient badge (border-radius: 8px)
// ============================================================

defineProps<{
  label: string
  title?: string
}>()
</script>

<template>
  <span
    class="inline-flex items-center max-w-full px-2.5 py-1 text-xs font-semibold text-white
           shadow-sm shadow-orange-500/25 truncate"
    style="
      border-radius: 8px;
      background: linear-gradient(
        135deg,
        #fb923c 0%,
        #f97316 35%,
        #ea580c 70%,
        #c2410c 100%
      );
    "
    :title="title || label"
  >
    {{ label }}
  </span>
</template>
