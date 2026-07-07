<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { LoadingService } from '../../application/Loading.service';
import { LoadingModel } from '../../domain/Loading.model';
import BookIcon from '../../infrastructure/icons/BookIcon.vue';

interface LoadingViewProps {
    title?: string;
    description?: string;
    isLoading?: boolean;
}

const props = withDefaults(defineProps<LoadingViewProps>(), {});

const service = new LoadingService(new LoadingModel({}));
const prepared = computed(() => service.prepareContent({
    title: props.title,
    description: props.description,
}));

const screenInfo = ref({
    pixelRatio: window.devicePixelRatio || 1,
    isDarkMode: false,
    prefersReducedMotion: false,
});

onMounted(() => {
    screenInfo.value.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    screenInfo.value.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
});

watch(() => props.isLoading, (val) => {
    console.log(`Alejandria Loader ${val ? 'started' : 'stopped'}`);
});
</script>


<template>
    <div v-if="props.isLoading" role="status" class="loading-container"
        :class="{ 'reduced-motion': screenInfo.prefersReducedMotion }">
        <!-- Decoradores SVG de fondo -->
        <div class="deco-top-right">
            <svg width="420" height="300" viewBox="0 0 420 300" fill="none">
                <circle cx="380" cy="-30" r="200" fill="#f59e0b" />
                <circle cx="320" cy="60" r="100" fill="#ea580c" />
            </svg>
        </div>
        <div class="deco-bottom-left">
            <svg width="280" height="220" viewBox="0 0 280 220" fill="none">
                <circle cx="0" cy="220" r="160" fill="#f59e0b" />
            </svg>
        </div>

        <!-- Tarjeta central -->
        <div class="loader-content" @click="$emit('black-click')">
            <!-- Línea de acento superior -->
            <div class="accent-line" />

            <!-- Ícono con halo -->
            <div class="icon-wrapper icon-sway">
                <!-- Halo amber difuminado -->
                <div class="icon-glow" />
                <BookIcon :size="64" color="#d97706" class="drop-shadow-lg relative z-10" />
            </div>

            <!-- Partículas amber -->
            <div v-for="n in 4" :key="n" class="particle"
                :style="{ top: `calc(${n % 2 === 0 ? '-' : ''}${n * 10}px)`, animationDelay: `${n * 0.25}s` }" />

            <!-- Título -->
            <h1 class="loader-title fade-up" style="word-break: keep-all; hyphens: auto; animation-delay: 0.3s;">
                {{ prepared.title }}
            </h1>

            <!-- Descripción -->
            <p class="loader-description fade-up" style="hyphens: auto; animation-delay: 0.5s;">
                {{ prepared.description }}
            </p>

            <!-- Barra de progreso -->
            <div class="progress-bar" />

            <!-- Puntos de carga -->
            <div class="dots-wrapper">
                <span class="dot" style="animation-delay: 0s" />
                <span class="dot" style="animation-delay: 0.2s" />
                <span class="dot" style="animation-delay: 0.4s" />
            </div>

            <!-- Accesibilidad -->
            <span class="sr-only">{{ prepared.title }}</span>
        </div>
    </div>
</template>

<style scoped>
/* ========================================
   CONTAINER — fondo warm amber/stone
======================================== */
.loading-container {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg,
            var(--bg-start, #fdf8ee) 0%,
            var(--bg-mid, #fef3c7) 50%,
            var(--bg-end, #fed7aa) 100%);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 9999;
    overflow: hidden;
}

/* Dark mode — stone-900 con toque amber */
@media (prefers-color-scheme: dark) {
    .loading-container {
        --bg-start: #1c1917;
        --bg-mid: #1c1410;
        --bg-end: #292115;
    }
}

/* ========================================
   DECORADORES SVG DE FONDO
======================================== */
.deco-top-right {
    position: absolute;
    top: 0;
    right: 0;
    opacity: 0.12;
    pointer-events: none;
}

.deco-bottom-left {
    position: absolute;
    bottom: 0;
    left: 0;
    opacity: 0.06;
    pointer-events: none;
}

/* ========================================
   TARJETA CENTRAL
======================================== */
.loader-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: clamp(2rem, 5vw, 3.5rem) clamp(2rem, 6vw, 4rem);
    border-radius: 1.5rem;
    /* rounded-3xl */
    border: 1px solid rgba(245, 158, 11, 0.20);
    /* border-amber-500/20 */
    background: rgba(255, 255, 255, 0.80);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow:
        0 25px 60px rgba(217, 119, 6, 0.12),
        0 8px 20px rgba(0, 0, 0, 0.06);
    will-change: transform, opacity;
    contain: layout style paint;
    transform: translateZ(0);
    overflow: hidden;
    min-width: min(90vw, 400px);
    text-align: center;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

@media (prefers-color-scheme: dark) {
    .loader-content {
        background: rgba(28, 25, 23, 0.88);
        /* stone-900/88 */
        border-color: rgba(245, 158, 11, 0.18);
        box-shadow:
            0 25px 60px rgba(0, 0, 0, 0.50),
            0 8px 20px rgba(217, 119, 6, 0.10);
    }
}

/* Línea de acento superior */
.accent-line {
    position: absolute;
    inset-inline: 0;
    top: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #f59e0b 40%, #ea580c 60%, transparent);
    border-radius: 9999px 9999px 0 0;
}

/* ========================================
   ÍCONO
======================================== */
.icon-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    z-index: 10;
}

/* Balanceo 3D del ícono (reemplaza motion.div rotateY) */
.icon-sway {
    transform-origin: center;
    animation: icon-sway 2.5s ease-in-out infinite;
}

@keyframes icon-sway {

    0%,
    100% {
        transform: rotateY(0deg);
    }

    25% {
        transform: rotateY(10deg);
    }

    75% {
        transform: rotateY(-10deg);
    }
}

/* Entrada suave de textos (reemplaza motion.h1 / motion.p) */
.fade-up {
    opacity: 0;
    animation: fade-up 0.6s ease-out forwards;
}

@keyframes fade-up {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.icon-glow {
    position: absolute;
    inset: -10px;
    border-radius: 50%;
    background: radial-gradient(circle,
            rgba(245, 158, 11, 0.30) 0%,
            rgba(234, 88, 12, 0.10) 50%,
            transparent 70%);
    animation: glow-breathe 2.5s ease-in-out infinite;
    pointer-events: none;
}

@keyframes glow-breathe {

    0%,
    100% {
        opacity: 0.6;
        transform: scale(1);
    }

    50% {
        opacity: 1;
        transform: scale(1.30);
    }
}

/* ========================================
   PARTÍCULAS — amber en lugar de purple
======================================== */
.particle {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b, #ea580c);
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
    opacity: 0;
    animation: particle-pulse 1.5s ease-in-out infinite;
}

@keyframes particle-pulse {

    0%,
    100% {
        opacity: 0;
        transform: scale(0);
    }

    50% {
        opacity: 1;
        transform: scale(1);
    }
}

.particle:nth-child(even) {
    right: 50%;
    margin-right: -15px;
}

.particle:nth-child(odd) {
    left: 50%;
    margin-left: -15px;
}

/* ========================================
   TIPOGRAFÍA
======================================== */
.loader-title {
    font-family: var(--font-serif, Georgia, serif);
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.01em;
    color: #1c1917;
    /* stone-900 */
    text-shadow: 0 1px 3px rgba(217, 119, 6, 0.15);
    margin-bottom: 0.75rem;
    word-wrap: break-word;
}

.loader-description {
    font-size: clamp(0.875rem, 2.5vw, 1.1rem);
    line-height: 1.65;
    text-align: center;
    color: #78716c;
    /* stone-500 */
    max-width: 38ch;
    margin-bottom: 1.75rem;
    padding-inline: 0.5rem;
}

@media (prefers-color-scheme: dark) {
    .loader-title {
        color: #fef3c7;
        text-shadow: 0 0 12px rgba(245, 158, 11, 0.35);
    }

    .loader-description {
        color: rgba(245, 235, 200, 0.75);
    }
}

/* ========================================
   BARRA DE PROGRESO — gradiente amber/orange
======================================== */
.progress-bar {
    height: 3px;
    border-radius: 9999px;
    max-width: 220px;
    margin-bottom: 1.25rem;
    background: linear-gradient(90deg, transparent, #f59e0b 40%, #ea580c 70%, transparent);
    box-shadow: 0 0 14px rgba(245, 158, 11, 0.55);
    animation: progress-sweep 3s linear infinite;
}

@keyframes progress-sweep {
    0% {
        width: 0;
    }

    40% {
        width: 110px;
    }

    80% {
        width: 220px;
    }

    100% {
        width: 0;
    }
}

.reduced-motion .progress-bar {
    animation-duration: 4s;
}

/* ========================================
   PUNTOS DE CARGA
======================================== */
.dots-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
}

.dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b, #ea580c);
    box-shadow: 0 0 6px rgba(245, 158, 11, 0.50);
    animation: dot-bounce 1.2s ease-in-out infinite;
}

@keyframes dot-bounce {

    0%,
    80%,
    100% {
        transform: scale(0.7);
        opacity: 0.5;
    }

    40% {
        transform: scale(1.2);
        opacity: 1;
    }
}

/* ========================================
   HIGH-DPI
======================================== */
@media (-webkit-min-device-pixel-ratio: 2),
(min-resolution: 192dpi) {
    .loader-content {
        border-radius: 1.75rem;
    }
}

/* ========================================
   ACCESIBILIDAD
======================================== */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.reduced-motion *,
.reduced-motion ::after,
.reduced-motion ::before {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
}

/* ========================================
   PERFORMANCE
======================================== */
@supports (content-visibility: auto) {
    .loader-content {
        content-visibility: auto;
    }
}
</style>