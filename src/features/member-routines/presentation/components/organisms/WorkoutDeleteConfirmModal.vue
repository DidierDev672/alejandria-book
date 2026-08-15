<script setup lang="ts">
// ============================================================
// ORGANISM - Confirmación empática antes de DELETE workout
// ============================================================

defineProps<{
  visible: boolean
  title: string
  message: string
  cause?: string
  nextStep?: string
  routineName?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
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
        @click.self="!loading && emit('close')"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="workout-delete-title"
          class="w-full max-w-md bg-white rounded-2xl border border-amber-200 shadow-2xl
                 overflow-hidden"
        >
          <div
            class="h-1.5"
            style="
              background: linear-gradient(
                90deg,
                #fb923c 0%,
                #f97316 45%,
                #ea580c 100%
              );
            "
          />

          <div class="px-6 py-7 space-y-4">
            <div class="flex items-start gap-4">
              <div
                class="w-12 h-12 shrink-0 rounded-2xl
                       bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600
                       flex items-center justify-center shadow-md shadow-orange-500/25 text-white"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>

              <div class="flex-1 min-w-0">
                <h2
                  id="workout-delete-title"
                  class="text-lg font-bold font-serif text-stone-900"
                >
                  {{ title }}
                </h2>
                <p
                  v-if="routineName"
                  class="mt-1 text-xs font-semibold text-amber-700 truncate"
                  :title="routineName"
                >
                  {{ routineName }}
                </p>
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
                Qué implica eliminarla
              </p>
              <p class="text-sm text-stone-600 leading-relaxed">{{ cause }}</p>
            </div>

            <div
              v-if="nextStep"
              class="rounded-xl bg-stone-50 border border-stone-100 px-4 py-3"
            >
              <p class="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                Antes de decidir
              </p>
              <p class="text-sm text-stone-600 leading-relaxed">{{ nextStep }}</p>
            </div>

            <div class="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                :disabled="loading"
                class="border border-amber-600 text-amber-700 hover:bg-amber-50
                       text-sm font-medium px-4 py-2 rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
                @click="emit('close')"
              >
                Conservar plan
              </button>
              <button
                type="button"
                :disabled="loading"
                class="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700
                       text-white text-sm font-semibold px-4 py-2 rounded-lg
                       shadow-sm transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
                @click="emit('confirm')"
              >
                <svg
                  v-if="loading"
                  class="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {{ loading ? 'Eliminando...' : 'Sí, eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
