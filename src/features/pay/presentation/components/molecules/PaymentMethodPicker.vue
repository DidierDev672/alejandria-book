<script setup lang="ts">
// ============================================================
// MOLECULE · PaymentMethodPicker
// Grupo de opciones de método de pago (radio cards).
// Presentación pura: recibe el valor y lo emite de vuelta.
// ============================================================

import { PaymentDomainService, PAYMENT_METHODS } from '../../../domain/Pay'
import type { PaymentMethod } from '../../../domain/Pay'
import PayMethodIcon from '../atoms/PayMethodIcon.vue'

withDefaults(defineProps<{
  error?: string
}>(), {
  error: '',
})

const modelValue = defineModel<PaymentMethod | ''>({ default: '' })

function pick(method: PaymentMethod): void {
  modelValue.value = modelValue.value === method ? '' : method
}

function isChecked(method: PaymentMethod): boolean {
  return modelValue.value === method
}
</script>

<template>
  <div>
    <div class="grid gap-3 sm:grid-cols-3">
      <button
        v-for="method in PAYMENT_METHODS"
        :key="method"
        type="button"
        role="radio"
        :aria-checked="isChecked(method)"
        class="group relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all duration-200 focus:outline-none focus:ring-4 active:scale-[0.98]"
        :class="
          isChecked(method)
            ? 'border-amber-500 bg-amber-50/80 shadow-sm ring-2 ring-amber-500/20'
            : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-sm'
        "
        @click="pick(method)"
      >
        <span
          class="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
          :class="isChecked(method) ? 'border-amber-600 bg-amber-600' : 'border-stone-300 bg-white'"
          aria-hidden="true"
        >
          <svg
            v-if="isChecked(method)"
            class="h-3 w-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
              clip-rule="evenodd"
            />
          </svg>
        </span>

        <span
          class="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
          :class="isChecked(method) ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700 group-hover:bg-amber-200'"
        >
          <PayMethodIcon :method="method" :size="20" />
        </span>

        <span class="font-serif text-sm font-bold text-stone-800">
          {{ PaymentDomainService.methodLabel(method) }}
        </span>
        <span class="text-xs leading-relaxed text-stone-500">
          {{ PaymentDomainService.methodDescription(method) }}
        </span>
      </button>
    </div>

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