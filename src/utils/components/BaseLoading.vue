<script setup lang="ts">
import { computed } from 'vue';


// 1. Definicion estricta de la interfaz de Propiedades (SOLID - ISP)
interface Props {
    isLoading: boolean;
    fullScreen?: boolean;
    type?: 'spinner' | 'dots' | 'bar';
    color?: string;
    text?: string;
}

// Valores por defecto alineados con una paleta sofisticada y editorial
const props = withDefaults(defineProps<Props>(), {
    fullScreen: false,
    type: 'spinner',
    color: 'text-amber-600',
    text: 'Cargando...',
});


// 2. Clases dinamicas para el contenedor segun el modo de visualizacion
const containerClasses = computed(() => {
    if (props.fullScreen) {
        // Pantalla  completa bloqueando con desenfocado de fondo sutil UX Senior
        return 'fixed inset-0 z-[60] overflow-y-auto bg-stone-900/70 backdrop-blur-sm';
    }

    // Ajustado al contenedor padre (requiere que el padre tenga position: relative)
    return 'absolute inset-0 z-40 bg-[#FBF9F4]/60 backdrop-blur-[2px]';
});
</script>


<template>
    <Transition name="fade">
        <div v-if="props.isLoading" :class="[
            'flex flex-col items-center justify-center p-6 text-center select-none font-sans',
            containerClasses
        ]" role="progressbar" aria-busy="true">
            <div class="flex items-center justify-center min-h-[64px]">
                <svg v-if="props.type === 'spinner'" :class="['animate-spin h-10 w-10', props.color]" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>

                <div v-else-if="props.type === 'pulsar'" class="relative flex items-center justify-center w-10 h-10">
                    <span
                        :class="['absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping', props.color.replace('text-', 'bg-')]"></span>
                    <span
                        :class="['absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse', props.color.replace('text-', 'bg-')]"></span>
                </div>
                <div v-else-if="props.type === 'bar'" class="flex items-center justify-center space-x-1.5 h-6">
                    <div v-for="i in 3" :key="i"
                        class="['w-1.5 h-full rounded-full animate-pulse', props.color.replace('text-', 'bg-')]"
                        :style="{ animationDelay: `${(i - 1) * 0.15}s` }"></div>
                </div>
            </div>

            <p v-if="props.text" v-motion :initial="{ opacity: 0, y: 4 }" :enter="{ opacity: 1, y: 0 }"
                :transition="{ duration: 300 }"
                :class="['mt-4 text-xs font-mono tracking-widest uppercase opacity-70', props.color]">{{ props.text }}
            </p>
        </div>
    </Transition>
</template>


<style scoped>
/* Clases de transicion nativas de Vue para optimizar el rendimiento de renderizando */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>