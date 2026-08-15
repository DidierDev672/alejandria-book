<script setup lang="ts">
// ============================================================
// ORGANISM - Empathetic error feedback modal after workout POST
// ============================================================

defineProps<{
  visible: boolean
  title: string
  message: string
  cause?: string
  nextStep?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'retry'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="workout-error-title"
          class="w-full max-w-md bg-white rounded-2xl border border-amber-200 shadow-2xl
                 overflow-hidden"
        >
          <!-- Warm accent (no alarmist red splash) -->
          <div class="h-1.5 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600" />

          <div class="px-6 py-7 space-y-4">
            <div class="flex items-start gap-4">
              <div
                class="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600
                       flex items-center justify-center shadow-md shadow-orange-500/25"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div class="flex-1 min-w-0">
                <h2
                  id="workout-error-title"
                  class="text-lg font-bold font-serif text-stone-900"
                >
                  {{ title }}
                </h2>
                <p class="text-sm text-stone-500 mt-1.5 leading-relaxed">
                  {{ message }}
                </p>
              </div>
            </div>

            <div
              v-if="cause"
              class="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3"
            >
              <p class="text-[11px] font-semibold uppercase tracking-wider text-amber-700 mb-1">
                Posible causa
              </p>
              <p class="text-sm text-stone-600 leading-relaxed">{{ cause }}</p>
            </div>

            <div
              v-if="nextStep"
              class="rounded-xl bg-stone-50 border border-stone-100 px-4 py-3"
            >
              <p class="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                Qué puedes hacer ahora
              </p>
              <p class="text-sm text-stone-600 leading-relaxed">{{ nextStep }}</p>
            </div>

            <div class="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                @click="emit('close')"
                class="border border-amber-600 text-amber-700 hover:bg-amber-50
                       text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Entendido
              </button>
              <button
                type="button"
                @click="emit('retry')"
                class="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold
                       px-4 py-2 rounded-lg shadow-sm transition-colors"
              >
                Revisar e intentar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
