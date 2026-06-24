<script setup lang="ts">
import axios from 'axios';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useTopicStore } from '../../application/useTopicStore';
import type { Topic, TopicType } from '../../domain/entities/Topic';


const topicStore = useTopicStore();
const { topicsList, isLoadingList } = storeToRefs(topicStore);

// Carga de datos iniciales al montar el componente (Open/Closed compliant)
onMounted(async () => {
    console.log("topicsList", topicStore.topicsList);
    await topicStore.loadTopics();


    try {
        const response = await axios.get<Topic[]>(`http://localhost:8080/topics`);
        topicStore.topicsList = response.data;
    } catch (error: any) {
        console.error("Error al cargar los temas de estudio:", error);
    }
})


// Mapeo UX Senior para badges visuales refinados sin romper la estética
const typeLabels: Record<TopicType, { text: string, styles: string }> = {
    research: { text: 'Investigación', styles: 'bg-[#EAE4D9] text-[#5C554A]' },
    tech_stack: { text: 'Tecnología', styles: 'bg-[#E3E8E9] text-[#4A5557]' },
    literature: { text: 'Literatura', styles: 'bg-[#EBE3E4] text-[#574A4C]' },
    philosophy: { text: 'Filosofía y Ética', styles: 'bg-[#E6E3E9] text-[#4F4A57]' }
};

const typeColors: Record<TopicType, string> = {
    research: '#8B7355',
    tech_stack: '#4A6B7C',
    literature: '#7B5F65',
    philosophy: '#6B5F7B'
};

const typeEmojis: Record<TopicType, string> = {
    research: '🔬',
    tech_stack: '💻',
    literature: '📚',
    philosophy: '🤔'
};

const formatDate = (date: Date | undefined): String => {
    if (!date) return '----';
    return new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

const getTopicTypeColor = (type: TopicType): string => {
    return typeColors[type] || '#8B7355';
}

const getTopicEmoji = (type: TopicType): string => {
    return typeEmojis[type] || '📋';
}

const getTopicLabel = (type: TopicType): string => {
    return typeLabels[type]?.text || type;
}
</script>


<template>
    <div v-if="isLoadingList">Cargando...</div>
    <div class="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-8 px-4">
        <!-- Decoración de fondo -->
        <div class="fixed inset-0 pointer-events-none overflow-hidden">
            <div class="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full blur-3xl opacity-15"></div>
            <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full blur-3xl opacity-15"></div>
        </div>
        <!-- Contenedor principal  -->
        <div v-motion :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 600, ease: 'easeOut' } }"
            class="relative max-w-4xl mx-auto">
            <!-- Card principal -->
            <div class="bg-white rounded-2xl shadow-2xl border border-amber-100/60 overflow-hidden">
                <!-- Header con decoracion -->
                <header class="relative bg-gradient-to-r from-amber-600 to-orange-600 px-6 md:px-8 py-10 md:py-12">
                    <!-- Patrón de fondo decorativo -->
                    <div class="absolute inset-0 opacity-10">
                        <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                            <defs>
                                <pattern id="books-list" x="0" y="0" width="80" height="80"
                                    patternUnits="userSpaceOnUse">
                                    <rect x="10" y="10" width="15" height="50" fill="white" opacity="0.3" rx="2" />
                                    <rect x="30" y="10" width="15" height="55" fill="white" opacity="0.2" rx="2" />
                                    <rect x="50" y="10" width="15" height="45" fill="white" opacity="0.3" rx="2" />
                                </pattern>
                            </defs>
                            <rect width="400" height="200" fill="url(#books-list)" />
                        </svg>
                    </div>
                    <!-- Contenido del header -->
                    <div class="relative z-10">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h1 class="text-3xl md:text-4xl font-serif text-white tracking-wide">Índice de Materias
                                </h1>
                                <p class="text-amber-100 text-xs font-medium mt-0.5 uppercase tracking-widest">Líneas de
                                    investigación activas</p>
                            </div>
                        </div>
                        <p class="text-amber-50 text-sm mt-3 max-w-md">
                            Explora todos los temas disponibles en tu repositorio de conocimiento
                        </p>
                    </div>

                    <!-- Badge de contador -->
                    <div
                        class="absolute top-6 right-6 md:right-8 md:top-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2.5">
                        <div class="text-white/80 text-xs font-medium mb-0.5">Total de Temas</div>
                        <div class="text-3xl font-bold text-white">{{ topicsList?.length ?? 0 }}</div>
                    </div>
                </header>

                <!-- Contenido -->
                <div class="px-6 md:px-8 py-8 md:py-10">
                    <!-- Estado de carga - Skeleton loaders -->
                    <div v-if="isLoadingList" class="space-y-4">
                        <div v-for="i in 3" :key="i" v-motion :initial="{ opacity: 0, y: 10 }"
                            :enter="{ opacity: 1, y: 0, transition: { delay: i * 50, duration: 400 } }"
                            class="p-5 md:p-6 rounded-xl border-2 border-transparent bg-gradient-to-r from-amber-50 to-orange-50 animate-pulse">
                            <div class="flex justify-between items-start gap-4 mb-3">
                                <div class="flex-1">
                                    <div class="h-5 bg-amber-200 rounded w-3/4 mb-2"></div>
                                    <div class="h-3 bg-amber-100 rounded w-1/2"></div>
                                </div>
                                <div class="h-6 bg-amber-200 rounded-full w-20"></div>
                            </div>
                            <div class="space-y-2">
                                <div class="h-3 bg-amber-100 rounded w-full"></div>
                                <div class="h-3 bg-amber-100 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>


                    <div v-else-if="topicsList?.length === 0" v-motion :initial="{ opacity: 0, scale: 0.95 }"
                        :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }"
                        class="py-16 md:py-20 text-center">
                        <div
                            class="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 mb-6">
                            <svg class="w-8 h-8 md:w-10 md:h-10 text-amber-700" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <p class="text-lg font-semibold text-gray-800 mb-2">No hay temas disponibles</p>
                        <p class="text-sm text-gray-600 max-w-sm">
                            Aún no se han indexado ejes temáticos. Comienza creando un nuevo tema para tu biblioteca.
                        </p>
                    </div>

                    <!-- Lista de tópicos -->
                    <transition-group v-else name="list-fade" tag="div" class="space-y-4">
                        <article v-for="(topic, index) in topicsList" :key="topic.id || topic.name" v-motion
                            :initial="{ opacity: 0, x: -20 }"
                            :enter="{ opacity: 1, x: 0, transition: { delay: index * 50, duration: 400 } }"
                            class="group relative p-5 md:p-6 rounded-xl border-2 border-transparent hover:border-amber-200 bg-gradient-to-br from-white to-amber-50/30 hover:from-amber-50 hover:to-orange-50/30 transition-all duration-300 hover:shadow-lg cursor-pointer">
                            <!-- Indicador de tipo - coloreado -->
                            <div class="absolute top-0 left-0 w-1 h-full rounded-l-xl"
                                :style="{ backgroundColor: getTopicTypeColor(topic.type) }" />

                            <div class="space-y-3">
                                <!-- Encabezado con tipo -->
                                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                                    <div class="flex-1 min-w-0">
                                        <h4
                                            class="text-lg md:text-xl font-serif font-semibold text-gray-900 group-hover:text-amber-700 transition-colors break-words">
                                            {{ topic.name }}
                                        </h4>
                                        <p class="text-xs text-gray-500 mt-1 font-medium">
                                            {{ getTopicEmoji(topic.type) }} {{ getTopicLabel(topic.type) }}
                                        </p>
                                    </div>

                                    <!-- Badge de tipo -->
                                    <div class="flex-shrink-0">
                                        <span
                                            :style="{ backgroundColor: getTopicTypeColor(topic.type) + '20', color: getTopicTypeColor(topic.type), borderColor: getTopicTypeColor(topic.type) + '40' }"
                                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border-2 transition-all duration-200">
                                            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {{ getTopicLabel(topic.type) }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Descripción -->
                                <p
                                    class="text-sm text-gray-700 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                                    {{ topic.description }}
                                </p>

                                <!-- Footer con metadatos -->
                                <div class="flex flex-wrap items-center gap-4 pt-3 border-t border-amber-100/50">
                                    <div class="flex items-center gap-2 text-xs text-gray-500">
                                        <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <time :datetime="topic.createdAt?.toString()">
                                            {{ formatDate(topic.createdAt) }}
                                        </time>
                                    </div>

                                    <div class="flex-1"></div>

                                    <!-- Icono de interacción -->
                                    <div
                                        class="p-2 rounded-lg bg-amber-100/0 group-hover:bg-amber-100 transition-colors duration-300">
                                        <svg class="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform duration-300"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <!-- Efecto hover de brillo -->
                            <div
                                class="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/0 to-white/0 group-hover:via-white/10 transition-all duration-500 pointer-events-none">
                            </div>
                        </article>
                    </transition-group>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Animación fluida de entrada y salida de elementos para una UI dinámica */
.list-fade-enter-active,
.list-fade-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.list-fade-enter-from {
    opacity: 0;
    transform: translateX(-15px);
}

.list-fade-leave-to {
    opacity: 0;
    transform: translateX(15px);
}
</style>
