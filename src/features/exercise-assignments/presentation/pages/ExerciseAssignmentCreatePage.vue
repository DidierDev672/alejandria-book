<script setup lang="ts">
import BaseModal from '@/utils/components/BaseModal.vue'
import LoadingView from '@/utils/loading/presentation/components/LoadingView.vue'
import { computed, onMounted, onUnmounted } from 'vue'
import { useExerciseAssignmentFormStore } from '../../application/stores/useExerciseAssignmentFormStore'
import ExerciseAssignmentForm from '../components/organisms/ExerciseAssignmentForm.vue'

const formStore = useExerciseAssignmentFormStore()

const isResultModalOpen = computed(() => formStore.submitOutcome !== null)
const isSuccess = computed(() => formStore.submitOutcome === 'success')

async function handleAssign(): Promise<void> {
  if (formStore.isSubmitting) return
  await formStore.submitAssignment()
}

function handleCloseResult(): void {
  const wasSuccess = formStore.submitOutcome === 'success'
  formStore.clearSubmitOutcome()
  if (wasSuccess) {
    formStore.$reset()
  }
}

onMounted(() => {
  formStore.$reset()
})

onUnmounted(() => {
  formStore.$reset()
})
</script>

<template>
  <div class="min-h-screen bg-[#FFFBF5] px-6 py-8">
    <LoadingView
      :is-loading="formStore.isSubmitting"
      title="Estamos armando su siguiente paso"
      description="Respira. Guardamos esta asignación con calma para que esa persona sienta que alguien pensó en ella."
    />

    <div class="pointer-events-none fixed top-0 right-0 -z-10 opacity-10">
      <svg width="360" height="260" viewBox="0 0 360 260" fill="none">
        <circle cx="320" cy="-20" r="160" fill="#f59e0b" />
        <circle cx="270" cy="55" r="80" fill="#ea580c" />
      </svg>
    </div>

    <div class="mx-auto max-w-3xl space-y-6">
      <section
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0 }"
        :transition="{ duration: 420, delay: 80, ease: [0.16, 1, 0.3, 1] }"
        class="overflow-hidden rounded-xl border border-amber-200 bg-amber-100 shadow-sm"
      >
        <ExerciseAssignmentForm />

        <div class="flex justify-end px-5 pb-5 sm:px-8 sm:pb-8">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="formStore.isSubmitting"
            @click="handleAssign"
          >
            Asignar ejercicios
          </button>
        </div>
      </section>
    </div>

    <BaseModal
      :is-open="isResultModalOpen"
      max-with-class="max-w-lg"
      :expandable="false"
      @close="handleCloseResult"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl border"
            :class="isSuccess
              ? 'border-emerald-300/30 bg-emerald-400/30'
              : 'border-rose-300/30 bg-rose-400/30'"
          >
            <svg
              v-if="isSuccess"
              class="h-6 w-6 text-emerald-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-else
              class="h-6 w-6 text-rose-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-serif text-xl font-bold tracking-wide text-white">
              {{ isSuccess ? 'Los ejercicios ya están asignados' : 'No pudimos completar la asignación' }}
            </h3>
            <p class="mt-0.5 text-xs text-amber-200/80">
              {{ isSuccess ? 'Esa persona ya tiene su siguiente paso' : 'El envío no llegó bien, pero lo que elegiste sigue aquí' }}
            </p>
          </div>
        </div>
      </template>

      <template #content>
        <div v-if="isSuccess" class="py-4 text-center">
          <div class="relative mb-6 inline-flex">
            <div class="absolute inset-0 scale-125 rounded-full bg-emerald-400/20 blur-lg" />
            <div
              class="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-200/40"
            >
              <svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p class="text-base leading-relaxed text-stone-600">
            Listo. Esa persona ya tiene su siguiente paso marcado.
            Acabas de cuidar de alguien, no solo de rellenar un formulario.
          </p>
        </div>

        <div v-else class="py-2">
          <div class="flex items-start gap-4 rounded-2xl border border-rose-200/80 bg-rose-50 p-4">
            <div
              class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-100"
            >
              <svg class="h-5 w-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p class="mb-1 text-sm font-bold text-stone-800">Se presentó un error al asignar los ejercicios</p>
              <p class="text-sm leading-relaxed text-stone-500">
                Algo se atascó al guardar. No perdiste lo que elegiste: puedes intentarlo otra vez cuando quieras.
              </p>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <button
          v-if="isSuccess"
          type="button"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200/40 transition-all hover:from-emerald-600 hover:to-emerald-700 active:scale-95"
          @click="handleCloseResult"
        >
          Entendido
        </button>
        <button
          v-else
          type="button"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-600 active:scale-95"
          @click="handleCloseResult"
        >
          Intentarlo otra vez
        </button>
      </template>
    </BaseModal>
  </div>
</template>
