<script setup lang="ts">
// ============================================================
// ATOM - Typing indicator (el coach está pensando)
// ============================================================
</script>

<template>
  <span class="inline-flex items-center gap-1" role="status" aria-label="El coach está escribiendo">
    <span
      v-for="n in 3"
      :key="n"
      class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
      :style="{ animationDelay: `${(n - 1) * 0.15}s` }"
    />
  </span>
</template>
