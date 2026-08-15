<script setup lang="ts">
// ============================================================
// PAGE - Routine List Page
// ============================================================

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRoutineStore } from '../../application/stores/useRoutineStore'
import type { Routine } from '../../domain/entities/Routine.types'
import BaseIcon from '../components/atoms/BaseIcon.vue'
import RoutineDeleteModal from '../components/molecules/RoutineDeleteModal.vue'
import RoutineDetailModal from '../components/molecules/RoutineDetailModal.vue'
import RoutineEditModal from '../components/molecules/RoutineEditModal.vue'

// ============================================================
// COMPOSITION & STATE
// ============================================================

const router = useRouter()
const routineStore = useRoutineStore()

const splashVisible = ref(true)
const splashProgress = ref(0)
const searchQuery = ref('')
const selectedRoutine = ref<Routine | null>(null)
const showModal = ref(false)
const editingRoutine = ref<Routine | null>(null)
const showEditModal = ref(false)
const deletingRoutine = ref<Routine | null>(null)
const showDeleteModal = ref(false)
let splashTimer: ReturnType<typeof setInterval> | null = null

// ============================================================
// COMPUTED
// ============================================================

const pageTitle = computed(() => 'Listado de Rutinas')

const emptyMessages = [
  'No hay rutinas registradas en los archivos del Coliseo. Crea la primera para comenzar el entrenamiento.',
  'Los pergaminos están vacíos. Cada gran gladiador comenzó con una sola rutina.',
  'El Coliseo espera nuevas estrategias. Registra tu primera rutina de entrenamiento.'
]

const randomEmptyMessage = computed(() => {
  return emptyMessages[Math.floor(Math.random() * emptyMessages.length)]
})

const isSearching = computed(() => searchQuery.value.trim().length > 0)

// Rutinas que se muestran en la tabla: resultados de búsqueda o listado completo
const displayedRoutines = computed<Routine[]>(() => {
  return isSearching.value ? routineStore.filteredRoutines : routineStore.routines
})

// ============================================================
// ACTIONS
// ============================================================

function goToCreate() {
  router.push({ name: 'routines-create' })
}

async function refreshList() {
  await routineStore.fetchRoutines()
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
}

function viewRoutine(id: string) {
  const routine = displayedRoutines.value.find(r => r.id === id)
  if (routine) {
    selectedRoutine.value = routine
    showModal.value = true
  }
}

function editRoutine(id: string) {
  const routine = displayedRoutines.value.find(r => r.id === id)
  if (routine) {
    editingRoutine.value = routine
    showEditModal.value = true
  }
}

function onRoutineUpdated(updated: Routine) {
  const index = routineStore.routines.findIndex((r: Routine) => r.id === updated.id)
  if (index !== -1) {
    routineStore.routines[index] = updated
  }
  const filteredIndex = routineStore.filteredRoutines.findIndex((r: Routine) => r.id === updated.id)
  if (filteredIndex !== -1) {
    routineStore.filteredRoutines[filteredIndex] = updated
  }
}

function deleteRoutine(id: string) {
  const routine = displayedRoutines.value.find(r => r.id === id)
  if (routine) {
    deletingRoutine.value = routine
    showDeleteModal.value = true
  }
}

function onRoutineDeleted(id: string) {
  routineStore.routines = routineStore.routines.filter((r: Routine) => r.id !== id)
  routineStore.filteredRoutines = routineStore.filteredRoutines.filter((r: Routine) => r.id !== id)
}

// ============================================================
// SEARCH (tiempo real con debounce)
// ============================================================

const SEARCH_DEBOUNCE_MS = 300
let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (newQuery) => {
  if (searchTimeout) clearTimeout(searchTimeout)

  const query = newQuery.trim()

  if (!query) {
    // Sin texto: mostrar el listado completo inmediatamente
    routineStore.clearSearch()
    return
  }

  searchTimeout = setTimeout(() => {
    routineStore.searchRoutines(query)
  }, SEARCH_DEBOUNCE_MS)
})

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    router.push({ name: 'login' })
    return
  }

  // Lanzar petición HTTP en segundo plano
  await routineStore.fetchRoutines()

  // Temporizador de splash: 5 segundos con barra de progreso
  const DURATION = 5000
  const INTERVAL = 50
  let elapsed = 0

  splashTimer = setInterval(() => {
    elapsed += INTERVAL
    splashProgress.value = Math.min((elapsed / DURATION) * 100, 100)

    if (elapsed >= DURATION) {
      if (splashTimer) clearInterval(splashTimer)
      splashTimer = null
      splashProgress.value = 100
      // Pequeña pausa para que la barra complete al 100%
      setTimeout(() => {
        splashVisible.value = false
      }, 150)
    }
  }, INTERVAL)
})

onUnmounted(() => {
  if (splashTimer) {
    clearInterval(splashTimer)
    splashTimer = null
  }
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }
})
</script>

<template>
  <!-- ============================================================ -->
  <!-- SPLASH / LOADING SCREEN (5 segundos) -->
  <!-- ============================================================ -->
  <Transition enter-active-class="transition-opacity duration-500 ease-out" enter-from-class="opacity-0"
    enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500 ease-in"
    leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="splashVisible" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFFBF5]">
      <!-- Decorative Background -->
      <div class="pointer-events-none absolute right-0 top-0 opacity-10">
        <svg width="400" height="300" viewBox="0 0 400 300" fill="none">
          <circle cx="350" cy="-30" r="180" fill="#f59e0b" />
          <circle cx="280" cy="60" r="90" fill="#ea580c" />
        </svg>
      </div>
      <div class="pointer-events-none absolute bottom-0 left-0 opacity-5">
        <svg width="300" height="250" viewBox="0 0 300 250" fill="none">
          <circle cx="0" cy="250" r="160" fill="#f59e0b" />
        </svg>
      </div>

      <!-- Animated Icon -->
      <div class="relative mb-8">
        <!-- Outer ring pulse -->
        <div class="absolute inset-0 w-24 h-24 rounded-3xl bg-amber-400/20 animate-ping" />
        <!-- Main icon container -->
        <div v-motion :initial="{ scale: 0.8, opacity: 0 }"
          :enter="{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 15 } }" class="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl 
                 flex items-center justify-center shadow-2xl shadow-amber-500/40">
          <svg class="w-12 h-12 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <!-- Title -->
      <h1 v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
        class="text-3xl font-bold font-serif text-stone-900 mb-2">
        Listado de Rutinas
      </h1>

      <!-- Subtitle -->
      <p v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 0.5 } }"
        class="text-sm text-stone-500 mb-10">
        Cargando registros del Coliseo...
      </p>

      <!-- Progress Bar -->
      <div class="w-64">
        <div class="h-1.5 bg-amber-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-100 ease-linear"
            :style="{ width: `${splashProgress}%` }" />
        </div>
        <p class="text-center text-xs text-stone-400 mt-2 font-mono">
          {{ Math.round(splashProgress) }}%
        </p>
      </div>
    </div>
  </Transition>

  <!-- ============================================================ -->
  <!-- PAGE CONTENT -->
  <!-- ============================================================ -->
  <div class="min-h-screen bg-[#FFFBF5] px-6 py-8">
    <!-- Decorative Background Elements -->
    <div class="pointer-events-none fixed right-0 top-0 opacity-10 -z-10">
      <svg width="360" height="260" viewBox="0 0 360 260" fill="none">
        <circle cx="320" cy="-20" r="160" fill="#f59e0b" />
        <circle cx="270" cy="55" r="80" fill="#ea580c" />
      </svg>
    </div>
    <div class="pointer-events-none fixed bottom-0 left-0 opacity-5 -z-10">
      <svg width="240" height="200" viewBox="0 0 240 200" fill="none">
        <circle cx="0" cy="200" r="140" fill="#f59e0b" />
      </svg>
    </div>

    <div class="max-w-5xl mx-auto space-y-6">
      <!-- ============================================================ -->
      <!-- PAGE HEADER -->
      <!-- ============================================================ -->
      <div v-motion :initial="{ opacity: 0, y: 40 }" :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }" class="relative overflow-hidden rounded-3xl px-6 py-5 shadow-xl shadow-orange-500/30
               bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600">
        <!-- Decorative orbs -->
        <div class="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div class="pointer-events-none absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-amber-300/20 blur-2xl" />

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Animated Clock Icon -->
            <div v-motion :initial="{ scale: 0.8, opacity: 0 }"
              :enter="{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 12 } }" class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl 
                     flex items-center justify-center shadow-lg shadow-orange-600/30
                     cursor-pointer">
              <svg v-motion :initial="{ x: 0 }"
                :hovered="{ x: 8, transition: { type: 'spring', stiffness: 300, damping: 10, repeat: Infinity, repeatType: 'mirror' } }"
                class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <!-- Clock face -->
                <circle cx="12" cy="12" r="9" stroke-opacity="0.9" />
                <!-- Hour hand (spins slowly) -->
                <line x1="12" y1="12" x2="12" y2="7.5" class="origin-center animate-spin-hour" />
                <!-- Minute hand (spins faster) -->
                <line x1="12" y1="12" x2="12" y2="4.5" class="origin-center animate-spin-minute" stroke-width="1.5" />
                <!-- Center dot -->
                <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold font-serif text-white drop-shadow-sm">{{ pageTitle }}</h1>
              <p class="text-sm text-orange-100 mt-0.5">
                Rutinas de entrenamiento registradas en los archivos del Coliseo
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Refresh Button -->
            <button @click="refreshList" :disabled="routineStore.isLoading.value" class="w-10 h-10 rounded-xl border border-white/20 bg-white/10
                     flex items-center justify-center text-white
                     hover:bg-white/20 hover:border-white/30
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200" title="Actualizar lista">
              <svg class="w-5 h-5" :class="{ 'animate-spin': routineStore.isLoading.value }" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <!-- Create Button -->
            <button @click="goToCreate" class="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm
                     text-white font-semibold rounded-xl shadow-lg
                     hover:bg-white/30 hover:shadow-xl
                     active:bg-white/40
                     transition-all duration-200 border border-white/20">
              <BaseIcon name="plus" size="sm" color="amber" />
              <span class="text-white">Nueva Rutina</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- LOADING STATE (mientras carga datos) -->
      <!-- ============================================================ -->
      <div v-if="routineStore.isLoading.value && !routineStore.hasRoutines.value" v-motion :initial="{ opacity: 0 }"
        :enter="{ opacity: 1 }" class="flex flex-col items-center justify-center py-16">
        <div class="relative w-16 h-16 mb-4">
          <div class="absolute inset-0 border-4 border-amber-200 rounded-full" />
          <div class="absolute inset-2 border-4 border-transparent border-t-amber-500 rounded-full animate-spin" />
          <div class="absolute inset-0 flex items-center justify-center">
            <BaseIcon name="timer" size="md" color="amber" />
          </div>
        </div>
        <p class="text-stone-500 text-sm">Cargando rutinas del Coliseo...</p>
      </div>

      <!-- ============================================================ -->
      <!-- ERROR STATE -->
      <!-- ============================================================ -->
      <div v-else-if="routineStore.hasError.value" v-motion :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <BaseIcon name="alert-circle" size="md" color="red" />
        </div>
        <h3 class="text-lg font-semibold font-serif text-red-800 mb-1">
          Error al cargar rutinas
        </h3>
        <p class="text-sm text-red-600 mb-4">{{ routineStore.error.value }}</p>
        <button @click="refreshList" class="px-4 py-2 bg-red-100 text-red-700 font-medium rounded-xl 
                 hover:bg-red-200 transition-colors duration-200">
          Reintentar
        </button>
      </div>

      <!-- ============================================================ -->
      <!-- EMPTY STATE -->
      <!-- ============================================================ -->
      <div v-else-if="routineStore.routines.length === 0" v-motion :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
        class="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-white/80 backdrop-blur-sm p-12 text-center">
        <div class="pointer-events-none absolute right-0 top-0 opacity-5">
          <svg width="200" height="160" viewBox="0 0 200 160" fill="none">
            <circle cx="180" cy="-20" r="100" fill="#f59e0b" />
          </svg>
        </div>

        <div class="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl 
                 flex items-center justify-center mx-auto mb-5">
          <BaseIcon name="timer" size="lg" color="amber" />
        </div>
        <h3 class="text-xl font-bold font-serif text-stone-900 mb-2">
          Sin rutinas registradas
        </h3>
        <p class="text-sm text-stone-500 mb-6 max-w-md mx-auto leading-relaxed">
          {{ randomEmptyMessage }}
        </p>
        <button @click="goToCreate" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 
                 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30
                 hover:from-amber-600 hover:to-amber-700 hover:shadow-xl
                 transition-all duration-200">
          <BaseIcon name="plus" size="sm" color="amber" />
          <span class="text-white">Crear primera rutina</span>
        </button>
      </div>

      <!-- ============================================================ -->
      <!-- ROUTINES TABLE -->
      <!-- ============================================================ -->
      <div v-else class="space-y-4">
        <!-- Search bar -->
        <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="flex items-center gap-3">
          <div class="relative flex-1 max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input v-model="searchQuery" type="search" placeholder="Buscar rutinas..." class="w-full pl-10 pr-10 py-2.5 bg-white/80 backdrop-blur-sm border border-amber-200/60 
                     rounded-xl text-sm text-stone-700 placeholder-stone-400
                     focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400
                     transition-all duration-200" />
            <!-- Spinner mientras se ejecuta la búsqueda -->
            <div v-if="isSearching && routineStore.isLoading.value"
              class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-amber-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <!-- Contador de resultados de búsqueda -->
          <p v-if="isSearching" class="text-xs text-stone-400">
            {{ displayedRoutines.length }} resultado{{ displayedRoutines.length === 1 ? '' : 's' }}
          </p>
        </div>

        <!-- Table Card -->
        <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }"
          class="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-white/80 backdrop-blur-sm shadow-xl shadow-amber-100/60">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-amber-100">
                  <th class="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th class="text-center px-4 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Sección
                  </th>
                  <th class="text-center px-4 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Repeticiones
                  </th>
                  <th class="text-center px-4 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Tiempo
                  </th>
                  <th class="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Notas
                  </th>
                  <th class="text-center px-4 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-amber-50">
                <!-- Sin resultados de búsqueda -->
                <tr v-if="displayedRoutines.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center">
                    <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p class="text-sm font-semibold text-stone-700 mb-1">Sin resultados</p>
                    <p class="text-xs text-stone-400">
                      Ninguna rutina coincide con "{{ searchQuery.trim() }}"
                    </p>
                  </td>
                </tr>
                <tr v-for="(routine, index) in displayedRoutines" :key="routine.id" v-motion
                  :initial="{ opacity: 0, x: -20 }" :enter="{
                    opacity: 1,
                    x: 0,
                    transition: { delay: index * 0.05 }
                  }" class="group hover:bg-amber-50/50 transition-colors duration-150">
                  <!-- Name -->
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center 
                               group-hover:bg-amber-400 transition-colors duration-150">
                        <BaseIcon name="timer" size="sm" color="amber" />
                      </div>
                      <div>
                        <p class="font-semibold text-stone-900 text-sm">
                          {{ routine.name }}
                        </p>
                      </div>
                    </div>
                  </td>

                  <!-- Section -->
                  <td class="px-4 py-4 text-center">
                    <span v-if="routine.section != null" class="inline-flex items-center justify-center w-8 h-8 bg-stone-100 rounded-lg 
                             text-sm font-semibold text-stone-700">
                      {{ routine.section }}
                    </span>
                    <span v-else class="text-stone-300">—</span>
                  </td>

                  <!-- Repetitions -->
                  <td class="px-4 py-4 text-center">
                    <span v-if="routine.repetitions != null" class="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 
                             rounded-lg text-sm font-semibold">
                      {{ routine.repetitions }}
                    </span>
                    <span v-else class="text-stone-300">—</span>
                  </td>

                  <!-- Time -->
                  <td class="px-4 py-4 text-center">
                    <span class="inline-flex items-center px-2.5 py-1 bg-amber-100 text-amber-700 
                             rounded-lg text-sm font-bold">
                      {{ formatTime(routine.time_minutes) }}
                    </span>
                  </td>

                  <!-- Notes -->
                  <td class="px-6 py-4">
                    <p class="text-sm text-stone-600 max-w-xs truncate" :title="routine.notes || ''">
                      {{ routine.notes || '—' }}
                    </p>
                  </td>

                  <!-- Actions -->
                  <td class="px-4 py-4">
                    <div class="flex items-center justify-center gap-1">
                      <button @click="viewRoutine(routine.id)"
                        class="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-stone-400  bg-blue-600 transition-colors duration-150"
                        title="Ver detalle">
                        <BaseIcon name="eye" size="sm" color="blue" />
                      </button>
                      <button @click="editRoutine(routine.id)"
                        class="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 bg-amber-600 transition-colors duration-150"
                        title="Editar rutina">
                        <BaseIcon name="edit" size="sm" color="amber" />
                      </button>
                      <button @click="deleteRoutine(routine.id)" class="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400
                          bg-red-600 transition-colors duration-150" title="Eliminar rutina">
                        <BaseIcon name="trash" size="sm" color="red" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <RoutineDetailModal :routine="selectedRoutine" :visible="showModal" @close="showModal = false" />

    <!-- Edit Modal -->
    <RoutineEditModal :routine="editingRoutine" :visible="showEditModal" @close="showEditModal = false"
      @updated="onRoutineUpdated" />

    <!-- Delete Modal -->
    <RoutineDeleteModal :routine="deletingRoutine" :visible="showDeleteModal"
      :total-routines="routineStore.totalRoutines.value" @close="showDeleteModal = false" @deleted="onRoutineDeleted" />
  </div>
</template>

<style scoped>
/* Clock hands spinning on load */
.animate-spin-hour {
  animation: spin-hour 12s linear infinite;
  transform-origin: 12px 12px;
}

.animate-spin-minute {
  animation: spin-minute 4s linear infinite;
  transform-origin: 12px 12px;
}

@keyframes spin-hour {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes spin-minute {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
