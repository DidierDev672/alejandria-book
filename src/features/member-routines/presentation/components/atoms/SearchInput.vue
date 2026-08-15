<script setup lang="ts">
// ============================================================
// ATOM - Search text input with design-system styling
// ============================================================

defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
    <input
      :value="modelValue"
      type="search"
      :placeholder="placeholder ?? 'Buscar rutinas...'"
      :disabled="disabled"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-amber-200/60 rounded-xl
             text-sm text-stone-700 placeholder-stone-400
             focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400
             focus:bg-white transition-all duration-200
             disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
</template>
