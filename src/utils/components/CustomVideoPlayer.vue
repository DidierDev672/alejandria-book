<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

// 1. Contrato de propiedades estricto (SOLID - ISP)

interface Props {
    videoSrc: string;
    posterSRC?: string;
}


const props = withDefaults(defineProps<Props>(), {
    videoSrc: '',
});


// 2. Referencias del DOM y estados Reactivos
const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1) // Rango de 0 a 1
const isMuted = ref(false)
const playbackRate = ref(1)
const isFullscreen = ref(false)
const showControls = ref(true)
let controlsTimeout: number | null = null

// 3. Formadores de Tiempo (UX Senior: MM:SS)
const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds)) return '00:00'
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const formattedCurrentTime = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(duration.value))


// 4. Lógica de Control de Video
const togglePlay = () => {
    if (!videoRef.value) return
    if (isPlaying.value) {
        videoRef.value.pause()
    } else {
        videoRef.value.play()
    }
}


// Sincronización de eventos nativos del elemento de Video
const onPlayUpdate = () => { isPlaying.value = true }
const onPauseUpdate = () => { isPlaying.value = false }


const onTimeUpdate = () => {
    if (!videoRef.value) return
    currentTime.value = videoRef.value.currentTime
}


const onLoadedMetadata = () => {
    if (!videoRef.value) return
    duration.value = videoRef.value.duration
}

// Barra de progreso arrastrable/clicable
const handleProgressChange = (event: Event) => {
    if (!videoRef.value) return
    const target = event.target as HTMLInputElement
    const newTime = parseFloat(target.value)
    videoRef.value.currentTime = newTime
    currentTime.value = newTime
}

// Control de Volumen y Mutación
const handleVolumeChange = (event: Event) => {
    if (!videoRef.value) return
    const target = event.target as HTMLInputElement
    const newVolume = parseFloat(target.value)
    volume.value = newVolume
    videoRef.value.volume = newVolume
    isMuted.value = newVolume === 0
}

const toggleMute = () => {
    if (!videoRef.value) return
    isMuted.value = !isMuted.value
    videoRef.value.muted = isMuted.value
    if (isMuted.value) {
        videoRef.value.volume = 0
    } else {
        videoRef.value.volume = volume.value > 0 ? volume.value : 0.5
    }
}

// Selector de Velocidad
const changePlaybackRate = (event: Event) => {
    if (!videoRef.value) return
    const target = event.target as HTMLSelectElement
    const rate = parseFloat(target.value)
    playbackRate.value = rate
    videoRef.value.playbackRate = rate
}

// Pantalla Completa mediante la API del Navegador
const containerRef = ref<HTMLDivElement | null>(null)

const toggleFullscreen = async () => {
    if (!containerRef.value) return

    if (!document.fullscreenElement) {
        await containerRef.value.requestFullscreen()
        isFullscreen.value = true
    } else {
        await document.exitFullscreen()
        isFullscreen.value = false
    }
}

// Ocultar controles automáticamente cuando no haya movimiento del mouse (UX de Cine)
const triggerControlsTimeout = () => {
    showControls.value = true
    if (controlsTimeout) clearTimeout(controlsTimeout)

    if (isPlaying.value) {
        controlsTimeout = window.setTimeout(() => {
            showControls.value = false
        }, 2500)
    }
}

// Manejo del estado al salir de pantalla completa con la tecla ESC nativa
const onFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
    document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', onFullscreenChange)
    if (controlsTimeout) clearTimeout(controlsTimeout)
})
</script>

<template>
    <div ref="containerRef" @mousemove="triggerControlsTimeout" @mouseleave="showControls = isPlaying ? false : true"
        class="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/40 transition-all duration-300 font-sans text-white border border-amber-500/20">
        <!-- Vídeo -->
        <video ref="videoRef" :src="props.videoSrc" :poster="props.posterSrc" @click="togglePlay"
            @timeupdate="onTimeUpdate" @loadedmetadata="onLoadedMetadata" @play="onPlayUpdate" @pause="onPauseUpdate"
            class="w-full h-full object-contain cursor-pointer aspect-video bg-stone-950" />

        <!-- Overlay de controles -->
        <div class="absolute inset-0 flex flex-col justify-end transition-opacity duration-300"
            :class="[showControls ? 'opacity-100' : 'opacity-0 pointer-events-none']">
            <!-- Gradiente inferior -->
            <div
                class="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-900/20 to-stone-900/30 pointer-events-none" />

            <!-- Decorador SVG esquina superior derecha -->
            <div class="pointer-events-none absolute right-0 top-0 opacity-10">
                <svg width="160" height="100" viewBox="0 0 160 100" fill="none">
                    <circle cx="140" cy="-10" r="70" fill="#f59e0b" />
                    <circle cx="110" cy="20" r="35" fill="#ea580c" />
                </svg>
            </div>

            <!-- Contenido de controles -->
            <div class="relative z-10 px-4 pb-4 pt-8">

                <!-- Barra de progreso -->
                <div class="w-full flex items-center gap-2 mb-3 group/progress">
                    <div
                        class="relative w-full h-1 group-hover/progress:h-2 transition-all duration-200 rounded-full bg-white/15 cursor-pointer">
                        <!-- Relleno -->
                        <div class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                            :style="{ width: duration ? (currentTime / duration) * 100 + '%' : '0%' }" />
                        <!-- Thumb invisible encima para input range -->
                        <input type="range" min="0" :max="duration" step="0.1" :value="currentTime"
                            @input="handleProgressChange"
                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                </div>

                <!-- Fila de controles -->
                <div class="flex flex-wrap items-center justify-between gap-3">

                    <!-- Izquierda -->
                    <div class="flex items-center gap-4">

                        <!-- Play / Pause -->
                        <button @click="togglePlay"
                            :aria-label="isPlaying ? 'Pausar' : 'Reproducir'"
                            class="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/30 hover:from-amber-400 hover:to-orange-500 transition-all duration-200 active:scale-95 focus:outline-none">
                            <svg v-if="!isPlaying" width="16" height="16" viewBox="0 0 24 24"
                                fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            <svg v-else width="16" height="16" viewBox="0 0 24 24"
                                fill="currentColor">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                        </button>

                        <!-- Tiempo -->
                        <div class="text-xs font-mono tracking-wide">
                            <span
                                class="text-amber-300 font-semibold">{{ formattedCurrentTime }}</span>
                            <span class="mx-1 text-stone-500">/</span>
                            <span class="text-stone-400">{{ formattedDuration }}</span>
                        </div>

                        <!-- Volumen -->
                        <div class="flex items-center gap-1.5 group/volume">
                            <button @click="toggleMute"
                                class="text-stone-300 hover:text-amber-400 transition-colors duration-200 focus:outline-none">
                                <svg v-if="isMuted || volume === 0" width="18" height="18"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2.5">
                                    <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                                </svg>
                                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2.5">
                                    <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07" />
                                </svg>
                            </button>

                            <!-- Slider de volumen -->
                            <div
                                class="relative w-0 group-hover/volume:w-20 transition-all duration-300 overflow-hidden">
                                <div class="relative h-1 rounded-full bg-white/15 mx-1">
                                    <div class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                                        :style="{ width: (isMuted ? 0 : volume) * 100 + '%' }" />
                                    <input type="range" min="0" max="1" step="0.05"
                                        :value="isMuted ? 0 : volume" @input="handleVolumeChange"
                                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Derecha -->
                    <div class="flex items-center gap-3">

                        <!-- Selector de velocidad -->
                        <div class="relative">
                            <select @change="changePlaybackRate" :value="playbackRate"
                                class="appearance-none bg-stone-800/80 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg px-3 py-1.5 pr-6 focus:outline-none cursor-pointer hover:bg-stone-700/80 hover:border-amber-500/40 transition-all duration-200">
                                <option value="0.5" class="bg-stone-900 text-stone-100">0.5×
                                </option>
                                <option value="1" class="bg-stone-900 text-stone-100">1.0×</option>
                                <option value="1.5" class="bg-stone-900 text-stone-100">1.5×
                                </option>
                                <option value="2" class="bg-stone-900 text-stone-100">2.0×</option>
                            </select>
                            <!-- Chevron decorativo -->
                            <div
                                class="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                <svg class="w-3 h-3 text-amber-500" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <!-- Fullscreen -->
                        <button @click="toggleFullscreen"
                            class="text-stone-300 hover:text-amber-400 transition-colors duration-200 focus:outline-none">
                            <svg v-if="!isFullscreen" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2.5">
                                <path
                                    d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
                            </svg>
                            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2.5">
                                <path d="M4 14h6v6M20 14h-6v6M4 10h6V4M20 10h-6V4" />
                            </svg>
                        </button>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>