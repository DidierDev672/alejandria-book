<script setup lang="ts">
interface IconProps {
    size?: number;
    color?: string;
    className?: string;
}

const props = withDefaults(defineProps<IconProps>(), {
    size: 24,
    color: '#d97706',
    classNames: '',
    className: ''
});
</script>


<template>
    <div class="book-icon-wrapper">
        <!-- Halo difuminado detras del icono -->
        <div class="book-glow" />
        <svg xmlns="http://www.w3.org/2000/svg" :width="props.size" :height="props.size" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            :style="{ color: props.color }" :class="[props.className, 'book-icon']">
            <!-- Gradiente amber/orange embebido en el SVG -->
            <defs>
                <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f59e0b" />
                    <stop offset="100%" stop-color="#ea580c" />
                </linearGradient>
            </defs>

            <!-- Libro abierto — usa el gradiente como stroke -->
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="url(#bookGradient)"
                stroke-width="1.5" />
            <!-- Líneas de páginas -->
            <path d="M8 7h8M8 11h6" stroke="url(#bookGradient)" stroke-width="1.5" />
        </svg>
    </div>
</template>


<style scoped>
.book-icon-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}


/* Halo amber difuminado */
.book-glow {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%);
    animation: glow-pulse 2s ease-in-out infinite;
    pointer-events: none;
}


/* SVG principal */
.book-icon {
    position: relative;
    z-index: 1;
    animation: book-float 2s ease-in-out infinite;
    filter: drop-shadow(0 2px 6px rgba(217, 119, 6, 0.35));
}

/* Flotación suave con ligero scale */
@keyframes book-float {

    0%,
    100% {
        opacity: 1;
        transform: scale(1) translateY(0px);
    }

    50% {
        opacity: 0.88;
        transform: scale(1.06) translateY(-1.5px);
    }
}

/* Halo que respira en oposición */
@keyframes glow-pulse {

    0%,
    100% {
        opacity: 0.6;
        transform: scale(1);
    }

    50% {
        opacity: 1;
        transform: scale(1.25);
    }
}
</style>