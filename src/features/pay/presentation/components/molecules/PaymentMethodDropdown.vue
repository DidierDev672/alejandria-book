<script setup lang="ts">
// ============================================================
// MOLECULE · PaymentMethodDropdown
// Selector desplegable de método de pago.
// Presentación pura: recibe el valor y lo emite de vuelta.
// ============================================================

import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { PaymentDomainService, PAYMENT_METHODS } from '../../../domain/Pay'
import type { PaymentMethod } from '../../../domain/Pay'
import PayMethodIcon from '../atoms/PayMethodIcon.vue'

withDefaults(defineProps<{
  error?: string
  disabled?: boolean
}>(), {
  error: '',
  disabled: false,
})

const modelValue = defineModel<PaymentMethod | ''>({ default: '' })

const open = ref(false)
const root = ref<HTMLElement | null>(null)

onClickOutside(root, () => {
  open.value = false
})

function toggle(): void {
  open.value = !open.value
}

function pick(method: PaymentMethod): void {
  modelValue.value = method
  open.value = false
}
</script>

<template>
  <div ref="root" class="relative w-full">
    <label class="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
      Método de pago
    </label>

    <button
      type="button"
      :disabled="disabled"
      aria-haspopup="listbox"
      :aria-expanded="open"
      class="flex w-full items-center justify-between gap-3 rounded-xl border-2 bg-stone-50/50 px-4 py-3.5 text-sm font-semibold transition-all duration-300 hover:border-stone-300 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
      :class="
        error
          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
          : open
            ? 'border-amber-500 bg-white focus:ring-amber-500/20'
            : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/20'
      "
      @click="toggle"
    >
      <span v-if="modelValue" class="inline-flex items-center gap-2 text-stone-800">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <PayMethodIcon :method="modelValue" :size="18" />
        </span>
        {{ PaymentDomainService.methodLabel(modelValue) }}
      </span>
      <span v-else class="text-stone-400">Elige cómo se hace el pago</span>

      <svg
        class="h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <ul
        v-if="open"
        role="listbox"
        class="absolute top-full left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-amber-200 bg-white shadow-lg"
      >
        <li v-for="method in PAYMENT_METHODS" :key="method">
          <button
            type="button"
            role="option"
            :aria-selected="modelValue === method"
            class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-amber-50"
            :class="modelValue === method ? 'bg-amber-50/80' : ''"
            @click="pick(method)"
          >
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              :class="modelValue === method ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'"
            >
              <PayMethodIcon :method="method" :size="18" />
            </span>
            <span class="min-w-0">
              <span class="block text-sm font-bold text-stone-800">
                {{ PaymentDomainService.methodLabel(method) }}
              </span>
              <span class="block truncate text-xs text-stone-500">
                {{ PaymentDomainService.methodDescription(method) }}
              </span>
            </span>
          </button>
        </li>
      </ul>
    </Transition>

    <p v-if="error" class="mt-2 flex items-start gap-1.5 text-xs font-medium text-rose-600">
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