<script setup lang="ts">
// ============================================================
// ATOM - Member info display (name and phone)
// ============================================================

interface Props {
  name: string
  phone: string
}

const props = defineProps<Props>()

const formatPhone = (phone: string): string => {
  if (!phone) return 'Sin teléfono'
  return phone
}
</script>

<template>
  <div class="flex-1 min-w-0">
    <h4 class="text-sm font-semibold text-stone-800 truncate">
      {{ name }}
    </h4>
    <p class="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
      <svg class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
      {{ formatPhone(phone) }}
    </p>
  </div>
</template>
