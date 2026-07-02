<script setup>
import axiosInstance from '@/infrastructure/http/axiosInstance'
import axiosExercise from '@/features/exercise/infrastructure/http/axiosExercise'
import { useEquipmentStore } from '@/stores/equipmentStore.js'
import BaseErrorDisplay from '@/utils/components/BaseErrorDisplay.vue'
import BaseLoading from '@/utils/components/BaseLoading.vue'
import CustomVideoPlayer from '@/utils/components/CustomVideoPlayer.vue'
import EmptyBox from '@/utils/components/EmptyBox.vue'
import { useVideoUpload, SupabaseVideoRepository, getSupabaseVideoConfig } from '@/features/video'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'

// ============================================================
// STORE
// ============================================================

// Inicializar el store de equipos
const equipmentStore = useEquipmentStore()

// Extraer estado reactivo con storeToRefs (mejora la reactividad)
const { equipmentList, loading, error } = storeToRefs(equipmentStore)

// ============================================================
// STATE - SEARCH
// ============================================================

// Término de búsqueda para filtrar equipos
const searchQuery = ref('')

// ============================================================
// STATE - MODALS
// ============================================================

// Estados de visibilidad de los modales
const isEditModalOpen = ref(false)
const isViewModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isAddExerciseModalOpen = ref(false)

// Equipo seleccionado para operaciones
const selectedEquipment = ref(null)

// Formulario de edición
const editForm = ref({
  name: '',
  type: '',
  status: '',
})

// ============================================================
// STATE - EXERCISE FORM
// ============================================================

// Formulario para agregar ejercicio
const exerciseForm = ref({
  id: '',
  name: '',
  muscle_group: '',
  difficulty: 'BEGINNER',
})

// Estado de carga del formulario
const isSubmittingExercise = ref(false)
const exerciseError = ref(null)

// ============================================================
// STATE - EQUIPMENT EXERCISES (para el modal de detalle)
// ============================================================
const equipmentExercises = ref([])
const isLoadingExercises = ref(false)
const exerciseLoadError = ref(null)

// ============================================================
// STATE - DELETE EXERCISE MODAL
// ============================================================
const isDeleteExerciseModalOpen = ref(false)
const exerciseToDelete = ref(null)
const isDeletingExercise = ref(false)

// ============================================================
// STATE - LOADING (para subida a Supabase + API)
// ============================================================
const isLoading = ref(false)
const loadingText = ref('')

// ============================================================
// STATE - VIDEO UPLOAD ERROR
// ============================================================
const videoUploadError = ref({
  show: false,
  title: 'Error al subir el video',
  message: 'No se pudo subir el video al almacenamiento. Por favor, intenta nuevamente.',
  isRetrying: false
})

// ============================================================
// SUPABASE VIDEO UPLOAD SETUP
// ============================================================
const repository = new SupabaseVideoRepository(getSupabaseVideoConfig())

// Usuario temporal (en producción obtener del auth store)
const currentUserId = ref('user-system-001')

const {
  state: uploadState,
  uploadVideoOnly,
  resetState: resetUploadState
} = useVideoUpload({
  repository,
  currentUserId: currentUserId.value
})

// ============================================================
// STATE - VIDEO FILE UPLOAD
// ============================================================

// Archivo de video seleccionado
const selectedVideoFile = ref(null)
const videoFilePreview = ref(null)

// Opciones para selects
const muscleGroupOptions = [
  'Pectorales',
  'Espalda',
  'Hombros',
  'Bíceps',
  'Tríceps',
  'Abdomen',
  'Cuádriceps',
  'Isquiotibiales',
  'Glúteos',
  'Pantorrillas',
  'Antebrazos',
  'Trapecios',
  'Cardiovascular',
  'Corazón',
  'Pulmones',
]

const difficultyOptions = [
  { value: 'BEGINNER', label: 'Principiante' },
  { value: 'INTERMEDIATE', label: 'Intermedio' },
  { value: 'ADVANCED', label: 'Avanzado' },
]

// ============================================================
// COMPUTED - FILTERED LIST
// ============================================================

/**
 * Lista filtrada según el término de búsqueda
 * Busca en nombre, tipo, ID y estado
 */
const filteredEquipmentList = computed(() => {
  if (!searchQuery.value.trim()) {
    return equipmentList.value
  }

  const query = searchQuery.value.toLowerCase().trim()

  return equipmentList.value.filter((equipment) => {
    return (
      equipment.name?.toLowerCase().includes(query) ||
      equipment.type?.toLowerCase().includes(query) ||
      equipment.id?.toLowerCase().includes(query) ||
      equipment.status?.toLowerCase().includes(query)
    )
  })
})

// ============================================================
// LIFECYCLE HOOKS
// ============================================================

// Cargar equipos cuando el componente se monta
onMounted(async () => {
  await equipmentStore.fetchEquipment()
})

// ============================================================
// COMPUTED HELPERS
// ============================================================

/**
 * Formatea la fecha de último mantenimiento a DD/MM/YYYY
 * @param {string} dateString - Fecha en formato ISO o similar
 * @returns {string} Fecha formateada
 */
const formatDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Obtiene las clases CSS para el badge de estado
 * @param {string} status - Estado del equipo
 * @returns {string} Clases CSS de Tailwind
 */
const getStatusBadgeClass = (status) => {
  const statusMap = {
    'Active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Inactive': 'bg-rose-100 text-rose-700 border-rose-200',
    'Maintenance': 'bg-amber-100 text-amber-700 border-amber-200',
    'active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'inactive': 'bg-rose-100 text-rose-700 border-rose-200',
    'maintenance': 'bg-amber-100 text-amber-700 border-amber-200',
  }
  return statusMap[status] || 'bg-slate-100 text-slate-700 border-slate-200'
}

/**
 * Obtiene el texto formateado del estado
 * @param {string} status - Estado del equipo
 * @returns {string} Texto formateado
 */
const getStatusLabel = (status) => {
  const labelMap = {
    'Active': 'Activo',
    'Inactive': 'Inactivo',
    'Maintenance': 'En mantenimiento',
    'active': 'Activo',
    'inactive': 'Inactivo',
    'maintenance': 'En mantenimiento',
  }
  return labelMap[status] || status
}

// ============================================================
// MODAL ACTIONS
// ============================================================

/**
 * Abre el modal de edición con los datos del equipo
 * @param {Object} equipment - Equipo a editar
 */
const openEditModal = (equipment) => {
  selectedEquipment.value = equipment
  editForm.value = {
    name: equipment.name,
    type: equipment.type,
    status: equipment.status,
  }
  isEditModalOpen.value = true
}

/**
 * Cierra el modal de edición
 */
const closeEditModal = () => {
  isEditModalOpen.value = false
  selectedEquipment.value = null
}

/**
 * Guarda los cambios del equipo editado
 */
const saveEdit = async () => {
  // Aquí iría la llamada al API para actualizar
  console.log('Guardando cambios:', selectedEquipment.value.id, editForm.value)
  // Simulación de éxito
  closeEditModal()
  // Recargar lista
  await equipmentStore.fetchEquipment()
}

/**
 * Abre el modal de vista de detalle
 * @param {Object} equipment - Equipo a visualizar
 */
const openViewModal = async (equipment) => {
  selectedEquipment.value = equipment
  isViewModalOpen.value = true
  // Cargar ejercicios vinculados al equipo
  await fetchEquipmentExercises(equipment.id)
}

/**
 * Cierra el modal de vista
 */
const closeViewModal = () => {
  isViewModalOpen.value = false
  selectedEquipment.value = null
  equipmentExercises.value = []
  exerciseLoadError.value = null
}

/**
 * Abre el modal de confirmación de eliminación
 * @param {Object} equipment - Equipo a eliminar
 */
const openDeleteModal = (equipment) => {
  selectedEquipment.value = equipment
  isDeleteModalOpen.value = true
}

/**
 * Cierra el modal de eliminación
 */
const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  selectedEquipment.value = null
}

/**
 * Obtiene los ejercicios vinculados a un equipo
 * @param {string} equipmentId - ID del equipo
 */
const fetchEquipmentExercises = async (equipmentId) => {
  isLoadingExercises.value = true
  exerciseLoadError.value = null
  equipmentExercises.value = []

  try {
    const { data } = await axiosExercise.get('', {
      params: { equipment_id: equipmentId }
    })
    equipmentExercises.value = data?.data || data || []
  } catch (err) {
    exerciseLoadError.value = err.response?.data?.error || err.message || 'Error al cargar ejercicios'
    console.error('[EquipmentPage] Error al cargar ejercicios del equipo:', err)
  } finally {
    isLoadingExercises.value = false
  }
}

/**
 * Abre el modal de confirmación para eliminar ejercicio
 */
const openDeleteExerciseModal = (exercise) => {
  exerciseToDelete.value = exercise
  isDeleteExerciseModalOpen.value = true
}

/**
 * Cierra el modal de confirmación para eliminar ejercicio
 */
const closeDeleteExerciseModal = () => {
  isDeleteExerciseModalOpen.value = false
  exerciseToDelete.value = null
}

/**
 * Elimina un ejercicio vinculado al equipo
 */
const deleteExercise = async () => {
  if (!exerciseToDelete.value?.id) return

  isDeletingExercise.value = true

  try {
    await axiosExercise.delete(`/${exerciseToDelete.value.id}`)

    // Recargar la lista de ejercicios
    if (selectedEquipment.value?.id) {
      await fetchEquipmentExercises(selectedEquipment.value.id)
    }

    closeDeleteExerciseModal()
    console.log('Ejercicio eliminado exitosamente')
  } catch (err) {
    console.error('[EquipmentPage] Error al eliminar ejercicio:', err)
    exerciseLoadError.value = err.response?.data?.error || err.message || 'Error al eliminar el ejercicio'
    closeDeleteExerciseModal()
  } finally {
    isDeletingExercise.value = false
  }
}

/**
 * Obtiene el color del badge de dificultad
 * @param {string} difficulty - Nivel de dificultad
 * @returns {string} Clases CSS
 */
const getDifficultyBadgeClass = (difficulty) => {
  const map = {
    'BEGINNER': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'INTERMEDIATE': 'bg-amber-100 text-amber-700 border-amber-200',
    'ADVANCED': 'bg-rose-100 text-rose-700 border-rose-200',
  }
  return map[difficulty] || 'bg-slate-100 text-slate-700 border-slate-200'
}

/**
 * Obtiene el label de dificultad
 * @param {string} difficulty - Nivel de dificultad
 * @returns {string} Texto formateado
 */
const getDifficultyLabel = (difficulty) => {
  const map = {
    'BEGINNER': 'Principiante',
    'INTERMEDIATE': 'Intermedio',
    'ADVANCED': 'Avanzado',
  }
  return map[difficulty] || difficulty
}

/**
 * Confirma la eliminación del equipo
 */
const confirmDelete = async () => {
  // Aquí iría la llamada al API para eliminar
  console.log('Eliminando equipo:', selectedEquipment.value.id)
  // Simulación de éxito
  closeDeleteModal()
  // Recargar lista
  await equipmentStore.fetchEquipment()
}

// ============================================================
// EXERCISE FORM ACTIONS
// ============================================================

/**
 * Abre el modal para agregar ejercicio al equipo seleccionado
 */
const openAddExerciseModal = () => {
  // Generar ID de ejercicio automáticamente (timestamp + random)
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  exerciseForm.value.id = `EX${timestamp}${random}`

  isAddExerciseModalOpen.value = true
}

/**
 * Maneja la selección de archivo de video
 */
const onVideoFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validar tipo de archivo
  const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm']
  if (!allowedTypes.includes(file.type)) {
    exerciseError.value = 'Tipo de archivo no válido. Use MP4, MOV, AVI o WebM.'
    return
  }

  // Validar tamaño (max 100MB)
  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    exerciseError.value = 'El archivo excede el tamaño máximo de 100MB.'
    return
  }

  exerciseError.value = null
  selectedVideoFile.value = file

  // Crear preview URL
  videoFilePreview.value = URL.createObjectURL(file)
}

/**
 * Elimina el archivo de video seleccionado
 */
const removeVideoFile = () => {
  if (videoFilePreview.value) {
    URL.revokeObjectURL(videoFilePreview.value)
  }
  selectedVideoFile.value = null
  videoFilePreview.value = null
}

/**
 * Maneja el drop de archivo de video
 */
const onVideoFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (!file) return

  // Crear un evento sintético para reutilizar onVideoFileChange
  const syntheticEvent = { target: { files: [file] } }
  onVideoFileChange(syntheticEvent)
}

/**
 * Cierra el modal de agregar ejercicio
 */
const closeAddExerciseModal = () => {
  isAddExerciseModalOpen.value = false
  resetExerciseForm()
}

/**
 * Resetea el formulario de ejercicio
 */
const resetExerciseForm = () => {
  exerciseForm.value = {
    id: '',
    name: '',
    muscle_group: '',
    difficulty: 'BEGINNER',
  }
  exerciseError.value = null

  // Reset de archivo de video
  selectedVideoFile.value = null
  videoFilePreview.value = null

  // Reset del estado de subida de Supabase
  resetUploadState()
}

/**
 * Envía el formulario de ejercicio al backend
 * Flujo: 1) Subir video a Supabase Storage (solo storage, sin BD) → 2) Enviar URL a API
 */
const submitExercise = async () => {
  if (!selectedEquipment.value?.id) {
    exerciseError.value = 'No se ha seleccionado un equipo válido'
    return
  }

  // Validar campos requeridos
  if (!exerciseForm.value.name || !exerciseForm.value.muscle_group) {
    exerciseError.value = 'Complete todos los campos obligatorios'
    return
  }

  // Mostrar loading con BaseLoading
  isLoading.value = true
  loadingText.value = selectedVideoFile.value ? 'Subiendo video...' : 'Guardando ejercicio...'

  let videoUrl = null

  try {
    // PASO 1: Subir video a Supabase Storage (solo storage, sin crear registro en BD)
    if (selectedVideoFile.value) {
      loadingText.value = 'Subiendo video a almacenamiento...'

      try {
        // Crear payload para subida
        const uploadPayload = {
          title: `Ejercicio: ${exerciseForm.value.name}`,
          description: `Video del ejercicio ${exerciseForm.value.name} para equipo ${selectedEquipment.value.name}`,
          file: selectedVideoFile.value
        }

        // Subir video con tracking de progreso (solo a storage, sin tabla videos)
        const uploadResult = await uploadVideoOnly(uploadPayload)

        if (!uploadResult) {
          throw new Error(uploadState.error || 'Error al subir el video')
        }

        videoUrl = uploadResult.url
        console.log('[EquipmentPage] Video subido a Supabase Storage:', videoUrl)
      } catch (uploadErr) {
        console.error('[EquipmentPage] Error al subir video a Supabase:', uploadErr)
        videoUploadError.value.show = true
        videoUploadError.value.message = uploadErr.message || 'No se pudo subir el video al almacenamiento. Por favor, intenta nuevamente.'
        isLoading.value = false
        return // Detener el proceso si falla la subida del video
      }
    }

    // PASO 2: Enviar datos del ejercicio a la API con la URL del video
    loadingText.value = 'Guardando ejercicio...'

    const exerciseData = {
      equipmentId: selectedEquipment.value.id,
      name: exerciseForm.value.name,
      muscleGroup: exerciseForm.value.muscle_group,
      difficulty: exerciseForm.value.difficulty,
      video: videoUrl // URL de Supabase Storage o null si no hay video
    }

    await axiosExercise.post('', exerciseData)

    console.log('[EquipmentPage] Ejercicio guardado exitosamente en API')

    // Ocultar error si existía previamente
    videoUploadError.value.show = false

    // Recargar la lista de ejercicios del equipo
    if (selectedEquipment.value?.id) {
      await fetchEquipmentExercises(selectedEquipment.value.id)
    }

    // Cerrar modales y resetear
    closeAddExerciseModal()
    resetUploadState()

  } catch (err) {
    console.error('[EquipmentPage] Error en proceso de guardado:', err)
    exerciseError.value = err.response?.data?.error || err.message || 'Error al crear el ejercicio'

    // Si falló después de subir el video, informar pero no perder el error
    if (videoUrl) {
      console.warn('[EquipmentPage] El video se subió a Storage pero falló el registro en API:', videoUrl)
    }
  } finally {
    isLoading.value = false
    videoUploadError.value.isRetrying = false
  }
}

/**
 * Maneja el reintento de subida de video
 */
const retryVideoUpload = () => {
  videoUploadError.value.isRetrying = true
  videoUploadError.value.show = false
  // Reintentar todo el proceso
  submitExercise()
}

/**
 * Cierra el modal de error de subida de video
 */
const closeVideoUploadError = () => {
  videoUploadError.value.show = false
  videoUploadError.value.isRetrying = false
  isLoading.value = false
  // Resetear el archivo de video seleccionado para permitir seleccionar otro
  removeVideoFile()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-stone-100 py-8 px-4 sm:px-6 lg:px-8">

    <!-- Decoradores globales de fondo -->
    <div class="pointer-events-none fixed right-0 top-0 opacity-10 -z-10">
      <svg width="400" height="300" viewBox="0 0 400 300" fill="none">
        <circle cx="360" cy="-30" r="180" fill="#f59e0b" />
        <circle cx="310" cy="60" r="90" fill="#ea580c" />
      </svg>
    </div>
    <div class="pointer-events-none fixed bottom-0 left-0 opacity-5 -z-10">
      <svg width="260" height="200" viewBox="0 0 260 200" fill="none">
        <circle cx="0" cy="200" r="150" fill="#f59e0b" />
      </svg>
    </div>

    <!-- ── Header ── -->
    <div class="max-w-6xl mx-auto mb-8">
      <div
        class="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-white/80 backdrop-blur-sm px-8 py-6 shadow-xl shadow-amber-100/60">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
        <div class="pointer-events-none absolute right-0 top-0 opacity-10">
          <svg width="220" height="140" viewBox="0 0 220 140" fill="none">
            <circle cx="200" cy="-10" r="100" fill="#f59e0b" />
            <circle cx="160" cy="40" r="55" fill="#ea580c" />
          </svg>
        </div>
        <div class="relative flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 class="font-serif text-2xl font-bold text-stone-800">Lista de Equipos</h1>
            <p class="text-sm text-stone-400 mt-0.5">Gestiona el inventario de equipos del gimnasio</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Estado: cargando ── -->
    <div v-if="loading" class="max-w-6xl mx-auto">
      <div
        class="flex flex-col items-center justify-center py-16 rounded-3xl border border-amber-200/60 bg-white/70 backdrop-blur-sm shadow-xl shadow-amber-100/40">
        <div class="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p class="text-stone-500 font-medium">Cargando equipos...</p>
      </div>
    </div>

    <!-- ── Estado: error ── -->
    <div v-else-if="error" class="max-w-6xl mx-auto">
      <div class="relative overflow-hidden rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-xl">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/60 to-transparent" />
        <div
          class="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-300/40">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="font-serif text-lg font-bold text-stone-800 mb-2">Error al cargar</h3>
        <p class="text-rose-600 text-sm mb-5">{{ error }}</p>
        <button @click="equipmentStore.fetchEquipment()"
          class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 transition-all duration-200 active:scale-95">
          Reintentar
        </button>
      </div>
    </div>

    <!-- ── Estado: vacío ── -->
    <div v-else-if="equipmentList.length === 0" class="max-w-6xl mx-auto">
      <div
        class="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 p-10 text-center shadow-xl shadow-amber-100/40">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div class="relative inline-flex mb-5">
          <div
            class="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-lg scale-110" />
          <div
            class="relative w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 ring-4 ring-amber-100">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        <h3 class="font-serif text-lg font-bold text-stone-800 mb-2">No hay equipos registrados</h3>
        <p class="text-stone-400 text-sm mb-6">La lista está vacía. Agrega equipos para comenzar.</p>
        <button @click="equipmentStore.fetchEquipment()"
          class="px-5 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-all duration-200">
          Recargar
        </button>
      </div>
    </div>

    <!-- ── Tabla de equipos ── -->
    <div v-else class="max-w-6xl mx-auto space-y-4">

      <!-- Barra de búsqueda -->
      <div
        class="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-white/80 backdrop-blur-sm p-4 shadow-lg shadow-amber-100/40">
        <div class="relative max-w-md">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input v-model="searchQuery" type="text" placeholder="Buscar por nombre, tipo, ID o estado..."
            class="block w-full pl-10 pr-10 py-2.5 border-2 border-amber-200/60 rounded-xl bg-amber-50/40 placeholder-stone-400 text-stone-700 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200" />
          <button v-if="searchQuery" @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-amber-500 transition-colors">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p v-if="searchQuery" class="mt-2 text-xs text-stone-400">
          Mostrando
          <span class="font-semibold text-amber-600">{{ filteredEquipmentList.length }}</span>
          de
          <span class="font-semibold text-stone-600">{{ equipmentList.length }}</span>
          equipos
        </p>
      </div>

      <!-- Tabla -->
      <div
        class="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 backdrop-blur-sm shadow-xl shadow-amber-100/40">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-amber-100 bg-amber-50/60">
                <th class="px-6 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">ID</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Nombre
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Tipo</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Estado
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Último
                  Mantenimiento</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-amber-50">
              <tr v-for="equipment in filteredEquipmentList" :key="equipment.id"
                class="group hover:bg-amber-50/50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-xs font-mono text-stone-400 tracking-wider">
                  {{ equipment.id }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-stone-800 group-hover:text-amber-700 transition-colors duration-150">
                  {{ equipment.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    {{ equipment.type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', getStatusBadgeClass(equipment.status)]">
                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {{ getStatusLabel(equipment.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                  {{ formatDate(equipment.lastMaintenance) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-1.5">
                    <button @click="openViewModal(equipment)"
                      class="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200 border border-transparent hover:border-amber-200"
                      title="Ver detalle">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button @click="openEditModal(equipment)"
                      class="p-2 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 border border-transparent hover:border-orange-200"
                      title="Editar equipo">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button @click="openDeleteModal(equipment)"
                      class="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-200"
                      title="Eliminar equipo">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer tabla -->
        <div class="px-6 py-4 bg-amber-50/40 border-t border-amber-100 flex items-center justify-between">
          <p class="text-xs text-stone-400">
            Total:
            <span class="font-bold text-amber-600 ml-1">{{ filteredEquipmentList.length }}</span>
            <span class="text-stone-400"> equipos</span>
          </p>
          <div class="flex items-center gap-1.5">
            <span class="inline-block h-2 w-2 rounded-sm bg-gradient-to-br from-amber-400 to-orange-500" />
            <span class="text-xs text-stone-400">Inventario activo</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════ -->
    <!-- MODAL: EDITAR EQUIPO -->
    <!-- ══════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="isEditModalOpen" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-stone-900/50 backdrop-blur-sm" @click="closeEditModal" />
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20">

            <!-- Línea de acento -->
            <div
              class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            <!-- Header -->
            <div class="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="rounded-xl bg-white/20 p-2">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 class="font-serif text-xl font-bold text-white">Editar Equipo</h3>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-6 space-y-4">
              <div class="space-y-1.5">
                <label for="edit-name" class="block text-sm font-semibold text-stone-700">Nombre del equipo</label>
                <input id="edit-name" v-model="editForm.name" type="text"
                  class="w-full px-4 py-2.5 bg-amber-50/40 border-2 border-amber-200/60 rounded-xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200"
                  placeholder="Ej: Cinta de correr Pro" />
              </div>
              <div class="space-y-1.5">
                <label for="edit-type" class="block text-sm font-semibold text-stone-700">Tipo</label>
                <div class="relative">
                  <select id="edit-type" v-model="editForm.type"
                    class="w-full px-4 py-2.5 bg-amber-50/40 border-2 border-amber-200/60 rounded-xl text-sm text-stone-700 appearance-none focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200 cursor-pointer">
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Fuerza</option>
                    <option value="Flexibility">Flexibilidad</option>
                    <option value="Functional">Funcional</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div class="space-y-1.5">
                <label for="edit-status" class="block text-sm font-semibold text-stone-700">Estado</label>
                <div class="relative">
                  <select id="edit-status" v-model="editForm.status"
                    class="w-full px-4 py-2.5 bg-amber-50/40 border-2 border-amber-200/60 rounded-xl text-sm text-stone-700 appearance-none focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200 cursor-pointer">
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="maintenance">En mantenimiento</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="bg-amber-50/40 border-t border-amber-100 px-6 py-4 flex flex-row-reverse gap-3">
              <button @click="saveEdit"
                class="relative overflow-hidden inline-flex justify-center items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all duration-300 group active:scale-95">
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span class="relative">Guardar cambios</span>
              </button>
              <button @click="closeEditModal"
                class="inline-flex justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-stone-600 bg-white border-2 border-stone-200 hover:border-amber-200 hover:bg-amber-50 transition-all duration-200 active:scale-95">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════════════════════════ -->
    <!-- MODAL: VER DETALLE DEL EQUIPO -->
    <!-- ══════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="isViewModalOpen" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :leave="{ opacity: 0 }"
          :transition="{ duration: 0.3 }" class="fixed inset-0 bg-stone-900/50 backdrop-blur-sm"
          @click="closeViewModal" />

        <div class="flex min-h-full items-center justify-center p-4">
          <div v-motion :initial="{ opacity: 0, scale: 0.9, y: 20 }" :enter="{ opacity: 1, scale: 1, y: 0 }"
            :leave="{ opacity: 0, scale: 0.9, y: 20 }" :transition="{ duration: 0.3, ease: 'easeOut' }"
            class="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20">

            <div
              class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            <!-- Header -->
            <div class="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div v-motion :initial="{ scale: 0 }" :enter="{ scale: 1 }"
                    :transition="{ delay: 0.2, type: 'spring', stiffness: 200 }" class="rounded-xl bg-white/20 p-2">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 v-motion :initial="{ opacity: 0, x: -10 }" :enter="{ opacity: 1, x: 0 }"
                      :transition="{ delay: 0.3 }" class="font-serif text-xl font-bold text-white">Detalle del Equipo
                    </h3>
                    <p v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :transition="{ delay: 0.4 }"
                      class="text-amber-100 text-sm">{{ selectedEquipment?.name }}</p>
                  </div>
                </div>
                <button @click="closeViewModal"
                  class="p-2 text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-6 max-h-[70vh] overflow-y-auto" v-if="selectedEquipment">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                <!-- Columna 1 -->
                <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
                  :transition="{ delay: 0.3 }">
                  <h4
                    class="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Información del Equipo
                  </h4>
                  <div class="space-y-2.5">
                    <div class="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                      <span class="text-xs text-stone-400 block mb-0.5 uppercase tracking-wider">ID</span>
                      <span class="text-sm font-mono font-semibold text-stone-700">{{ selectedEquipment.id }}</span>
                    </div>
                    <div class="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                      <span class="text-xs text-stone-400 block mb-0.5 uppercase tracking-wider">Nombre</span>
                      <span class="text-sm font-semibold text-stone-800">{{ selectedEquipment.name }}</span>
                    </div>
                    <div class="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                      <span class="text-xs text-stone-400 block mb-0.5 uppercase tracking-wider">Tipo</span>
                      <span
                        class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {{ selectedEquipment.type }}
                      </span>
                    </div>
                    <div class="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                      <span class="text-xs text-stone-400 block mb-0.5 uppercase tracking-wider">Estado</span>
                      <span
                        :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', getStatusBadgeClass(selectedEquipment.status)]">
                        <span class="w-1.5 h-1.5 rounded-full bg-current" />
                        {{ getStatusLabel(selectedEquipment.status) }}
                      </span>
                    </div>
                    <div class="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                      <span class="text-xs text-stone-400 block mb-0.5 uppercase tracking-wider">Último
                        Mantenimiento</span>
                      <span
                        class="text-sm font-semibold text-stone-800">{{ formatDate(selectedEquipment.lastMaintenance) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Columna 2 -->
                <div v-motion :initial="{ opacity: 0, x: 20 }" :enter="{ opacity: 1, x: 0 }"
                  :transition="{ delay: 0.4 }">
                  <h4
                    class="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Ejercicios Vinculados
                    <span v-if="!isLoadingExercises && equipmentExercises.length > 0"
                      class="ml-auto rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
                      {{ equipmentExercises.length }}
                    </span>
                  </h4>

                  <div v-if="isLoadingExercises"
                    class="flex items-center justify-center py-8 bg-amber-50/40 rounded-2xl border border-amber-100">
                    <div class="w-5 h-5 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                    <span class="ml-2.5 text-sm text-stone-400">Cargando ejercicios...</span>
                  </div>

                  <div v-else-if="exerciseLoadError" class="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                    <p class="text-sm text-rose-600 flex items-center gap-2">
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ exerciseLoadError }}
                    </p>
                  </div>

                  <div v-else-if="equipmentExercises.length === 0" class="py-2">
                    <EmptyBox title="Sin ejercicios" description="No hay ejercicios asignados a este equipo."
                      button-text="Agregar primer ejercicio" @action="openAddExerciseModal" />
                  </div>

                  <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-1">
                    <div v-for="(exercise, index) in equipmentExercises" :key="exercise.id" v-motion
                      :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
                      :transition="{ delay: 0.1 * index }"
                      class="p-3 bg-amber-50/50 rounded-xl border border-amber-100 hover:border-amber-300 hover:bg-amber-50 hover:shadow-sm transition-all duration-200">
                      <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-semibold text-stone-800 truncate">{{ exercise.name }}</p>
                          <div class="flex items-center gap-2 mt-1">
                            <span
                              class="text-xs text-stone-400">{{ exercise.muscleGroup || exercise.muscle_group }}</span>
                            <span class="text-amber-200">•</span>
                            <span
                              :class="['text-xs px-1.5 py-0.5 rounded-lg border font-medium', getDifficultyBadgeClass(exercise.difficulty)]">
                              {{ getDifficultyLabel(exercise.difficulty) }}
                            </span>
                          </div>
                        </div>
                        <a v-if="exercise.video || exercise.video_url" :href="exercise.video || exercise.video_url"
                          target="_blank" rel="noopener noreferrer"
                          class="flex-shrink-0 p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-100 rounded-xl transition-colors"
                          title="Ver video">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </a>
                        <button @click.stop="openDeleteExerciseModal(exercise)"
                          class="flex-shrink-0 p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                          title="Eliminar ejercicio">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botón agregar ejercicio -->
              <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" :transition="{ delay: 0.5 }"
                class="mt-6 pt-4 border-t border-amber-100">
                <button @click="openAddExerciseModal"
                  class="relative w-full overflow-hidden inline-flex justify-center items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all duration-300 active:scale-[0.98] group">
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <svg class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span class="relative">Agregar Ejercicio</span>
                </button>
              </div>
            </div>

            <!-- Footer -->
            <div class="bg-amber-50/40 border-t border-amber-100 px-6 py-4 flex justify-end">
              <button @click="closeViewModal"
                class="px-5 py-2.5 text-sm font-semibold text-stone-600 bg-white border-2 border-stone-200 rounded-xl hover:border-amber-200 hover:bg-amber-50 transition-all duration-200 active:scale-[0.98]">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════════════════════════ -->
    <!-- MODAL: AGREGAR EJERCICIO -->
    <!-- ══════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="isAddExerciseModalOpen" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :leave="{ opacity: 0 }"
          :transition="{ duration: 0.3 }" class="fixed inset-0 bg-stone-900/50 backdrop-blur-sm"
          @click="closeAddExerciseModal" />

        <div class="flex min-h-full items-center justify-center p-4">
          <div v-motion :initial="{ opacity: 0, scale: 0.9, y: 20 }" :enter="{ opacity: 1, scale: 1, y: 0 }"
            :leave="{ opacity: 0, scale: 0.9, y: 20 }" :transition="{ duration: 0.3, ease: 'easeOut' }"
            class="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20 max-h-[90vh] flex flex-col">

            <div
              class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

            <!-- Header -->
            <div class="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex-shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div v-motion :initial="{ scale: 0, rotate: -180 }" :enter="{ scale: 1, rotate: 0 }"
                    :transition="{ delay: 0.2, type: 'spring', stiffness: 200 }" class="rounded-xl bg-white/20 p-2">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 v-motion :initial="{ opacity: 0, x: -10 }" :enter="{ opacity: 1, x: 0 }"
                      :transition="{ delay: 0.3 }" class="font-serif text-xl font-bold text-white">Agregar Ejercicio
                    </h3>
                    <p v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :transition="{ delay: 0.4 }"
                      class="text-emerald-100 text-sm">Equipo: {{ selectedEquipment?.name }}</p>
                  </div>
                </div>
                <button @click="closeAddExerciseModal"
                  class="p-2 text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Error de subida de video a Supabase -->
            <div v-if="videoUploadError.show" class="mx-6 mt-4">
              <BaseErrorDisplay
                :title="videoUploadError.title"
                :message="videoUploadError.message"
                mode="container"
                action-text="Reintentar"
                show-secondary-action
                secondary-action-text="Cancelar"
                :is-retrying="videoUploadError.isRetrying"
                @retry="retryVideoUpload"
                @secondary-action="closeVideoUploadError"
              />
            </div>

            <div v-if="exerciseError" class="mx-6 mt-4">
              <BaseErrorDisplay :title="'Error al guardar el ejercicio'" :message="exerciseError" mode="container"
                action-text="Reintentar" @retry="submitExercise" />
            </div>

            <!-- Body -->
            <div class="px-6 py-6 space-y-5 overflow-y-auto flex-1">

              <!-- Fila 1: IDs -->
              <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" :transition="{ delay: 0.2 }"
                class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-sm font-semibold text-stone-700">ID del Equipo</label>
                  <input type="text" :value="selectedEquipment?.id" readonly
                    class="w-full px-4 py-2.5 bg-stone-100 border-2 border-stone-200 rounded-xl text-sm text-stone-400 font-mono cursor-not-allowed" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-sm font-semibold text-stone-700">ID del Ejercicio <span
                      class="text-orange-500">*</span></label>
                  <input v-model="exerciseForm.id" type="text"
                    class="w-full px-4 py-2.5 bg-amber-50/40 border-2 border-amber-200/60 rounded-xl text-sm text-stone-700 font-mono placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200"
                    placeholder="Ej: EX202601011234" />
                </div>
              </div>

              <!-- Nombre -->
              <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" :transition="{ delay: 0.3 }"
                class="space-y-1.5">
                <label class="block text-sm font-semibold text-stone-700">Nombre del Ejercicio <span
                    class="text-orange-500">*</span></label>
                <input v-model="exerciseForm.name" type="text"
                  class="w-full px-4 py-2.5 bg-amber-50/40 border-2 border-amber-200/60 rounded-xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200"
                  placeholder="Ej: Press de banca inclinado" required />
              </div>

              <!-- Fila 2: Grupo + Dificultad -->
              <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" :transition="{ delay: 0.4 }"
                class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-sm font-semibold text-stone-700">Grupo Muscular <span
                      class="text-orange-500">*</span></label>
                  <div class="relative">
                    <select v-model="exerciseForm.muscle_group"
                      class="w-full px-4 py-2.5 bg-amber-50/40 border-2 border-amber-200/60 rounded-xl text-sm text-stone-700 appearance-none focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200 cursor-pointer"
                      required>
                      <option value="" disabled>Selecciona un grupo</option>
                      <option v-for="group in muscleGroupOptions" :key="group" :value="group">{{ group }}</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="block text-sm font-semibold text-stone-700">Nivel de Dificultad <span
                      class="text-orange-500">*</span></label>
                  <div class="flex gap-2">
                    <button v-for="option in difficultyOptions" :key="option.value" type="button"
                      @click="exerciseForm.difficulty = option.value"
                      class="flex-1 px-2 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all duration-200"
                      :class="exerciseForm.difficulty === option.value
                        ? option.value === 'BEGINNER'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                          : option.value === 'INTERMEDIATE'
                            ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-sm'
                            : 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm'
                        : 'bg-stone-50 border-stone-200 text-stone-500 hover:border-amber-200 hover:bg-amber-50/40'">
                      {{ option.label }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Video -->
              <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" :transition="{ delay: 0.5 }"
                class="space-y-3">
                <label class="block text-sm font-semibold text-stone-700">
                  Video del Ejercicio
                  <span class="text-stone-400 font-normal text-xs ml-1">(opcional)</span>
                </label>

                <div v-if="!selectedVideoFile"
                  class="relative border-2 border-dashed border-amber-200 rounded-2xl p-6 text-center hover:border-amber-400 hover:bg-amber-50/40 transition-all duration-200 cursor-pointer group"
                  @click="$refs.videoFileInput.click()" @dragover.prevent="true" @drop.prevent="onVideoFileDrop">
                  <input ref="videoFileInput" type="file"
                    accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm" class="hidden"
                    @change="onVideoFileChange" />
                  <div
                    class="w-12 h-12 mx-auto mb-3 bg-amber-50 border border-amber-200 group-hover:bg-amber-100 rounded-2xl flex items-center justify-center transition-colors shadow-sm">
                    <svg class="w-6 h-6 text-amber-400 group-hover:text-amber-500 transition-colors" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <p class="text-sm font-medium text-stone-600 mb-1">
                    <span class="text-amber-600 group-hover:underline">Seleccionar archivo</span> o arrastrar aquí
                  </p>
                  <p class="text-xs text-stone-400">MP4, MOV, AVI o WebM (máx. 100MB)</p>
                </div>

                <div v-else class="space-y-3">
                  <div class="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div
                      class="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-stone-800 truncate">{{ selectedVideoFile.name }}</p>
                      <p class="text-xs text-stone-400">{{ (selectedVideoFile.size / (1024 * 1024)).toFixed(2) }} MB</p>
                    </div>
                    <button @click="removeVideoFile" type="button"
                      class="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div v-if="videoFilePreview" class="rounded-2xl overflow-hidden border border-amber-200 shadow-sm">
                    <CustomVideoPlayer :video-src="videoFilePreview" />
                  </div>
                  <button @click="$refs.videoFileInput.click()" type="button"
                    class="text-xs text-stone-400 hover:text-amber-600 flex items-center gap-1.5 transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Cambiar archivo
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" :transition="{ delay: 0.6 }"
              class="bg-amber-50/40 border-t border-amber-100 px-6 py-4 flex flex-row-reverse gap-3 flex-shrink-0">
              <button @click="submitExercise"
                :disabled="isSubmittingExercise || !exerciseForm.name || !exerciseForm.muscle_group"
                class="relative overflow-hidden inline-flex justify-center items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] group">
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <svg v-if="isSubmittingExercise" class="animate-spin h-4 w-4 relative" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <svg v-else class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="relative">{{ isSubmittingExercise ? 'Guardando...' : 'Guardar Ejercicio' }}</span>
              </button>
              <button @click="closeAddExerciseModal" :disabled="isSubmittingExercise"
                class="inline-flex justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-stone-600 bg-white border-2 border-stone-200 hover:border-amber-200 hover:bg-amber-50 transition-all duration-200 disabled:opacity-50 active:scale-[0.98]">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════════════════════════ -->
    <!-- LOADING: Subida Supabase + API (BaseLoading) -->
    <!-- ══════════════════════════════════════ -->
    <BaseLoading
      :is-loading="isLoading"
      :full-screen="true"
      type="spinner"
      color="text-amber-600"
      :text="loadingText"
    />

    <!-- ══════════════════════════════════════ -->
    <!-- MODAL: CONFIRMAR ELIMINACIÓN -->
    <!-- ══════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="isDeleteModalOpen" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" @click="closeDeleteModal" />

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20">

            <!-- Borde superior rojo -->
            <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-400 via-rose-500 to-rose-400" />

            <!-- Header -->
            <div class="bg-rose-50 px-6 py-5 border-b border-rose-100">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-rose-100 border border-rose-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 class="font-serif text-lg font-bold text-rose-800">¿Eliminar este equipo?</h3>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-6 space-y-4">
              <div v-if="selectedEquipment" class="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
                <p class="text-xs text-stone-400 uppercase tracking-widest mb-1">Equipo seleccionado</p>
                <p class="text-base font-bold text-stone-800">{{ selectedEquipment.name }}</p>
                <p class="text-xs font-mono text-stone-400 mt-0.5">{{ selectedEquipment.id }}</p>
              </div>

              <p class="text-sm text-stone-600 leading-relaxed">
                <strong class="text-rose-600">Esta acción no se puede deshacer.</strong>
                Una vez que elimines este equipo, toda su información será permanentemente borrada del sistema.
              </p>

              <div class="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <svg class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-xs text-amber-800 leading-relaxed">
                  Si solo necesitas dar de baja temporalmente el equipo, considera
                  <strong>cambiar su estado a "Inactivo"</strong> en lugar de eliminarlo permanentemente.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div class="bg-stone-50/60 border-t border-stone-100 px-6 py-4 flex flex-row-reverse gap-3">
              <button @click="confirmDelete"
                class="inline-flex justify-center items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 hover:shadow-xl transition-all duration-200 active:scale-95">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Sí, eliminar permanentemente
              </button>
              <button @click="closeDeleteModal"
                class="inline-flex justify-center items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-600 bg-white border-2 border-stone-200 hover:border-amber-200 hover:bg-amber-50 transition-all duration-200 active:scale-95">
                No, mantener el equipo
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════════════════════════ -->
    <!-- MODAL: CONFIRMAR ELIMINACIÓN DE EJERCICIO -->
    <!-- ══════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="isDeleteExerciseModalOpen" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :leave="{ opacity: 0 }"
          :transition="{ duration: 0.3 }" class="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
          @click="closeDeleteExerciseModal" />

        <div class="flex min-h-full items-center justify-center p-4">
          <div v-motion
            :initial="{ opacity: 0, scale: 0.9, y: 20 }"
            :enter="{ opacity: 1, scale: 1, y: 0 }"
            :leave="{ opacity: 0, scale: 0.9, y: 20 }"
            :transition="{ duration: 0.3, ease: 'easeOut' }"
            class="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20">

            <!-- Borde superior rojo -->
            <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-400 via-rose-500 to-rose-400" />

            <!-- Header -->
            <div class="bg-rose-50 px-6 py-5 border-b border-rose-100">
              <div class="flex items-center gap-3">
                <div v-motion
                  :initial="{ scale: 0, rotate: -180 }"
                  :enter="{ scale: 1, rotate: 0 }"
                  :transition="{ delay: 0.2, type: 'spring', stiffness: 200 }"
                  class="w-10 h-10 bg-rose-100 border border-rose-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 v-motion :initial="{ opacity: 0, x: -10 }" :enter="{ opacity: 1, x: 0 }"
                    :transition="{ delay: 0.3 }"
                    class="font-serif text-lg font-bold text-rose-800">¿Eliminar este ejercicio?</h3>
                  <p v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }"
                    :transition="{ delay: 0.4 }"
                    class="text-xs text-rose-500 mt-0.5">Esta acción es permanente e irreversible</p>
                </div>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-6 space-y-4">
              <!-- Info del ejercicio -->
              <div v-if="exerciseToDelete" v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{ opacity: 1, y: 0 }"
                :transition="{ delay: 0.3 }"
                class="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
                <p class="text-xs text-stone-400 uppercase tracking-widest mb-1">Ejercicio seleccionado</p>
                <p class="text-base font-bold text-stone-800">{{ exerciseToDelete.name }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-stone-400">{{ exerciseToDelete.muscleGroup || exerciseToDelete.muscle_group }}</span>
                  <span class="text-amber-200">•</span>
                  <span class="text-xs text-stone-400">{{ getDifficultyLabel(exerciseToDelete.difficulty) }}</span>
                </div>
              </div>

              <!-- Advertencia principal -->
              <p v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
                :transition="{ delay: 0.4 }"
                class="text-sm text-stone-600 leading-relaxed">
                <strong class="text-rose-600">Esta acción no se puede deshacer.</strong>
                Estás a punto de eliminar permanentemente este ejercicio vinculado al equipo
                <strong class="text-stone-800">{{ selectedEquipment?.name }}</strong>.
              </p>

              <!-- Consecuencias -->
              <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
                :transition="{ delay: 0.5 }"
                class="space-y-3">
                <p class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Consecuencias de esta acción:</p>

                <div class="space-y-2">
                  <div class="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                    <svg class="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p class="text-xs text-rose-700 leading-relaxed">
                      <strong>Historial de entrenamientos afectado:</strong> Los usuarios que completaron este ejercicio perderán ese registro de su progreso.
                    </p>
                  </div>

                  <div class="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                    <svg class="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p class="text-xs text-rose-700 leading-relaxed">
                      <strong>Rutinas personalizadas rotas:</strong> Si algún usuario tenía este ejercicio en su rutina personalizada, esa rutina quedará incompleta.
                    </p>
                  </div>

                  <div v-if="exerciseToDelete?.video || exerciseToDelete?.video_url"
                    class="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                    <svg class="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p class="text-xs text-rose-700 leading-relaxed">
                      <strong>Video tutorial eliminado:</strong> El video explicativo associado a este ejercicio también será removido permanentemente.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Consejo -->
              <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
                :transition="{ delay: 0.6 }"
                class="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <svg class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-xs text-amber-800 leading-relaxed">
                  <strong>Consejo:</strong> Si este ejercicio tiene errores menores o está desactualizado, considera
                  <strong class="text-amber-900">editarlo en su lugar</strong> para conservar el historial de datos y las rutinas existentes.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
              :transition="{ delay: 0.7 }"
              class="bg-stone-50/60 border-t border-stone-100 px-6 py-4 flex flex-row-reverse gap-3">
              <button @click="deleteExercise" :disabled="isDeletingExercise"
                class="inline-flex justify-center items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg v-if="isDeletingExercise" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {{ isDeletingExercise ? 'Eliminando...' : 'Sí, eliminar permanentemente' }}
              </button>
              <button @click="closeDeleteExerciseModal" :disabled="isDeletingExercise"
                class="inline-flex justify-center items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-600 bg-white border-2 border-stone-200 hover:border-amber-200 hover:bg-amber-50 transition-all duration-200 active:scale-95 disabled:opacity-50">
                No, mantener el ejercicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
