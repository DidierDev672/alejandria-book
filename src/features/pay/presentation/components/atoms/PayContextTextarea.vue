<script setup lang="ts">
// ============================================================
// ATOM · PayContextTextarea
// Área de texto para el contexto del pago.
// ============================================================

interface Props {
  id?: string
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  maxlength?: number
}

withDefaults(defineProps<Props>(), {
  id: undefined,
  label: 'Contexto del pago',
  placeholder: '¿A qué se debe este pago? Una nota corta, con calma.',
  error: '',
  disabled: false,
  maxlength: 250,
})

const modelValue = defineModel<string>({ default: '' })
</script>

<template>
  <div class="w-full">
    <label :for="id" class="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
      {{ label }}
    </label>

    <textarea
      :id="id"
      v-model="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      rows="4"
      class="w-full resize-none rounded-xl border-2 bg-stone-50/50 px-4 py-3.5 text-sm font-medium text-stone-800 transition-all duration-300 hover:border-stone-300 focus:bg-white focus:outline-none focus:ring-4 placeholder:text-stone-400 disabled:cursor-not-allowed disabled:opacity-60"
      :class="
        error
          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
          : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/20'
      "
    />

    <div class="mt-1 flex items-start justify-between gap-3">
      <p v-if="error" class="flex items-start gap-1.5 text-xs font-medium text-rose-600">
        <svg class="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <span>{{ error }}</span>
      </p>
      <span v-else class="ml-auto text-right text-xs text-stone-400">
        {{ modelValue.length }} / {{ maxlength }}
      </span>
    </div>
  </div>
</template>