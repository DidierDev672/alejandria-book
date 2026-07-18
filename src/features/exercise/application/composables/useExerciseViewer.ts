import { ref, computed } from 'vue'

export interface ExerciseViewerExercise {
  id: string
  name: string
  muscle_group: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  video?: string
  video_url?: string
}

const MUSCLE_GROUP_MAP: Record<string, { label: string; icon: string }> = {
  chest: { label: 'Pecho', icon: '💪' },
  back: { label: 'Espalda', icon: '🏋️' },
  legs: { label: 'Piernas', icon: '🦵' },
  shoulders: { label: 'Hombros', icon: '🤷' },
  arms: { label: 'Brazos', icon: '💪' },
  core: { label: 'Core', icon: '🎯' },
  cardio: { label: 'Cardio', icon: '❤️' },
  fullbody: { label: 'Cuerpo Completo', icon: '🏃' },
}

const DIFFICULTY_MAP: Record<string, { label: string; colorClass: string }> = {
  BEGINNER: { label: 'Principiante', colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  INTERMEDIATE: { label: 'Intermedio', colorClass: 'bg-amber-100 text-amber-700 border-amber-200' },
  ADVANCED: { label: 'Avanzado', colorClass: 'bg-rose-100 text-rose-700 border-rose-200' },
}

export function useExerciseViewer() {
  const isOpen = ref(false)
  const selectedExercise = ref<ExerciseViewerExercise | null>(null)
  const exerciseList = ref<ExerciseViewerExercise[]>([])

  const getVideoUrl = (exercise: ExerciseViewerExercise): string => {
    return exercise.video || exercise.video_url || ''
  }

  const getMuscleGroupInfo = (muscleGroup: string) => {
    return MUSCLE_GROUP_MAP[muscleGroup] || { label: muscleGroup, icon: '🏋️' }
  }

  const getDifficultyInfo = (difficulty: string) => {
    return DIFFICULTY_MAP[difficulty] || { label: difficulty, colorClass: 'bg-slate-100 text-slate-700 border-slate-200' }
  }

  const hasVideo = computed(() => {
    return selectedExercise.value ? !!getVideoUrl(selectedExercise.value) : false
  })

  const openModal = (exercises: ExerciseViewerExercise[]) => {
    exerciseList.value = exercises
    selectedExercise.value = exercises.length > 0 ? exercises[0] : null
    isOpen.value = true
  }

  const selectExercise = (exercise: ExerciseViewerExercise) => {
    selectedExercise.value = exercise
  }

  const closeModal = () => {
    isOpen.value = false
    selectedExercise.value = null
    exerciseList.value = []
  }

  return {
    isOpen,
    selectedExercise,
    exerciseList,
    hasVideo,
    getVideoUrl,
    getMuscleGroupInfo,
    getDifficultyInfo,
    openModal,
    selectExercise,
    closeModal,
  }
}
