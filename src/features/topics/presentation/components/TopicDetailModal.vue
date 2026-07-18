<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import type { Topic, TopicType } from '../../domain/entities/Topic';

interface Props {
    isOpen: boolean;
    topic: Topic | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'close'): void }>();

const typeLabels: Record<TopicType, string> = {
    research: 'Investigación',
    tech_stack: 'Tecnología',
    literature: 'Literatura',
    philosophy: 'Filosofía y Ética'
};

const typeEmojis: Record<TopicType, string> = {
    research: '🔬',
    tech_stack: '💻',
    literature: '📚',
    philosophy: '🤔'
};

const handleClose = () => emit('close');

const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.isOpen) handleClose();
};

onMounted(() => window.addEventListener('keydown', handleEscape));
onUnmounted(() => window.removeEventListener('keydown', handleEscape));
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen && topic" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 250 } }"
                :leave="{ opacity: 0, transition: { duration: 200 } }"
                class="absolute inset-0 bg-black/40 backdrop-blur-md" @click="handleClose" />

            <!-- Modal card -->
            <div v-motion :initial="{ opacity: 0, scale: 0.85 }"
                :enter="{ opacity: 1, scale: 1, transition: { duration: 350, ease: [0.16, 1, 0.3, 1] } }"
                :leave="{ opacity: 0, scale: 0.85, transition: { duration: 250 } }"
                class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-amber-100/60 overflow-hidden">

                <!-- Header -->
                <div class="relative bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-8">
                    <div class="absolute inset-0 opacity-10">
                        <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                            <defs>
                                <pattern id="topic-modal-pattern" x="0" y="0" width="80" height="80"
                                    patternUnits="userSpaceOnUse">
                                    <rect x="10" y="10" width="15" height="50" fill="white" opacity="0.3" rx="2" />
                                    <rect x="30" y="10" width="15" height="55" fill="white" opacity="0.2" rx="2" />
                                    <rect x="50" y="10" width="15" height="45" fill="white" opacity="0.3" rx="2" />
                                </pattern>
                            </defs>
                            <rect width="400" height="200" fill="url(#topic-modal-pattern)" />
                        </svg>
                    </div>

                    <div class="relative z-10 flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <p class="text-amber-100 text-xs font-medium uppercase tracking-widest mb-2">Detalle del tema</p>
                            <h3 class="text-2xl font-serif font-bold text-white tracking-wide break-words">
                                {{ topic.name }}
                            </h3>
                        </div>
                        <button type="button" @click="handleClose"
                            class="flex-shrink-0 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30"
                            aria-label="Cerrar modal">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" class="drop-shadow">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Content -->
                <div class="px-6 py-6 space-y-6">
                    <!-- Línea de conocimiento -->
                    <div>
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Línea de conocimiento</p>
                        <span
                            class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-lg bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 shadow-sm">
                            {{ typeEmojis[topic.type] }} {{ typeLabels[topic.type] }}
                        </span>
                    </div>

                    <!-- Descripción -->
                    <div>
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción</p>
                        <p class="text-sm text-gray-700 leading-relaxed">
                            {{ topic.description || 'Sin descripción disponible.' }}
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div class="px-6 py-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 border-t border-amber-100/50 flex justify-end">
                    <button type="button" @click="handleClose"
                        class="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border-2 border-amber-300 rounded-xl hover:bg-amber-50 hover:border-amber-400 transition-all duration-300 active:scale-95">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>
