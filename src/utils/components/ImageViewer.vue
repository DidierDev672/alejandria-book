<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";


// Contrato de interfaz estricto (SOLID - ISP)
interface Props {
    isOpen: boolean;
    images: string[];
    initialIndex?: number;
}


const props = withDefaults(defineProps<Props>(), {
    isOpen: false,
    images: () => [],
    initialIndex: 0,
});

const emit = defineEmits<{
    (e: 'close'): void
}>();

// Estado interno reactivo
const currentIndex = ref(props.initialIndex ?? 0);

// Sincronizar el índice inicial cuando el visor se abre
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        currentIndex.value = props.initialIndex ?? 0;
    }
});

const handleClose = () => emit('close')

// Métodos de navegación
const nextImage = () => {
    if (currentIndex.value < props.images.length - 1) {
        currentIndex.value++;
    } else {
        currentIndex.value = 0; // Bucle infinito opcional (UX fluido)
    }
}

const previousImage = () => {
    if (currentIndex.value > 0) {
        currentIndex.value--
    } else {
        currentIndex.value = props.images.length - 1
    }
};

// Control de accesibilidad por teclado (Teclas de flechas y Escape)
const handleKeyDown = (e: KeyboardEvent) => {
    if (!props.isOpen) return;
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') previousImage();
    if (e.key === 'Escape') handleClose();
}


onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen"
            class="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 bg-[#111110]/95 backdrop-blur-md select-none font-sans text-[#FBF9F4]">
            <header class="w-full max-w-5xl flex justify-between items-center py-4 z-10">
                <span class="text-xs font-mono text-gray-400 tracking-widest uppercase">
                    Imagen {{ currentIndex + 1 }} de {{ images.length }}
                </span>
                <button type="button" @click="handleClose"
                    class="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors duration-200 focus:outline-none"
                    aria-label="Cerrar visor">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </header>

            <main class="relative w-full flex-1 flex items-center justify-center max-w-6xl">

                <button v-if="images.length > 1" @click="previousImage"
                    class="absolute left-2 md:left-4 z-10 p-3 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white backdrop-blur-sm transition-all focus:outline-none"
                    aria-label="Imagen anterior">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <div class="w-full h-full flex items-center justify-center p-4">
                    <img :key="currentIndex" v-motion :initial="{ opacity: 0, scale: 0.95, y: 10 }"
                        :enter="{ opacity: 1, scale: 1, y: 0 }" :transition="{ duration: 350, ease: [0.16, 1, 0.3, 1] }"
                        :src="images[currentIndex]" alt="Visualización en alta definición"
                        class="max-w-full max-h-[75vh] object-contain rounded shadow-2xl" />
                </div>

                <button v-if="images.length > 1" @click="nextImage"
                    class="absolute right-2 md:right-4 z-10 p-3 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white backdrop-blur-sm transition-all focus:outline-none"
                    aria-label="Siguiente imagen">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </main>

            <footer class="w-full max-w-xl pb-6 z-10 overflow-x-auto">
                <div class="flex justify-center items-center space-x-3 px-4">
                    <button v-for="(img, idx) in images" :key="idx" @click="currentIndex = idx" :class="[
                        'w-12 h-16 rounded border overflow-hidden flex-shrink-0 transition-all duration-300 focus:outline-none',
                        currentIndex === idx
                            ? 'border-white scale-105 shadow-md opacity-100'
                            : 'border-transparent opacity-40 hover:opacity-70'
                    ]">
                        <img :src="img" class="w-full h-full object-cover" />
                    </button>
                </div>
            </footer>
        </div>
    </Teleport>
</template>