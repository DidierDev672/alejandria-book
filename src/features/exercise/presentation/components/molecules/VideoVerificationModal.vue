<script setup lang="ts">
import CustomVideoPlayer from '@/utils/components/CustomVideoPlayer.vue'

defineProps<{
  visible: boolean
  videoUrl: string
  isSaving: boolean
}>()

const emit = defineEmits<{
  (e: 'retry'): void
  (e: 'confirm'): void
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />

        <!-- Modal -->
        <div
          class="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20 border border-amber-200/60"
          v-motion
          :initial="{ opacity: 0, scale: 0.95, y: 10 }"
          :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 250, ease: [0.16, 1, 0.3, 1] } }"
        >
          <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

          <!-- Header -->
          <div class="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <h2 class="font-serif text-base font-bold text-white truncate">Video almacenado</h2>
                  <p class="text-xs text-emerald-100/80 truncate">Verifica que el video se subió correctamente</p>
                </div>
              </div>
              <button
                @click="emit('close')"
                class="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body: Video Player -->
          <div class="px-6 py-5 space-y-4">
            <div class="rounded-2xl overflow-hidden border border-amber-200 shadow-sm">
              <CustomVideoPlayer :video-src="videoUrl" />
            </div>

            <!-- Success info -->
            <div class="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
              <svg class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-emerald-700 leading-relaxed">
                  El video se almacenó exitosamente en Supabase. Reprodúcelo para verificar que se guardó correctamente.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer: Actions -->
          <div class="px-6 py-4 bg-amber-50/40 border-t border-amber-100 flex items-center justify-end gap-2">
            <button
              type="button"
              @click="emit('retry')"
              :disabled="isSaving"
              class="inline-flex items-center gap-2 border-2 border-stone-200 text-stone-600 hover:border-amber-200 hover:bg-amber-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reintentar
            </button>
            <button
              type="button"
              @click="emit('confirm')"
              :disabled="isSaving"
              class="relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <svg v-if="isSaving" class="w-4 h-4 animate-spin relative" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <svg v-else class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="relative">{{ isSaving ? 'Actualizando…' : 'Actualizar ejercicio' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
