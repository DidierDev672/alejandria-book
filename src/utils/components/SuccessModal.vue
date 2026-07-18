<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

interface Props {
  isOpen: boolean
  title?: string
  message?: string
  equipmentName?: string
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  title: 'Equipo registrado exitosamente',
  message: 'El equipo fue guardado en el sistema correctamente.',
  equipmentName: '',
  duration: 4000,
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const progressWidth = ref('100%')
let autoCloseTimer: ReturnType<typeof setTimeout> | null = null
let progressInterval: ReturnType<typeof setInterval> | null = null

const handleClose = () => {
  if (autoCloseTimer) clearTimeout(autoCloseTimer)
  if (progressInterval) clearInterval(progressInterval)
  emit('close')
}

onMounted(() => {
  if (props.duration > 0 && props.isOpen) {
    startAutoClose()
  }
})

onUnmounted(() => {
  if (autoCloseTimer) clearTimeout(autoCloseTimer)
  if (progressInterval) clearInterval(progressInterval)
})

function startAutoClose() {
  progressWidth.value = '100%'
  const startTime = Date.now()

  progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, 100 - (elapsed / props.duration) * 100)
    progressWidth.value = `${remaining}%`
  }, 30)

  autoCloseTimer = setTimeout(() => {
    if (progressInterval) clearInterval(progressInterval)
    handleClose()
  }, props.duration)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 250 } }"
        :leave="{ opacity: 0, transition: { duration: 200 } }"
        class="absolute inset-0 bg-black/40 backdrop-blur-md"
        @click="handleClose"
      />

      <!-- Modal card -->
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.85, y: 30 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 400, ease: [0.16, 1, 0.3, 1] } }"
        :leave="{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 250 } }"
        class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100/60 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header con gradiente verde/émerald -->
        <div class="relative bg-gradient-to-r from-emerald-500 to-teal-500 px-6 pt-8 pb-6 text-center">
          <!-- Patrón decorativo -->
          <div class="absolute inset-0 opacity-10">
            <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <pattern id="success-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="8" fill="white" opacity="0.25" />
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#success-pattern)" />
            </svg>
          </div>

          <!-- Icono de éxito animado -->
          <div
            v-motion
            :initial="{ scale: 0, rotate: -180 }"
            :enter="{ scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 12, delay: 200 } }"
            class="relative z-10 mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4"
          >
            <svg class="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <!-- Título -->
          <h3
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 400 } }"
            class="relative z-10 text-lg font-bold text-white"
          >
            {{ title }}
          </h3>
        </div>

        <!-- Contenido -->
        <div class="px-6 py-6 text-center space-y-4">
          <!-- Nombre del equipo -->
          <div
            v-if="equipmentName"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 400, duration: 400 } }"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl"
          >
            <svg class="w-5 h-5 text-emerald-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            <span class="text-sm font-semibold text-emerald-800">{{ equipmentName }}</span>
          </div>

          <!-- Mensaje descriptivo -->
          <p
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 450, duration: 400 } }"
            class="text-sm text-gray-500 leading-relaxed"
          >
            {{ message }}
          </p>
        </div>

        <!-- Botón cerrar -->
        <div class="px-6 pb-6">
          <button
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 400 } }"
            type="button"
            @click="handleClose"
            class="w-full px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-md hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          >
            Entendido
          </button>
        </div>

        <!-- Barra de progreso automática -->
        <div v-if="duration > 0" class="h-1 bg-emerald-50">
          <div
            class="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all ease-linear"
            :style="{ width: progressWidth }"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>
