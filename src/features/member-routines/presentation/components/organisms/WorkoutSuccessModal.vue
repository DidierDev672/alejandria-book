<script setup lang="ts">
// ============================================================
// ORGANISM - Success feedback modal after workout POST
// ============================================================

defineProps<{
  visible: boolean
  title: string
  message: string
}>()

defineEmits<{
  (e: 'close'): void
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
        @click.self="$emit('close')"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="workout-success-title"
          class="w-full max-w-md bg-white rounded-2xl border border-emerald-200 shadow-2xl
                 overflow-hidden"
        >
          <!-- Accent bar -->
          <div class="h-1.5 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600" />

          <div class="px-6 py-8 text-center space-y-4">
            <div
              class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600
                     flex items-center justify-center shadow-lg shadow-emerald-500/30"
            >
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div>
              <h2
                id="workout-success-title"
                class="text-xl font-bold font-serif text-stone-900"
              >
                {{ title }}
              </h2>
              <p class="text-sm text-stone-500 mt-2 leading-relaxed max-w-sm mx-auto">
                {{ message }}
              </p>
            </div>

            <button
              type="button"
              @click="$emit('close')"
              class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700
                     text-white text-sm font-semibold px-6 py-2.5 rounded-xl
                     shadow-sm transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
