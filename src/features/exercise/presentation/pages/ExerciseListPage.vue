<script setup lang="ts">
import { useExerciseStore } from '@/features/exercise/application/stores/useExerciseStore'
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
const exerciseStore = useExerciseStore()

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
    await exerciseStore.updateExercise(editingExercise.value.id, {
      name: editForm.value.name.trim(),
      muscle_group: editForm.value.muscleGroup.trim(),
      difficulty: editForm.value.difficulty,
      video_url: editForm.value.video.trim() || undefined,
    })

    // Actualizar el ejercicio en la lista local del componente
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

// ── Modal de eliminación ──────────────────────────────────────

const showDeleteModal = ref(false)
const deletingExercise = ref<ExerciseWithEquipment | null>(null)
const isSubmittingDelete = ref(false)
const deleteError = ref<string | null>(null)

function openDeleteModal(exercise: ExerciseWithEquipment) {
  deletingExercise.value = exercise
  deleteError.value = null
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deletingExercise.value = null
  deleteError.value = null
}

async function confirmDelete() {
  if (!deletingExercise.value) return

  isSubmittingDelete.value = true
  deleteError.value = null

  try {
    await exerciseStore.deleteExercise(deletingExercise.value.id)

    // Eliminar de la lista local del componente
    exercises.value = exercises.value.filter((ex) => ex.id !== deletingExercise.value!.id)

    closeDeleteModal()
  } catch (err: any) {
    deleteError.value =
      err?.response?.data?.error ?? err?.message ?? 'Error al eliminar el ejercicio.'
    console.error('[ExerciseListPage] confirmDelete error:', err)
  } finally {
    isSubmittingDelete.value = false
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
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-stone-100 px-6 py-8">

    <!-- Decoradores globales -->
    <div class="pointer-events-none fixed right-0 top-0 opacity-10 -z-10">
      <svg width="400" height="280" viewBox="0 0 400 280" fill="none">
        <circle cx="360" cy="-25" r="180" fill="#f59e0b" />
        <circle cx="305" cy="65" r="90" fill="#ea580c" />
      </svg>
    </div>
    <div class="pointer-events-none fixed bottom-0 left-0 opacity-5 -z-10">
      <svg width="260" height="210" viewBox="0 0 260 210" fill="none">
        <circle cx="0" cy="210" r="155" fill="#f59e0b" />
      </svg>
    </div>

    <div class="max-w-4xl mx-auto space-y-6">

      <!-- ── Page Header ── -->
      <div
        class="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-white/80 backdrop-blur-sm px-6 py-5 shadow-xl shadow-amber-100/60">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
        <div class="pointer-events-none absolute right-0 top-0 opacity-10">
          <svg width="200" height="130" viewBox="0 0 200 130" fill="none">
            <circle cx="180" cy="-10" r="95" fill="#f59e0b" />
            <circle cx="140" cy="35" r="48" fill="#ea580c" />
          </svg>
        </div>
        <div class="relative flex flex-wrap items-center gap-4">
          <!-- Ícono + textos -->
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 class="font-serif text-2xl font-bold text-stone-800">Historial de Ejercicios</h1>
              <p class="text-xs text-stone-400 mt-0.5">Todos los ejercicios registrados y el equipo al que pertenecen
              </p>
            </div>
          </div>
          <!-- CTA -->
          <router-link :to="{ name: 'exercise-create' }"
            class="relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl shrink-0 active:scale-95 group">
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <svg class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="relative">Nuevo ejercicio</span>
          </router-link>
        </div>
      </div>

      <!-- ── Filters ── -->
      <div
        class="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-white/80 backdrop-blur-sm p-4 shadow-lg shadow-amber-100/40">
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Search -->
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input v-model="searchQuery" type="text" placeholder="Buscar por nombre, músculo o equipo…"
              class="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-amber-200/60 rounded-xl bg-amber-50/40 text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200" />
          </div>

          <!-- Difficulty filter -->
          <div class="relative">
            <select v-model="filterDifficulty"
              class="appearance-none text-sm border-2 border-amber-200/60 rounded-xl px-4 py-2.5 pr-9 bg-amber-50/40 text-stone-700 focus:outline-none focus:border-amber-500 focus:bg-white transition-all duration-200 cursor-pointer">
              <option value="">Todas las dificultades</option>
              <option value="BEGINNER">Principiante</option>
              <option value="INTERMEDIATE">Intermedio</option>
              <option value="ADVANCED">Avanzado</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Muscle group filter -->
          <div class="relative">
            <select v-model="filterMuscleGroup"
              class="appearance-none text-sm border-2 border-amber-200/60 rounded-xl px-4 py-2.5 pr-9 bg-amber-50/40 text-stone-700 focus:outline-none focus:border-amber-500 focus:bg-white transition-all duration-200 cursor-pointer">
              <option value="">Todos los grupos</option>
              <option v-for="group in uniqueMuscleGroups" :key="group" :value="group">{{ group }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Clear filters -->
          <button v-if="searchQuery || filterDifficulty || filterMuscleGroup" @click="clearFilters"
            class="inline-flex items-center gap-1.5 border-2 border-amber-300 text-amber-700 hover:bg-amber-50 text-sm font-semibold px-3 py-2 rounded-xl transition-all duration-200 active:scale-95">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar
          </button>
        </div>

        <!-- Results summary -->
        <p v-if="!isLoading && !error" class="text-xs text-stone-400 mt-3">
          Mostrando
          <span class="font-bold text-amber-600">{{ filteredExercises.length }}</span>
          de
          <span class="font-bold text-stone-600">{{ exercises.length }}</span>
          ejercicios
        </p>
      </div>

      <!-- ── Loading ── -->
      <div v-if="isLoading"
        class="flex items-center justify-center py-16 rounded-3xl border border-amber-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
        <div class="w-8 h-8 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
        <span class="ml-3 text-sm text-stone-400">Cargando ejercicios…</span>
      </div>

      <!-- ── Error ── -->
      <div v-else-if="error"
        class="relative overflow-hidden rounded-2xl border border-rose-200 bg-rose-50/80 p-5 flex items-start gap-3 shadow-lg">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/60 to-transparent" />
        <div
          class="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
          <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-rose-700">{{ error }}</p>
          <button @click="loadData"
            class="mt-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors">
            Reintentar
          </button>
        </div>
      </div>

      <!-- ── Empty State ── -->
      <div v-else-if="filteredExercises.length === 0"
        class="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 py-14 px-8 text-center shadow-xl shadow-amber-100/40">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div class="relative inline-flex mb-5">
          <div
            class="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-lg scale-110" />
          <div
            class="relative w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 ring-4 ring-amber-100">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        <h3 class="font-serif text-lg font-bold text-stone-700 mb-1">
          {{ exercises.length === 0 ? 'No hay ejercicios registrados' : 'Sin resultados' }}
        </h3>
        <p class="text-sm text-stone-400 max-w-xs mx-auto mb-6">
          {{ exercises.length === 0
            ? 'Registra tu primer ejercicio para comenzar a organizar tu rutina de entrenamiento.'
            : 'Prueba ajustando los filtros de búsqueda.' }}
        </p>
        <div class="flex items-center justify-center gap-3 flex-wrap">
          <router-link :to="{ name: 'exercise-create' }"
            class="relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 active:scale-95 group">
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <svg class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="relative">Registrar ejercicio</span>
          </router-link>
          <button v-if="searchQuery || filterDifficulty || filterMuscleGroup" @click="clearFilters"
            class="inline-flex items-center gap-2 border-2 border-amber-300 text-amber-700 hover:bg-amber-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95">
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- ── Timeline ── -->
      <div v-else class="relative">
        <!-- Eje vertical -->
        <div
          class="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 via-amber-200 to-transparent rounded-full"
          aria-hidden="true" />

        <ol class="space-y-0">
          <li v-for="(exercise, index) in filteredExercises" :key="exercise.id" class="relative flex gap-5 group"
            :class="index < filteredExercises.length - 1 ? 'pb-6' : 'pb-1'">
            <!-- Dot -->
            <div class="relative z-10 shrink-0 flex flex-col items-center" style="width: 40px;">
              <div
                class="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-md transition-all duration-200 group-hover:scale-125 group-hover:ring-4 mt-3.5"
                :class="dotColor(exercise.difficulty)" />
            </div>

            <!-- Card -->
            <div
              class="flex-1 relative overflow-hidden rounded-2xl border border-amber-200/60 bg-white/80 backdrop-blur-sm px-5 py-4 shadow-md hover:shadow-xl hover:shadow-amber-100/60 hover:border-amber-300 transition-all duration-200 cursor-default group">
              <div
                class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

              <!-- Top row -->
              <div class="flex flex-wrap items-start gap-2 mb-3">
                <h3
                  class="font-serif text-base font-bold text-stone-800 flex-1 leading-snug group-hover:text-amber-800 transition-colors duration-200">
                  {{ exercise.name }}
                </h3>

                <!-- Difficulty badge -->
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide shrink-0 border"
                  :class="difficultyClasses(exercise.difficulty)">
                  {{ difficultyLabel(exercise.difficulty) }}
                </span>

                <!-- Actions -->
                <div class="flex items-center gap-1 shrink-0">
                  <button @click="openDetail(exercise)"
                    class="w-7 h-7 flex items-center justify-center rounded-xl text-stone-400 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all duration-200"
                    title="Ver detalle">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button @click="openEditModal(exercise)"
                    class="w-7 h-7 flex items-center justify-center rounded-xl text-stone-400 hover:text-orange-600 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all duration-200"
                    title="Editar ejercicio">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="openDeleteModal(exercise)"
                    class="w-7 h-7 flex items-center justify-center rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-200"
                    title="Eliminar ejercicio">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Equipment row -->
              <div class="flex items-center gap-2 mb-2.5">
                <div class="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-1.5 border border-amber-200/80">
                  <div
                    class="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                    <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span class="text-xs font-semibold text-stone-700">{{ exercise.equipmentName }}</span>
                  <span v-if="exercise.equipmentType" class="text-xs text-stone-400">·
                    {{ exercise.equipmentType }}</span>
                </div>
              </div>

              <!-- Meta row -->
              <div class="flex flex-wrap items-center gap-3 mt-2">
                <div v-if="exercise.muscleGroup" class="flex items-center gap-1.5">
                  <svg class="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span class="text-xs text-stone-400">{{ exercise.muscleGroup }}</span>
                </div>
                <div v-if="exercise.createdAt" class="flex items-center gap-1.5">
                  <svg class="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-xs text-stone-400">{{ formatDate(exercise.createdAt) }}</span>
                </div>
                <button v-if="exercise.video" @click="openVideoModal(exercise)"
                  class="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors">
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

      <!-- Footer count -->
      <div v-if="!isLoading && !error && filteredExercises.length > 0" class="text-center pt-2 pb-4">
        <div class="inline-flex items-center gap-2 text-xs text-stone-400">
          <div class="h-px w-12 bg-gradient-to-r from-transparent to-amber-200" />
          Fin del historial · <span class="font-semibold text-amber-600">{{ filteredExercises.length }}</span>
          ejercicio{{ filteredExercises.length !== 1 ? 's' : '' }}
          <div class="h-px w-12 bg-gradient-to-l from-transparent to-amber-200" />
        </div>
      </div>

    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- MODAL: Editar ejercicio                                   -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showEditModal && editingExercise" class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeEditModal">
        <div class="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" />
        <Transition enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0">
          <div v-if="showEditModal"
            class="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20 border border-amber-200/60">
            <div
              class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            <!-- Header -->
            <div
              class="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 flex items-center justify-between gap-4">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <h2 class="font-serif text-base font-bold text-white truncate">Editar ejercicio</h2>
                  <p class="text-xs text-amber-100/80 truncate">{{ editingExercise.equipmentName }}</p>
                </div>
              </div>
              <button @click="closeEditModal"
                class="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="submitEdit" class="px-6 py-5 space-y-4">

              <!-- Nombre -->
              <div class="space-y-1.5">
                <label class="block text-sm font-semibold text-stone-700">Nombre <span
                    class="text-orange-500">*</span></label>
                <input v-model="editForm.name" type="text" placeholder="Nombre del ejercicio"
                  :disabled="isSubmittingEdit"
                  class="w-full border-2 border-amber-200/60 rounded-xl px-4 py-2.5 text-sm text-stone-700 bg-amber-50/40 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200" />
              </div>

              <!-- Grupo muscular -->
              <div class="space-y-1.5">
                <label class="block text-sm font-semibold text-stone-700">Grupo muscular</label>
                <input v-model="editForm.muscleGroup" type="text" placeholder="Ej: Cardiovascular, Pecho, Espalda…"
                  :disabled="isSubmittingEdit"
                  class="w-full border-2 border-amber-200/60 rounded-xl px-4 py-2.5 text-sm text-stone-700 bg-amber-50/40 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200" />
              </div>

              <!-- Dificultad -->
              <div class="space-y-1.5">
                <label class="block text-sm font-semibold text-stone-700">Dificultad</label>
                <div class="grid grid-cols-3 gap-2">
                  <button v-for="level in ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']" :key="level" type="button"
                    @click="editForm.difficulty = level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'"
                    :disabled="isSubmittingEdit"
                    class="py-2.5 rounded-xl text-xs font-bold border-2 transition-all duration-200" :class="editForm.difficulty === level
                      ? difficultyClasses(level) + ' shadow-sm'
                      : 'bg-stone-50 border-stone-200 text-stone-500 hover:border-amber-200 hover:bg-amber-50/40'">
                    {{ difficultyLabel(level) }}
                  </button>
                </div>
              </div>

              <!-- URL video -->
              <div class="space-y-1.5">
                <label class="block text-sm font-semibold text-stone-700">
                  URL del video <span class="text-stone-400 font-normal text-xs ml-1">(opcional)</span>
                </label>
                <input v-model="editForm.video" type="url" placeholder="https://…" :disabled="isSubmittingEdit"
                  class="w-full border-2 border-amber-200/60 rounded-xl px-4 py-2.5 text-sm text-stone-700 bg-amber-50/40 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200 font-mono" />
              </div>

              <!-- Error -->
              <div v-if="editError"
                class="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
                <svg class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p class="text-xs text-rose-700">{{ editError }}</p>
              </div>

              <!-- Equipo (readonly) -->
              <div class="bg-amber-50/60 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-xs text-stone-500">
                  Equipo vinculado:
                  <span class="font-bold text-stone-800">{{ editingExercise.equipmentName }}</span>
                  <span v-if="editingExercise.equipmentType" class="text-stone-400"> ·
                    {{ editingExercise.equipmentType }}</span>
                </p>
              </div>
            </form>

            <!-- Footer -->
            <div class="px-6 py-4 bg-amber-50/40 border-t border-amber-100 flex items-center justify-end gap-2">
              <button type="button" @click="closeEditModal" :disabled="isSubmittingEdit"
                class="inline-flex items-center gap-2 border-2 border-stone-200 text-stone-600 hover:border-amber-200 hover:bg-amber-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                Cancelar
              </button>
              <button type="button" @click="submitEdit" :disabled="isSubmittingEdit || !editForm.name.trim()"
                class="relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group">
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <svg v-if="isSubmittingEdit" class="w-4 h-4 animate-spin relative" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <svg v-else class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="relative">{{ isSubmittingEdit ? 'Guardando…' : 'Guardar cambios' }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- MODAL: Reproductor de video                               -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="videoModalUrl" class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeVideoModal">
        <div class="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" />
        <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100">
          <div v-if="videoModalUrl"
            class="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-amber-500/20">
            <!-- Header dark -->
            <div class="flex items-center justify-between gap-3 px-5 py-3.5 bg-stone-900 border-b border-amber-500/20">
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/30">
                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="font-serif text-sm font-semibold text-amber-50 truncate">{{ videoModalTitle }}</p>
              </div>
              <button @click="closeVideoModal"
                class="shrink-0 w-7 h-7 flex items-center justify-center rounded-xl text-stone-400 hover:text-amber-300 hover:bg-stone-800 border border-transparent hover:border-amber-500/20 transition-all duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="bg-stone-950 p-3">
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
        <div class="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" />
        <Transition enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0">
          <div v-if="showDetailModal"
            class="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20 border border-amber-200/60">
            <div
              class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            <!-- Header -->
            <div class="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h2 class="font-serif text-xl font-bold text-white leading-tight">{{ selectedExercise.name }}</h2>
                  <div class="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-white/20 text-white border border-white/30">
                      {{ difficultyLabel(selectedExercise.difficulty) }}
                    </span>
                    <template v-if="selectedExercise.muscleGroup">
                      <span class="text-amber-200/60 text-xs">·</span>
                      <span class="text-xs text-amber-100/80">{{ selectedExercise.muscleGroup }}</span>
                    </template>
                  </div>
                </div>
                <button @click="closeDetail"
                  class="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-5 space-y-5">

              <!-- Equipo vinculado -->
              <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-2">
                  <span class="inline-block h-px flex-1 bg-gradient-to-r from-amber-200 to-transparent" />
                  Equipo vinculado
                </p>
                <div class="bg-amber-50/60 rounded-2xl border border-amber-200 p-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-md shadow-amber-300/40">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-stone-800">{{ selectedExercise.equipmentName }}</p>
                      <p v-if="selectedExercise.equipmentType" class="text-xs text-stone-400 mt-0.5">
                        {{ selectedExercise.equipmentType }}</p>
                    </div>
                    <template v-if="getFullEquipment(selectedExercise.equipmentId)">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shrink-0 border"
                        :class="statusClasses(getFullEquipment(selectedExercise.equipmentId).status)">
                        {{ statusLabel(getFullEquipment(selectedExercise.equipmentId).status) }}
                      </span>
                    </template>
                  </div>
                  <div v-if="getFullEquipment(selectedExercise.equipmentId)?.lastMaintenance"
                    class="mt-3 pt-3 border-t border-amber-200 flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="text-xs text-stone-400">
                      Último mantenimiento:
                      <span
                        class="font-semibold text-stone-700">{{ formatDate(getFullEquipment(selectedExercise.equipmentId).lastMaintenance) }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Detalles -->
              <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-2">
                  <span class="inline-block h-px flex-1 bg-gradient-to-r from-amber-200 to-transparent" />
                  Detalles
                </p>
                <div class="grid grid-cols-2 gap-2">
                  <div class="bg-amber-50/50 rounded-2xl border border-amber-100 px-4 py-3">
                    <p class="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Grupo muscular</p>
                    <p class="text-sm font-semibold text-stone-800">{{ selectedExercise.muscleGroup || '—' }}</p>
                  </div>
                  <div class="bg-amber-50/50 rounded-2xl border border-amber-100 px-4 py-3">
                    <p class="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Dificultad</p>
                    <p class="text-sm font-semibold text-stone-800">{{ difficultyLabel(selectedExercise.difficulty) }}
                    </p>
                  </div>
                  <div v-if="selectedExercise.createdAt"
                    class="bg-amber-50/50 rounded-2xl border border-amber-100 px-4 py-3">
                    <p class="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Creado</p>
                    <p class="text-sm font-semibold text-stone-800">{{ formatDate(selectedExercise.createdAt) }}</p>
                  </div>
                  <div v-if="selectedExercise.updatedAt"
                    class="bg-amber-50/50 rounded-2xl border border-amber-100 px-4 py-3">
                    <p class="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Actualizado</p>
                    <p class="text-sm font-semibold text-stone-800">{{ formatDate(selectedExercise.updatedAt) }}</p>
                  </div>
                </div>
              </div>

              <!-- Video -->
              <div v-if="selectedExercise.video">
                <p class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-2">
                  <span class="inline-block h-px flex-1 bg-gradient-to-r from-amber-200 to-transparent" />
                  Video de referencia
                </p>
                <div class="rounded-2xl overflow-hidden border border-amber-200 shadow-sm">
                  <CustomVideoPlayer :video-src="selectedExercise.video" />
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-amber-50/40 border-t border-amber-100 flex justify-end gap-2">
              <button @click="openEditModal(selectedExercise); closeDetail()"
                class="inline-flex items-center gap-2 border-2 border-amber-300 text-amber-700 hover:bg-amber-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              <button @click="closeDetail"
                class="relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 active:scale-95 group">
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span class="relative">Cerrar</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- MODAL: Confirmar eliminación                              -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showDeleteModal && deletingExercise" class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeDeleteModal">
        <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
        <Transition enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0">
          <div v-if="showDeleteModal"
            class="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20 border border-rose-200/60">
            <!-- Borde rojo superior -->
            <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-400 via-rose-500 to-rose-400" />

            <!-- Header -->
            <div class="bg-rose-50 border-b border-rose-100 px-6 py-5 flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
                <svg class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 class="font-serif text-lg font-bold text-stone-800">Eliminar ejercicio</h2>
                <p class="text-xs text-stone-400 mt-0.5">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-5 space-y-4">
              <div class="bg-amber-50/60 rounded-2xl border border-amber-200 p-4">
                <p class="text-xs text-stone-400 uppercase tracking-widest mb-1">Ejercicio a eliminar</p>
                <p class="font-serif text-base font-bold text-stone-900">{{ deletingExercise.name }}</p>
                <div class="flex items-center gap-2 mt-2 flex-wrap">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border"
                    :class="difficultyClasses(deletingExercise.difficulty)">
                    {{ difficultyLabel(deletingExercise.difficulty) }}
                  </span>
                  <span v-if="deletingExercise.muscleGroup" class="text-xs text-stone-400">·
                    {{ deletingExercise.muscleGroup }}</span>
                </div>
              </div>

              <p class="text-sm text-stone-600 leading-relaxed">Si eliminas este ejercicio, se perderá permanentemente:
              </p>
              <ul class="space-y-2">
                <li
                  v-for="item in ['El video de referencia asociado', 'El historial de cambios realizados', 'Las rutinas que incluyan este ejercicio']"
                  :key="item" class="flex items-start gap-2.5">
                  <svg class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span class="text-sm text-stone-500">{{ item }}</span>
                </li>
              </ul>

              <div class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <svg class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-xs text-amber-800 leading-relaxed">
                  <strong>¿Estás seguro?</strong> Una vez eliminado, no podrás recuperar este ejercicio ni su
                  información.
                </p>
              </div>

              <div v-if="deleteError"
                class="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
                <svg class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p class="text-xs text-rose-700">{{ deleteError }}</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-stone-50/60 border-t border-stone-100 flex items-center justify-end gap-2">
              <button type="button" @click="closeDeleteModal" :disabled="isSubmittingDelete"
                class="inline-flex items-center gap-2 border-2 border-stone-200 text-stone-600 hover:border-amber-200 hover:bg-amber-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                Cancelar
              </button>
              <button type="button" @click="confirmDelete" :disabled="isSubmittingDelete"
                class="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                <svg v-if="isSubmittingDelete" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {{ isSubmittingDelete ? 'Eliminando…' : 'Sí, eliminar ejercicio' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>