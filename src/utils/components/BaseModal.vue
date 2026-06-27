<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';


// Definición estricta de contratos mediante Props y Emits (SOLID)
interface Props {
    isOpen: boolean;
    maxWithClass?: string; // Permite alterar el tamaño del modal desde afuera: 'max-w-md', 'max-w-2xl', etc.
    expandable?: boolean; // Habilita/deshabilita la funcionalidad de expandir
    expandMaxWidth?: string; // Clase de ancho máximo cuando está expandido (default: 'max-w-6xl')
}

const props = withDefaults(defineProps<Props>(), {
    isOpen: false,
    maxWithClass: 'max-w-md',
    expandable: true,
    expandMaxWidth: 'max-w-6xl',
});

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'expand', isExpanded: boolean): void
}>();

// Estado de expansión del modal
const isExpanded = ref(false);

// Computed para determinar la clase de ancho actual
const currentMaxWidthClass = computed(() => {
    return isExpanded.value ? props.expandMaxWidth : props.maxWithClass;
});

const handleClose = () => {
    // Resetear el estado de expansión al cerrar
    isExpanded.value = false;
    emit('close');
}

const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
    emit('expand', isExpanded.value);
}

// UX senior: Accesibilidad del teclado (Cerrar con tecla Escape).
const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.isOpen) {
        handleClose();
    }
}

// Atajo de teclado para expandir (F11 o F)
const handleExpandKey = (event: KeyboardEvent) => {
    if ((event.key === 'f' || event.key === 'F') && props.isOpen && props.expandable) {
        toggleExpand();
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('keydown', handleExpandKey);
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape);
    window.removeEventListener('keydown', handleExpandKey);
})
</script>

<template>
    <Teleport to="body">
        <!-- Backdrop con animación -->
        <div v-if="props.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Overlay con blur-->
            <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 250 } }"
                :leave="{ opacity: 0, transition: { duration: 250 } }"
                class="absolute inset-0 bg-black/40 backdrop-blur-md" @click="handleClose" />
            <!-- Modal card con animacion escalable -->
            <div v-motion :initial="{ opacity: 0, scale: 0.92, y: 20 }"
                :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 350, ease: [0.16, 1, 0.3, 1] } }"
                :leave="{ opacity: 0, scale: 0.92, y: 20, transition: { duration: 250 } }" :animate="{
                    scale: isExpanded ? 1.02 : 1,
                    transition: { duration: 300, ease: 'easeInOut' }
                }" :class="[
                    'relative max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-amber-100/60 overflow-hidden',
                    'flex flex-col transition-all duration-300 ease-in-out',
                    isExpanded ? 'max-h-[95vh] w-[95vw]' : 'max-h-[90vh] sm:max-h-[85vh]',
                    currentMaxWidthClass,
                    maxWithClass
                ]" role="dialog" aria-modal="true">
                <!-- Header con Gradiente -->
                <div class="relative bg-gradient-to-r from-amber-600 to-orange-600 px-6 sm:px-8 py-8 sm:py-10">
                    <!-- Patrón decorativo SVG -->
                    <div class="absolute inset-0 opacity-10">
                        <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                            <defs>
                                <pattern id="modal-pattern" x="0" y="0" width="80" height="80"
                                    patternUnits="userSpaceOnUse">
                                    <rect x="10" y="10" width="15" height="50" fill="white" opacity="0.3" rx="2" />
                                    <rect x="30" y="10" width="15" height="55" fill="white" opacity="0.2" rx="2" />
                                    <rect x="50" y="10" width="15" height="45" fill="white" opacity="0.3" rx="2" />
                                </pattern>
                            </defs>
                            <rect width="400" height="200" fill="url(#modal-pattern)" />
                        </svg>
                    </div>

                    <!-- Contenido del Header -->
                    <div class="relative z-10 flex items-start justify-between gap-4">
                        <div class="flex-1">
                            <slot name="header">
                                <h3 class="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
                                    Diálogo del Sistema
                                </h3>
                            </slot>
                        </div>

                        <!-- Botones de control del modal -->
                        <div class="flex items-center gap-2">
                            <!-- Botón expandir/contraer -->
                            <button v-if="expandable" type="button" @click="toggleExpand"
                                class="flex-shrink-0 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30"
                                :aria-label="isExpanded ? 'Contraer modal' : 'Expandir modal'"
                                :title="isExpanded ? 'Contraer (F)' : 'Expandir (F)'">
                                <svg v-if="!isExpanded" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2" class="drop-shadow">
                                    <!-- Icono de expandir (cuatro flechas hacia afuera) -->
                                    <path
                                        d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                </svg>
                                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" class="drop-shadow">
                                    <!-- Icono de contraer (cuatro flechas hacia adentro) -->
                                    <path
                                        d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                                </svg>
                            </button>

                            <!-- Botón cerrar -->
                            <button type="button" @click="handleClose"
                                class="flex-shrink-0 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30"
                                aria-label="Cerrar modal">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" class="drop-shadow">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>


                <!-- Contenido Principal -->
                <div class="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8">
                    <main v-motion :initial="{ opacity: 0, y: 10 }"
                        :enter="{ opacity: 1, y: 0, transition: { delay: 100, duration: 400 } }"
                        class="text-sm sm:text-base leading-relaxed text-gray-600">
                        <slot name="content" />
                    </main>
                </div>

                <!-- Divider -->
                <div class="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

                <!-- Footer con Gradiente -->
                <footer v-if="$slots.footer" v-motion :initial="{ opacity: 0, y: 10 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 150, duration: 400 } }"
                    class="px-6 sm:px-8 py-6 sm:py-8 bg-gradient-to-r from-amber-50/50 to-orange-50/50 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <slot name="footer" />
                </footer>

                <!-- Alternativa: Sin footer slot -->
                <div v-else
                    class="px-6 sm:px-8 py-6 sm:py-8 bg-gradient-to-r from-amber-50/50 to-orange-50/50 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <button type="button" @click="handleClose"
                        class="px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-gray-700 bg-white border-2 border-amber-300 rounded-xl hover:bg-amber-50 hover:border-amber-400 transition-all duration-300 active:scale-95">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>