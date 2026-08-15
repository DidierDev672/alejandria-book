<script setup lang="ts">
// ============================================================
// ATOM - Icon action button (view / edit / delete)
// ============================================================

import { computed } from 'vue'

type ActionVariant = 'view' | 'edit' | 'delete'

const props = defineProps<{
  variant: ActionVariant
  title?: string
  disabled?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()

const labels: Record<ActionVariant, string> = {
  view: 'Ver detalle',
  edit: 'Editar',
  delete: 'Eliminar',
}

const ariaLabel = computed(() => props.title || labels[props.variant])

const variantClasses: Record<ActionVariant, string> = {
  view: 'text-amber-700 hover:bg-amber-100 hover:text-amber-800',
  edit: 'text-stone-600 hover:bg-stone-100 hover:text-stone-800',
  delete: 'text-red-600 hover:bg-red-50 hover:text-red-700',
}
</script>

<template>
  <button
    type="button"
    :title="ariaLabel"
    :aria-label="ariaLabel"
    :disabled="disabled"
    class="inline-flex items-center justify-center w-8 h-8 rounded-lg
           transition-colors duration-150
           disabled:opacity-40 disabled:cursor-not-allowed"
    :class="variantClasses[variant]"
    @click.stop="$emit('click')"
  >
    <!-- Eye -->
    <svg
      v-if="variant === 'view'"
      class="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>

    <!-- Pencil -->
    <svg
      v-else-if="variant === 'edit'"
      class="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>

    <!-- Trash -->
    <svg
      v-else
      class="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  </button>
</template>
