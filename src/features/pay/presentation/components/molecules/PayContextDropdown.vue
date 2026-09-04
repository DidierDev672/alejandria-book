<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { PaymentDomainService, PAY_CONTEXTS } from '../../../domain/Pay'
import type { PayContext } from '../../../domain/Pay'

withDefaults(defineProps<{
  error?: string
  disabled?: boolean
}>(), {
  error: '',
  disabled: false,
})

const modelValue = defineModel<PayContext | ''>({ default: '' })

const open = ref(false)
const root = ref<HTMLElement | null>(null)

onClickOutside(root, () => {
  open.value = false
})

function toggle(): void {
  open.value = !open.value
}

function pick(context: PayContext): void {
  modelValue.value = context
  open.value = false
}

const CONTEXT_ICONS: Record<PayContext, string> = {
  MONTHLYFEE: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm3 3h8v2H8V8zm0 4h8v2H8v-2z',
  RENEWAL: 'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z',
  SINGLE_CLASS: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z',
}
</script>

<template>
  <div ref="root" class="relative w-full">
    <label class="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
      Concepto del pago
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
          <svg class="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path :d="CONTEXT_ICONS[modelValue]" />
          </svg>
        </span>
        {{ PaymentDomainService.contextLabel(modelValue) }}
      </span>
      <span v-else class="text-stone-400">¿A qué se debe este pago?</span>

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
        <li v-for="context in PAY_CONTEXTS" :key="context">
          <button
            type="button"
            role="option"
            :aria-selected="modelValue === context"
            class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-amber-50"
            :class="modelValue === context ? 'bg-amber-50/80' : ''"
            @click="pick(context)"
          >
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              :class="modelValue === context ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'"
            >
              <svg class="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path :d="CONTEXT_ICONS[context]" />
              </svg>
            </span>
            <span class="min-w-0">
              <span class="block text-sm font-bold text-stone-800">
                {{ PaymentDomainService.contextLabel(context) }}
              </span>
              <span class="block text-xs text-stone-500">
                {{ PaymentDomainService.contextDescription(context) }}
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
