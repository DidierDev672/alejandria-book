<script setup lang="ts">
import axiosExercise from '@/features/exercise/infrastructure/http/axiosExercise'
import { useEquipmentStore } from '@/stores/equipmentStore.js'
import CustomVideoPlayer from '@/utils/components/CustomVideoPlayer.vue'
import { computed, onMounted, ref } from 'vue'

// ============================================================
// TYPES
// ============================================================

interface ExerciseWithEquipment {
  id: string
  name: string
  muscleGroup: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  video?: string
  equipmentId: string
  createdAt?: string
  updatedAt?: string
  equipmentName: string
  equipmentType: string
}

// ============================================================
// STORES
// ============================================================

const equipmentStore = useEquipmentStore()

// ============================================================
// STATE
// ============================================================

const exercises = ref<ExerciseWithEquipment[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const filterDifficulty = ref<string>('')
const filterMuscleGroup = ref<string>('')

// ============================================================
// COMPUTED
// ============================================================

const filteredExercises = computed(() => {
  return exercises.value.filter((ex) => {
    const matchesSearch =
      !searchQuery.value ||
      ex.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (ex.muscleGroup ?? '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ex.equipmentName.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesDifficulty =
      !filterDifficulty.value || ex.difficulty === filterDifficulty.value

    const matchesMuscleGroup =
      !filterMuscleGroup.value ||
      (ex.muscleGroup ?? '').toLowerCase().includes(filterMuscleGroup.value.toLowerCase())

    return matchesSearch && matchesDifficulty && matchesMuscleGroup
  })
})

const uniqueMuscleGroups = computed(() => {
  const groups = new Set(exercises.value.map((ex) => ex.muscleGroup).filter(Boolean))
  return Array.from(groups).sort()
})

// ============================================================
// HELPERS
// ============================================================

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function difficultyLabel(diff: string): string {
  const map: Record<string, string> = {
    BEGINNER: 'Principiante',
    INTERMEDIATE: 'Intermedio',
    ADVANCED: 'Avanzado',
  }
  return map[diff] ?? diff
}

function difficultyClasses(diff: string): string {
  const map: Record<string, string> = {
    BEGINNER: 'bg-green-100 text-green-700',
    INTERMEDIATE: 'bg-amber-100 text-amber-700',
    ADVANCED: 'bg-red-100 text-red-700',
  }
  return map[diff] ?? 'bg-stone-100 text-stone-600'
}

function dotColor(diff: string): string {
  const map: Record<string, string> = {
    BEGINNER: 'bg-green-500',
    INTERMEDIATE: 'bg-amber-500',
    ADVANCED: 'bg-red-500',
  }
  return map[diff] ?? 'bg-stone-400'
}

// ============================================================
// DETAIL MODAL
// ============================================================

const selectedExercise = ref<ExerciseWithEquipment | null>(null)
const showDetailModal = ref(false)

// ── Modal de edición ─────────────────────────────────────────

const showEditModal = ref(false)
const editingExercise = ref<ExerciseWithEquipment | null>(null)
const isSubmittingEdit = ref(false)
const editError = ref<string | null>(null)

const editForm = ref({
  name: '',
  muscleGroup: '',
  difficulty: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
  video: '',
})

function openEditModal(exercise: ExerciseWithEquipment) {
  editingExercise.value = exercise
  editForm.value = {
    name: exercise.name,
    muscleGroup: exercise.muscleGroup ?? '',
    difficulty: exercise.difficulty,
    video: exercise.video ?? '',
  }
  editError.value = null
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingExercise.value = null
  editError.value = null
}

async function submitEdit() {
  if (!editingExercise.value) return
  if (!editForm.value.name.trim()) {
    editError.value = 'El nombre del ejercicio es obligatorio.'
    return
  }

  isSubmittingEdit.value = true
  editError.value = null

  try {
    await axiosExercise.put(`/${editingExercise.value.id}`, {
      name: editForm.value.name.trim(),
      muscleGroup: editForm.value.muscleGroup.trim(),
      difficulty: editForm.value.difficulty,
      video: editForm.value.video.trim() || undefined,
    })

    // Actualizar el ejercicio en la lista local
    const idx = exercises.value.findIndex((ex) => ex.id === editingExercise.value!.id)
    if (idx !== -1) {
      exercises.value[idx] = {
        ...exercises.value[idx],
        name: editForm.value.name.trim(),
        muscleGroup: editForm.value.muscleGroup.trim(),
        difficulty: editForm.value.difficulty,
        video: editForm.value.video.trim() || exercises.value[idx].video,
      }
    }

    closeEditModal()
  } catch (err: any) {
    editError.value =
      err?.response?.data?.error ?? err?.message ?? 'Error al guardar los cambios.'
    console.error('[ExerciseListPage] submitEdit error:', err)
  } finally {
    isSubmittingEdit.value = false
  }
}

// ── Modal de video (desde la card del timeline) ──
const videoModalUrl = ref<string | null>(null)
const videoModalTitle = ref('')

function openVideoModal(exercise: ExerciseWithEquipment) {
  videoModalUrl.value = exercise.video ?? null
  videoModalTitle.value = exercise.name
}

function closeVideoModal() {
  videoModalUrl.value = null
  videoModalTitle.value = ''
}

function openDetail(exercise: ExerciseWithEquipment) {
  selectedExercise.value = exercise
  showDetailModal.value = true
}

function closeDetail() {
  showDetailModal.value = false
  selectedExercise.value = null
}

/** Devuelve el equipo completo desde el store para el ejercicio seleccionado. */
function getFullEquipment(id: string) {
  return (equipmentStore.equipmentList as any[]).find((eq: any) => eq.id === id) ?? null
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente',
  }
  return map[status] ?? status
}

function statusClasses(status: string): string {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
  }
  return map[status] ?? 'bg-stone-100 text-stone-600'
}

// ============================================================
// ACTIONS
// ============================================================

async function loadData() {
  isLoading.value = true
  error.value = null
  exercises.value = []

  try {
    // 1. Cargar todos los equipos
    if (equipmentStore.equipmentList.length === 0) {
      await equipmentStore.fetchEquipment()
    }

    const equipments = equipmentStore.equipmentList

    if (equipments.length === 0) {
      return
    }

    // 2. Para cada equipo, cargar sus ejercicios en paralelo
    const results = await Promise.allSettled(
      equipments.map((equipment: any) =>
        axiosExercise
          .get('', { params: { equipment_id: equipment.id } })
          .then((res: any) => {
            const rawExercises: any[] = res.data?.data ?? res.data ?? []
            return rawExercises.map((ex: any) => ({
              ...ex,
              equipmentName: equipment.name ?? 'Equipo desconocido',
              equipmentType: equipment.type ?? '',
            }))
          })
          .catch(() => [] as ExerciseWithEquipment[]),
      ),
    )

    // 3. Aplanar todos los resultados, ignorar los rechazados
    const allExercises: ExerciseWithEquipment[] = []
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allExercises.push(...result.value)
      }
    })

    exercises.value = allExercises
  } catch (err: any) {
    error.value = err?.message ?? 'Error al cargar los ejercicios'
    console.error('[ExerciseListPage] loadData error:', err)
  } finally {
    isLoading.value = false
  }
}

function clearFilters() {
  searchQuery.value = ''
  filterDifficulty.value = ''
  filterMuscleGroup.value = ''
}

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(loadData)
</script>

<template>
  <div class="min-h-screen bg-amber-50 px-6 py-8">
    <div class="max-w-4xl mx-auto space-y-6">

      <!-- ── Page Header ── -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-1">
          <div class="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold font-serif text-stone-900">Historial de Ejercicios</h1>
            <p class="text-sm text-stone-500 mt-0.5">
              Todos los ejercicios registrados y el equipo al que pertenecen
            </p>
          </div>
        </div>
      </div>

      <!-- ── Filters ── -->
      <div class="bg-amber-100 rounded-xl border border-amber-200 p-4 shadow-sm">
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Search -->
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Buscar por nombre, músculo o equipo…" class="w-full pl-9 pr-4 py-2 text-sm border border-amber-300 rounded-lg bg-white
                     text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2
                     focus:ring-amber-500 focus:border-amber-500 transition" />
          </div>

          <!-- Difficulty filter -->
          <select v-model="filterDifficulty" class="text-sm border border-amber-300 rounded-lg px-3 py-2 bg-white text-stone-700
                   focus:outline-none focus:ring-2 focus:ring-amber-500 transition">
            <option value="">Todas las dificultades</option>
            <option value="BEGINNER">Principiante</option>
            <option value="INTERMEDIATE">Intermedio</option>
            <option value="ADVANCED">Avanzado</option>
          </select>

          <!-- Muscle group filter -->
          <select v-model="filterMuscleGroup" class="text-sm border border-amber-300 rounded-lg px-3 py-2 bg-white text-stone-700
                   focus:outline-none focus:ring-2 focus:ring-amber-500 transition">
            <option value="">Todos los grupos</option>
            <option v-for="group in uniqueMuscleGroups" :key="group" :value="group">
              {{ group }}
            </option>
          </select>

          <!-- Clear filters -->
          <button v-if="searchQuery || filterDifficulty || filterMuscleGroup" @click="clearFilters" class="inline-flex items-center gap-1.5 border border-amber-600 text-amber-700
                   hover:bg-amber-50 text-sm font-medium px-3 py-2 rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar
          </button>
        </div>

        <!-- Results summary -->
        <p v-if="!isLoading && !error" class="text-xs text-stone-500 mt-3">
          Mostrando <span class="font-semibold text-stone-700">{{ filteredExercises.length }}</span>
          de <span class="font-semibold text-stone-700">{{ exercises.length }}</span> ejercicios
        </p>
      </div>

      <!-- ── Loading State ── -->
      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <div class="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
        <span class="ml-3 text-sm text-stone-500">Cargando ejercicios…</span>
      </div>

      <!-- ── Error State ── -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <div>
          <p class="text-sm font-medium text-red-700">{{ error }}</p>
          <button @click="loadData" class="mt-2 text-xs font-medium text-amber-700 hover:underline">
            Reintentar
          </button>
        </div>
      </div>

      <!-- ── Empty State ── -->
      <div v-else-if="filteredExercises.length === 0"
        class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold font-serif text-stone-700 mb-1">
          {{ exercises.length === 0 ? 'No hay ejercicios registrados' : 'Sin resultados' }}
        </h3>
        <p class="text-sm text-stone-400 max-w-xs">
          {{ exercises.length === 0
            ? 'Agrega ejercicios desde la sección de equipos para verlos aquí.'
            : 'Prueba ajustando los filtros de búsqueda.' }}
        </p>
        <button v-if="searchQuery || filterDifficulty || filterMuscleGroup" @click="clearFilters" class="mt-4 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white
                 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
          Limpiar filtros
        </button>
      </div>

      <!-- ── Timeline ── -->
      <div v-else class="relative">
        <!-- Vertical axis line -->
        <div class="absolute left-5 top-0 bottom-0 w-0.5 bg-amber-200 rounded-full" aria-hidden="true"></div>

        <ol class="space-y-0">
          <li v-for="(exercise, index) in filteredExercises" :key="exercise.id" class="relative flex gap-5 group"
            :class="index < filteredExercises.length - 1 ? 'pb-7' : 'pb-1'">
            <!-- ── Dot ── -->
            <div class="relative z-10 shrink-0 flex flex-col items-center" style="width: 40px;">
              <div class="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-sm transition-transform
                       group-hover:scale-125 mt-3" :class="dotColor(exercise.difficulty)"></div>
            </div>

            <!-- ── Card ── -->
            <div class="flex-1 bg-amber-100 rounded-xl border border-amber-200 px-5 py-4 shadow-sm
                     hover:shadow-md transition-all duration-200 hover:border-amber-300 cursor-default">
              <!-- Top row: name + difficulty badge + actions -->
              <div class="flex flex-wrap items-start gap-2 mb-3">
                <h3 class="text-base font-semibold font-serif text-stone-900 flex-1 leading-snug">
                  {{ exercise.name }}
                </h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                         uppercase tracking-wide shrink-0" :class="difficultyClasses(exercise.difficulty)">
                  {{ difficultyLabel(exercise.difficulty) }}
                </span>

                <!-- Action buttons -->
                <div class="flex items-center gap-1 shrink-0">
                  <!-- Ver detalle -->
                  <button @click="openDetail(exercise)" class="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400
                           hover:text-amber-700 hover:bg-amber-200 transition-colors" title="Ver detalle">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                           -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <!-- Editar -->
                  <button
                    @click="openEditModal(exercise)"
                    class="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400
                           hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Editar ejercicio"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                           m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <!-- Eliminar -->
                  <button class="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400
                           hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar ejercicio">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858
                           L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Equipment row -->
              <div class="flex items-center gap-2 mb-2">
                <div class="flex items-center gap-1.5 bg-white/70 rounded-lg px-2.5 py-1 border border-amber-200">
                  <svg class="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span class="text-xs font-medium text-stone-700">{{ exercise.equipmentName }}</span>
                  <span v-if="exercise.equipmentType" class="text-xs text-stone-400">
                    · {{ exercise.equipmentType }}
                  </span>
                </div>
              </div>

              <!-- Meta row: muscle group + date + video -->
              <div class="flex flex-wrap items-center gap-3 mt-2">
                <!-- Muscle group -->
                <div v-if="exercise.muscleGroup" class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span class="text-xs text-stone-500">{{ exercise.muscleGroup }}</span>
                </div>

                <!-- Date -->
                <div v-if="exercise.createdAt" class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-xs text-stone-500">{{ formatDate(exercise.createdAt) }}</span>
                </div>

                <!-- Ver video -->
                <button
                  v-if="exercise.video"
                  @click="openVideoModal(exercise)"
                  class="inline-flex items-center gap-1 text-xs font-medium text-amber-700
                         hover:text-amber-900 transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ver video
                </button>
              </div>
            </div>
          </li>
        </ol>
      </div>

      <!-- ── Footer count ── -->
      <div v-if="!isLoading && !error && filteredExercises.length > 0" class="text-center pt-2 pb-4">
        <p class="text-xs text-stone-400">
          Fin del historial · {{ filteredExercises.length }} ejercicio{{ filteredExercises.length !== 1 ? 's' : '' }}
        </p>
      </div>

    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- MODAL: Editar ejercicio                                  -->
  <!-- ══════════════════════════════════════════════════════════ -->
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
        v-if="showEditModal && editingExercise"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeEditModal"
      >
        <div class="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"></div>

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
        >
          <div
            v-if="showEditModal"
            class="relative w-full max-w-md bg-[#FFFBF5] rounded-2xl shadow-2xl border border-amber-200 overflow-hidden"
          >
            <!-- Header -->
            <div class="bg-amber-100 border-b border-amber-200 px-6 py-4 flex items-center justify-between gap-4">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                         m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <h2 class="text-base font-semibold font-serif text-stone-900 truncate">Editar ejercicio</h2>
                  <p class="text-xs text-stone-500 truncate">{{ editingExercise.equipmentName }}</p>
                </div>
              </div>
              <button
                @click="closeEditModal"
                class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
                       text-stone-400 hover:text-stone-700 hover:bg-amber-200 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="submitEdit" class="px-6 py-5 space-y-4">

              <!-- Nombre -->
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-stone-700">
                  Nombre <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="editForm.name"
                  type="text"
                  placeholder="Nombre del ejercicio"
                  class="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm text-stone-800
                         bg-white placeholder-stone-400 focus:outline-none focus:ring-2
                         focus:ring-amber-500 focus:border-amber-500 transition"
                  :disabled="isSubmittingEdit"
                />
              </div>

              <!-- Grupo muscular -->
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-stone-700">Grupo muscular</label>
                <input
                  v-model="editForm.muscleGroup"
                  type="text"
                  placeholder="Ej: Cardiovascular, Pecho, Espalda…"
                  class="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm text-stone-800
                         bg-white placeholder-stone-400 focus:outline-none focus:ring-2
                         focus:ring-amber-500 focus:border-amber-500 transition"
                  :disabled="isSubmittingEdit"
                />
              </div>

              <!-- Dificultad -->
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-stone-700">Dificultad</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="level in ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']"
                    :key="level"
                    type="button"
                    @click="editForm.difficulty = level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'"
                    :disabled="isSubmittingEdit"
                    :class="[
                      'py-2 rounded-lg text-xs font-semibold border transition-all',
                      editForm.difficulty === level
                        ? difficultyClasses(level) + ' border-transparent shadow-sm'
                        : 'bg-white border-amber-200 text-stone-500 hover:border-amber-400',
                    ]"
                  >
                    {{ difficultyLabel(level) }}
                  </button>
                </div>
              </div>

              <!-- URL del video -->
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-stone-700">
                  URL del video
                  <span class="text-stone-400 font-normal">(opcional)</span>
                </label>
                <input
                  v-model="editForm.video"
                  type="url"
                  placeholder="https://…"
                  class="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm text-stone-800
                         bg-white placeholder-stone-400 focus:outline-none focus:ring-2
                         focus:ring-amber-500 focus:border-amber-500 transition font-mono"
                  :disabled="isSubmittingEdit"
                />
              </div>

              <!-- Error -->
              <div
                v-if="editError"
                class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5"
              >
                <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p class="text-xs text-red-700">{{ editError }}</p>
              </div>

              <!-- Equipo (solo lectura) -->
              <div class="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-xs text-stone-600">
                  Equipo vinculado:
                  <span class="font-semibold text-stone-800">{{ editingExercise.equipmentName }}</span>
                  <span v-if="editingExercise.equipmentType" class="text-stone-500"> · {{ editingExercise.equipmentType }}</span>
                </p>
              </div>
            </form>

            <!-- Footer -->
            <div class="px-6 py-4 bg-amber-50 border-t border-amber-200 flex items-center justify-end gap-2">
              <button
                type="button"
                @click="closeEditModal"
                :disabled="isSubmittingEdit"
                class="inline-flex items-center gap-2 border border-amber-600 text-amber-700
                       hover:bg-amber-100 text-sm font-medium px-4 py-2 rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="button"
                @click="submitEdit"
                :disabled="isSubmittingEdit || !editForm.name.trim()"
                class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white
                       text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  v-if="isSubmittingEdit"
                  class="w-4 h-4 animate-spin"
                  fill="none" viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 13l4 4L19 7" />
                </svg>
                {{ isSubmittingEdit ? 'Guardando…' : 'Guardar cambios' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- MODAL: Reproductor de video                              -->
  <!-- ══════════════════════════════════════════════════════════ -->
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
        v-if="videoModalUrl"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeVideoModal"
      >
        <div class="absolute inset-0 bg-stone-900/80 backdrop-blur-sm"></div>

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
        >
          <div
            v-if="videoModalUrl"
            class="relative w-full max-w-2xl bg-stone-900 rounded-2xl shadow-2xl overflow-hidden border border-stone-700/60"
          >
            <!-- Header -->
            <div class="flex items-center justify-between gap-3 px-5 py-3.5 bg-stone-800/80 border-b border-stone-700/60">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center shrink-0">
                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-sm font-semibold text-stone-100 font-serif truncate">{{ videoModalTitle }}</p>
              </div>
              <button
                @click="closeVideoModal"
                class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
                       text-stone-400 hover:text-stone-100 hover:bg-stone-700 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Player -->
            <div class="p-4">
              <CustomVideoPlayer :video-src="videoModalUrl" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- MODAL: Detalle del ejercicio                              -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showDetailModal && selectedExercise" class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeDetail">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"></div>

        <!-- Panel -->
        <Transition enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0">
          <div v-if="showDetailModal"
            class="relative w-full max-w-3xl bg-[#FFFBF5] rounded-2xl shadow-2xl border border-amber-200 overflow-hidden">
            <!-- Header -->
            <div class="bg-amber-100 border-b border-amber-200 px-6 py-5">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h2 class="text-xl font-bold font-serif text-stone-900 leading-tight">
                    {{ selectedExercise.name }}
                  </h2>
                  <div class="flex items-center gap-2 mt-2">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
                      :class="difficultyClasses(selectedExercise.difficulty)">
                      {{ difficultyLabel(selectedExercise.difficulty) }}
                    </span>
                    <template v-if="selectedExercise.muscleGroup">
                      <span class="text-xs text-stone-400">·</span>
                      <span class="text-xs text-stone-500">{{ selectedExercise.muscleGroup }}</span>
                    </template>
                  </div>
                </div>
                <button @click="closeDetail" class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-stone-400
                         hover:text-stone-700 hover:bg-amber-200 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-5 space-y-5">

              <!-- ── Vínculo con el equipo ── -->
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Equipo vinculado
                </p>
                <div class="bg-amber-100 rounded-xl border border-amber-200 p-4">
                  <div class="flex items-center gap-3">
                    <!-- Ícono equipo -->
                    <div class="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center shrink-0 shadow-sm">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5
                             M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-stone-800">{{ selectedExercise.equipmentName }}</p>
                      <p v-if="selectedExercise.equipmentType" class="text-xs text-stone-500 mt-0.5">
                        {{ selectedExercise.equipmentType }}
                      </p>
                    </div>
                    <!-- Estado del equipo si está disponible en el store -->
                    <template v-if="getFullEquipment(selectedExercise.equipmentId)">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                        :class="statusClasses(getFullEquipment(selectedExercise.equipmentId).status)">
                        {{ statusLabel(getFullEquipment(selectedExercise.equipmentId).status) }}
                      </span>
                    </template>
                  </div>

                  <!-- Último mantenimiento -->
                  <div v-if="getFullEquipment(selectedExercise.equipmentId)?.lastMaintenance"
                    class="mt-3 pt-3 border-t border-amber-200 flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-stone-400 shrink-0" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066
                           c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35
                           a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065
                           c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37
                           a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573
                           c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="text-xs text-stone-500">
                      Último mantenimiento:
                      <span class="font-medium text-stone-700">
                        {{ formatDate(getFullEquipment(selectedExercise.equipmentId).lastMaintenance) }}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- ── Detalles del ejercicio ── -->
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Detalles
                </p>
                <div class="grid grid-cols-2 gap-2">
                  <!-- Grupo muscular -->
                  <div class="bg-amber-100 rounded-xl border border-amber-200 px-4 py-3">
                    <p class="text-[10px] text-stone-400 uppercase tracking-wide mb-0.5">Grupo muscular</p>
                    <p class="text-sm font-medium text-stone-800">{{ selectedExercise.muscleGroup || '—' }}</p>
                  </div>
                  <!-- Dificultad -->
                  <div class="bg-amber-100 rounded-xl border border-amber-200 px-4 py-3">
                    <p class="text-[10px] text-stone-400 uppercase tracking-wide mb-0.5">Dificultad</p>
                    <p class="text-sm font-medium text-stone-800">{{ difficultyLabel(selectedExercise.difficulty) }}</p>
                  </div>
                  <!-- Fecha de creación -->
                  <div v-if="selectedExercise.createdAt"
                    class="bg-amber-100 rounded-xl border border-amber-200 px-4 py-3">
                    <p class="text-[10px] text-stone-400 uppercase tracking-wide mb-0.5">Creado</p>
                    <p class="text-sm font-medium text-stone-800">{{ formatDate(selectedExercise.createdAt) }}</p>
                  </div>
                  <!-- Fecha de actualización -->
                  <div v-if="selectedExercise.updatedAt"
                    class="bg-amber-100 rounded-xl border border-amber-200 px-4 py-3">
                    <p class="text-[10px] text-stone-400 uppercase tracking-wide mb-0.5">Actualizado</p>
                    <p class="text-sm font-medium text-stone-800">{{ formatDate(selectedExercise.updatedAt) }}</p>
                  </div>
                </div>
              </div>

              <!-- ── Video ── -->
              <div v-if="selectedExercise.video">
                <p class="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Video de referencia
                </p>
                <CustomVideoPlayer :video-src="selectedExercise.video" />
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-amber-50 border-t border-amber-200 flex justify-end gap-2">
              <button class="inline-flex items-center gap-2 border border-amber-600 text-amber-700
                       hover:bg-amber-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                       m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              <button @click="closeDetail" class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white
                       text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
                Cerrar
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
