import { ref, reactive, computed } from 'vue'
import { ExerciseService, type Exercise } from '../../infrastructure/services/exerciseService'

export interface ExerciseEditForm {
  name: string
  muscle_group: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  video_url: string
}

export interface ExerciseEditState {
  isOpen: boolean
  isSaving: boolean
  isUploading: boolean
  error: string | null
  exercise: Exercise | null
  form: ExerciseEditForm
  hasChanges: boolean
  uploadProgress: number
}

const MUSCLE_GROUP_OPTIONS = [
  'Pectorales', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps',
  'Abdomen', 'Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Pantorrillas',
  'Antebrazos', 'Trapecios', 'Cardiovascular', 'Corazón', 'Pulmones',
]

const DIFFICULTY_OPTIONS = [
  { value: 'BEGINNER' as const, label: 'Principiante' },
  { value: 'INTERMEDIATE' as const, label: 'Intermedio' },
  { value: 'ADVANCED' as const, label: 'Avanzado' },
]

const MUSCLE_GROUP_BADGE_STYLES: Record<string, string> = {
  Pectorales: 'from-orange-400 to-red-500',
  Espalda: 'from-orange-500 to-red-600',
  Hombros: 'from-amber-400 to-orange-500',
  Bíceps: 'from-orange-400 to-red-500',
  Tríceps: 'from-amber-500 to-orange-600',
  Abdomen: 'from-orange-400 to-red-500',
  Cuádriceps: 'from-orange-500 to-red-600',
  Isquiotibiales: 'from-amber-400 to-orange-500',
  Glúteos: 'from-orange-400 to-red-500',
  Pantorrillas: 'from-amber-500 to-orange-600',
  Antebrazos: 'from-orange-400 to-red-500',
  Trapecios: 'from-orange-500 to-red-600',
  Cardiovascular: 'from-amber-400 to-orange-500',
  Corazón: 'from-orange-400 to-red-500',
  Pulmones: 'from-amber-500 to-orange-600',
}

const DIFFICULTY_BADGE_STYLES: Record<string, string> = {
  BEGINNER: 'from-yellow-300 to-amber-400',
  INTERMEDIATE: 'from-amber-400 to-yellow-500',
  ADVANCED: 'from-orange-400 to-amber-500',
}

export function useExerciseEdit() {
  const state = reactive<ExerciseEditState>({
    isOpen: false,
    isSaving: false,
    isUploading: false,
    error: null,
    exercise: null,
    form: { name: '', muscle_group: '', difficulty: 'BEGINNER', video_url: '' },
    hasChanges: false,
    uploadProgress: 0,
  })

  const originalForm = ref<ExerciseEditForm>({
    name: '', muscle_group: '', difficulty: 'BEGINNER', video_url: '',
  })

  const selectedVideoFile = ref<File | null>(null)
  const videoPreviewUrl = ref<string | null>(null)

  const muscleGroupOptions = MUSCLE_GROUP_OPTIONS
  const difficultyOptions = DIFFICULTY_OPTIONS

  const getMuscleGroupBadgeStyle = (group: string) =>
    MUSCLE_GROUP_BADGE_STYLES[group] || 'from-stone-400 to-stone-500'

  const getDifficultyBadgeStyle = (difficulty: string) =>
    DIFFICULTY_BADGE_STYLES[difficulty] || 'from-stone-400 to-stone-500'

  const getDifficultyLabel = (difficulty: string) =>
    DIFFICULTY_OPTIONS.find(d => d.value === difficulty)?.label || difficulty

  const currentVideoUrl = computed(() => {
    if (videoPreviewUrl.value) return videoPreviewUrl.value
    return state.form.video_url || state.exercise?.video_url || ''
  })

  const hasVideo = computed(() => !!currentVideoUrl.value)

  const isFormValid = computed(() =>
    state.form.name.trim().length > 0 &&
    state.form.muscle_group.length > 0
  )

  const checkChanges = () => {
    state.hasChanges =
      state.form.name !== originalForm.value.name ||
      state.form.muscle_group !== originalForm.value.muscle_group ||
      state.form.difficulty !== originalForm.value.difficulty ||
      state.form.video_url !== originalForm.value.video_url
  }

  const openModal = (exercise: Exercise) => {
    state.exercise = exercise
    state.form = {
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      difficulty: exercise.difficulty,
      video_url: exercise.video_url || '',
    }
    originalForm.value = { ...state.form }
    state.hasChanges = false
    state.error = null
    selectedVideoFile.value = null
    videoPreviewUrl.value = null
    state.isOpen = true
  }

  const closeModal = () => {
    state.isOpen = false
    state.exercise = null
    state.error = null
    state.isSaving = false
    state.isUploading = false
    selectedVideoFile.value = null
    if (videoPreviewUrl.value) {
      URL.revokeObjectURL(videoPreviewUrl.value)
      videoPreviewUrl.value = null
    }
  }

  const onVideoFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      state.error = 'Tipo de archivo no válido. Use MP4, MOV, AVI o WebM.'
      return
    }

    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      state.error = 'El archivo excede el tamaño máximo de 100MB.'
      return
    }

    state.error = null
    selectedVideoFile.value = file

    if (videoPreviewUrl.value) URL.revokeObjectURL(videoPreviewUrl.value)
    videoPreviewUrl.value = URL.createObjectURL(file)
    checkChanges()
  }

  const removeVideoFile = () => {
    selectedVideoFile.value = null
    if (videoPreviewUrl.value) {
      URL.revokeObjectURL(videoPreviewUrl.value)
      videoPreviewUrl.value = null
    }
    state.form.video_url = ''
    checkChanges()
  }

  const saveExercise = async (onSuccess?: () => void) => {
    if (!state.exercise || !isFormValid.value) return

    state.isSaving = true
    state.error = null

    try {
      let finalVideoUrl = state.form.video_url

      if (selectedVideoFile.value) {
        state.isUploading = true
        const { useVideoUpload, SupabaseVideoRepository, getSupabaseVideoConfig } = await import('@/features/video')
        const repository = new SupabaseVideoRepository(getSupabaseVideoConfig())
        const { uploadVideoOnly } = useVideoUpload({ repository, currentUserId: 'user-system-001' })

        const result = await uploadVideoOnly({
          title: `Ejercicio: ${state.form.name}`,
          description: `Video del ejercicio ${state.form.name}`,
          file: selectedVideoFile.value,
        })

        if (result?.url) {
          finalVideoUrl = result.url.trim()
        }
        state.isUploading = false
      }

      await ExerciseService.update(state.exercise.id, {
        name: state.form.name,
        muscle_group: state.form.muscle_group,
        difficulty: state.form.difficulty,
        video_url: finalVideoUrl || undefined,
      })

      state.isSaving = false
      closeModal()
      onSuccess?.()
    } catch (err: any) {
      state.isSaving = false
      state.isUploading = false
      state.error = err.response?.data?.error || err.message || 'Error al guardar el ejercicio'
    }
  }

  return {
    state,
    muscleGroupOptions,
    difficultyOptions,
    currentVideoUrl,
    hasVideo,
    isFormValid,
    getMuscleGroupBadgeStyle,
    getDifficultyBadgeStyle,
    getDifficultyLabel,
    openModal,
    closeModal,
    onVideoFileChange,
    removeVideoFile,
    saveExercise,
    checkChanges,
  }
}
