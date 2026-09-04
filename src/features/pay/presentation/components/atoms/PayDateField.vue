<script setup lang="ts">
// ============================================================
// ATOM · PayDateField
// Campo de fecha con icono y error embebido.
// ============================================================

interface Props {
  id?: string
  label?: string
  error?: string
  disabled?: boolean
  max?: string
}

withDefaults(defineProps<Props>(), {
  id: undefined,
  label: 'Fecha del pago',
  error: '',
  disabled: false,
  max: undefined,
})

const modelValue = defineModel<string>({ default: '' })
</script>

<template>
  <div class="w-full">
    <label :for="id" class="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
      {{ label }}
    </label>

    <div class="relative">
      <svg
        class="pointer-events-none absolute inset-y-0 left-0 ml-4 flex h-full w-4 items-center text-stone-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 005.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
      <input
        :id="id"
        v-model="modelValue"
        type="date"
        :max="max"
        :disabled="disabled"
        class="w-full rounded-xl border-2 bg-stone-50/50 py-3.5 pr-4 pl-10 text-sm font-semibold text-stone-800 transition-all duration-300 hover:border-stone-300 focus:bg-white focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
        :class="
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/20'
        "
      />
    </div>

    <p v-if="error" class="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-600">
      <svg class="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ error }}</span>
    </p>
  </div>
</template>