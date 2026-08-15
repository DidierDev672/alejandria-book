<script setup lang="ts">
// ============================================================
// ORGANISM - Routine Select Modal
// Lista las rutinas del sistema y permite elegir una como base
// ============================================================

import { ref, watch } from 'vue'
import { useRoutineCatalogStore } from '../../../application/stores/useRoutineCatalogStore'
import type { RoutineOption } from '../../../domain/entities/MemberRoutine.types'
import RoutineListItem from '../molecules/RoutineListItem.vue'

const props = defineProps<{
  visible: boolean
  selectedId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', routine: RoutineOption): void
}>()

const catalogStore = useRoutineCatalogStore()

const pendingSelection = ref<RoutineOption | null>(null)

// Al abrir: cargar rutinas y preseleccionar la actual si existe
watch(
  () => props.visible,
  (isVisible) => {
    if (!isVisible) return
    catalogStore.fetchRoutines().then(() => {
      pendingSelection.value =
        catalogStore.routines.find((r) => r.id === props.selectedId) ?? null
    })
  },
)

function toggleRoutine(routine: RoutineOption) {
  // Selección única: marcar de nuevo la misma rutina la deselecciona
  pendingSelection.value =
    pendingSelection.value?.id === routine.id ? null : routine
}

function confirmSelection() {
  if (pendingSelection.value) {
    emit('select', pendingSelection.value)
  }
  emit('close')
}
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
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div
          class="w-full max-w-lg bg-white rounded-2xl border border-amber-200 shadow-2xl
                 flex flex-col max-h-[80vh] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="routine-select-title"
        >
          <!-- ══════════ Header ══════════ -->
          <div class="px-6 py-4 border-b border-amber-100 flex items-center justify-between shrink-0">
            <div>
              <h2 id="routine-select-title" class="text-lg font-semibold font-serif text-stone-900">
                Seleccionar rutina base
              </h2>
              <p class="text-xs text-stone-400 mt-0.5">
                Elige una rutina registrada como plantilla
              </p>
            </div>
            <button
              type="button"
              @click="emit('close')"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400
                     hover:bg-amber-50 hover:text-stone-600 transition-colors"
              aria-label="Cerrar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- ══════════ Body ══════════ -->
          <div class="flex-1 overflow-y-auto">
            <!-- Loading -->
            <div v-if="catalogStore.isLoading" class="flex items-center justify-center py-12">
              <div class="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
              <span class="ml-3 text-sm text-stone-500">Cargando rutinas...</span>
            </div>

            <!-- Error -->
            <div v-else-if="catalogStore.hasError" class="m-4 bg-red-50 border border-red-200 rounded-xl p-5">
              <p class="text-sm font-medium text-red-700">{{ catalogStore.error }}</p>
              <button
                type="button"
                @click="catalogStore.fetchRoutines()"
                class="mt-2 text-xs font-medium text-amber-700 hover:underline"
              >
                Reintentar
              </button>
            </div>

            <!-- Empty -->
            <div
              v-else-if="!catalogStore.hasRoutines"
              class="flex flex-col items-center justify-center py-12 text-center px-6"
            >
              <div class="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-base font-semibold font-serif text-stone-700 mb-1">
                No hay rutinas registradas
              </h3>
              <p class="text-sm text-stone-400 max-w-xs">
                Crea primero una rutina genérica para poder usarla como base.
              </p>
            </div>

            <!-- List -->
            <ul v-else class="divide-y divide-amber-50">
              <RoutineListItem
                v-for="routine in catalogStore.routines"
                :key="routine.id"
                :routine="routine"
                :selected="pendingSelection?.id === routine.id"
                @toggle="toggleRoutine(routine)"
              />
            </ul>
          </div>

          <!-- ══════════ Footer ══════════ -->
          <div class="px-6 py-4 bg-amber-50/60 border-t border-amber-100
                      flex items-center justify-between gap-3 shrink-0">
            <p class="text-xs text-stone-500">
              <template v-if="pendingSelection">
                Seleccionada: <span class="font-semibold text-stone-700">{{ pendingSelection.name }}</span>
              </template>
              <template v-else>Ninguna rutina seleccionada</template>
            </p>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="emit('close')"
                class="border border-amber-600 text-amber-700 hover:bg-amber-50
                       text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                @click="confirmSelection"
                :disabled="!pendingSelection"
                class="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium
                       px-4 py-2 rounded-lg transition-colors shadow-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Seleccionar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
