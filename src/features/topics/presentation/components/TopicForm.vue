<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTopicStore } from '../../application/useTopicStore';
import { TopicFactory, type TopicType } from '../../domain/entities/Topic';

const topicStore = useTopicStore();
const form = ref({ ...TopicFactory.createEmpty() });
const isSuccess = ref(false);


const topicTypes: { value: TopicType; label: string }[] = [
    { value: 'research', label: 'Investigación Científica' },
    { value: 'tech_stack', label: 'Stack Tecnológico' },
    { value: 'literature', label: 'Literatura & Narrativa' },
    { value: 'philosophy', label: 'Filosofía y Ética' }
];



const maxDescriptionLength = 300;
const descriptionLength = computed(() => form.value.description.length);
const isDescriptionOverLimit = computed(() => descriptionLength.value > maxDescriptionLength);

const handleSubmit = async () => {
    // if (isDescriptionOverLimit.value) return;

    const success = await topicStore.createTopic(form.value);
    if (success) {
        isSuccess.value = true;
        form.value = TopicFactory.createEmpty();
        setTimeout(() => (isSuccess.value = false), 5000);
    }
};
</script>

<template>
    <div
        class="min-h-screen-svh  bg-gradient-to-br from-amber-50 via-white to-orange-50 py-8 px-4 relative overflow-hidden">
        <!-- Efectos de fondo decorativas -->
        <div class="fixed inset-0 pointer-events-none overflow-hidden">
            <div class="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full blur-3xl opacity-15"></div>
        </div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full blur-3xl opacity-15"></div>
        <div
            class="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-100 rounded-full blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2">
        </div>

        <!-- Contenedor principal -->
        <div v-motion :initial="{ opacity: 0, y: 24 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 600, ease: 'easeOut' } }"
            class="relative max-w-2xl mx-auto">
            <!-- Card Principal -->
            <div class="bg-white rounded-2xl shadow-2xl border border-amber-100/60 overflow-hidden backdrop-blur-sm">
                <!-- Header decorativo con gradiente -->
                <div
                    class="relative bg-gradient-to-r from-amber-600 via-orange-500 to-orange-600 px-8 md:px-12 py-14 overflow-hidden">
                    <!-- Patron de decorativo -->
                    <div class="absolute inset-0 opacity-10">
                        <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                            <defs>
                                <pattern id="books-pattern" x="0" y="0" width="80" height="80"
                                    patternUnits="userSpaceOnUse">
                                    <rect x="10" y="10" width="15" height="50" fill="white" opacity="0.3" rx="2" />
                                    <rect x="30" y="10" width="15" height="55" fill="white" opacity="0.2" rx="2" />
                                    <rect x="50" y="10" width="15" height="45" fill="white" opacity="0.3" rx="2" />
                                </pattern>
                            </defs>
                            <rect width="400" height="200" fill="url(#books-pattern)" />
                        </svg>
                    </div>

                    <!-- Contenido del header -->
                    <div class="relative z-10">
                        <div class="flex items-center gap-4 mb-3">
                            <div class="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>

                        <div>
                            <h1 class="text-3xl md:text-4xl font-serif text-white tracking-wide">Nuevo Eje de Estudio
                            </h1>
                            <p class="text-amber-50 text-sm font-medium mt-1">Clasificación y Taxonomía de Conocimiento
                            </p>
                        </div>
                    </div>
                    <p class="text-amber-100 text-xs font-medium uppercase tracking-widest max-w-md">
                        Define nuevos temas para organizar tu repositorio de conocimiento académico y literario
                    </p>
                </div>
            </div>

            <!-- Formulario -->
            <form @submit.prevent="handleSubmit" class="p-8 md:p-12 space-y-8">
                <!-- Campo: nombre del Tema -->
                <div v-motion :initial="{ opacity: 0, x: -20 }"
                    :enter="{ opacity: 1, x: 0, transition: { delay: 100, duration: 500 } }" class="group">
                    <label
                        class="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-gray-800 mb-3">
                        <div class="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
                            <svg class="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span class="bg-gradient-to-r from-amber-900 to-orange-800 bg-clip-text text-transparent">
                            Nombre del tema
                        </span>
                    </label>
                    <input v-model="form.name" type="text" required
                        placeholder="Ej. Arquitectura de Software y Patrones Decoupled"
                        class="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl px-5 py-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 group-hover:border-amber-300" />
                </div>
                <!-- Campo: Tipo de Línea de Conocimiento -->
                <div v-motion :initial="{ opacity: 0, x: -20 }"
                    :enter="{ opacity: 1, x: 0, transition: { delay: 150, duration: 500 } }" class="group">
                    <label
                        class="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-gray-800 mb-3">
                        <div class="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
                            <svg class="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span class="bg-gradient-to-r from-amber-900 to-orange-800 bg-clip-text text-transparent">
                            Línea de Conocimiento (Type)
                        </span>
                    </label>
                    <div class="relative">
                        <select v-model="form.type"
                            class="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl px-5 py-3.5 text-sm text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 appearance-none cursor-pointer group-hover:border-amber-300 pr-12">
                            <option value="">Seleccionar tipo...</option>
                            <option v-for="type in topicTypes" :key="type.value" :value="type.value">
                                {{ type.label }}
                            </option>
                            <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </select>
                        <div
                            class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Campo: Descripcion -->
                <div v-motion :initial="{ opacity: 0, x: -20 }"
                    :enter="{ opacity: 1, x: 0, transition: { delay: 200, duration: 500 } }" class="groups">
                    <div class="flex justify-between items-center mb-3">
                        <label class="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-gray-800">
                            <div class="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
                                <svg class="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span class="bg-gradient-to-r from-amber-900 to-orange-800 bg-clip-text text-transparent">
                                Descripción y Alcance
                            </span>
                        </label>
                        <div :class="[
                            'text-xs font-mono font-bold tracking-wide transition-all duration-300',
                            isDescriptionOverLimit ? 'text-red-600 animate-pulse' : 'text-gray-400'
                        ]">
                            {{ descriptionLength }}<span class="text-gray-300">/{{ maxDescriptionLength }}</span>
                        </div>
                    </div>

                    <textarea v-model="form.description" required rows="4"
                        placeholder="Define los límites conceptuales, autores base u objetivos de aprendizaje de este tema..."
                        class="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-2 rounded-xl px-5 py-4 text-sm
                        text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all
                        duration-300 resize-none group-hover:border-amber-300" :class="[
                            isDescriptionOverLimit
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                : 'border-amber-200 focus:border-amber-500 focus:ring-amber-200'
                        ]"></textarea>
                    <p class="text-center text-xs text-gray-500 font-medium flex items-center justify-center gap-2">
                        <svg class="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg>
                        Este tema será asociado automáticamente con tus libros y notas
                    </p>
                </div>

                <div class="pt-2 space-y-3">
                    <transition name="slide-fade">
                        <div v-if="topicStore.feedbackError" v-motion :initial="{ opacity: 0, y: -10 }"
                            :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }"
                            class="rounded-xl bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-4">
                            <svg class="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p class="font-semibold text-red-800">Error al registrar el tema</p>
                                <p class="text-sm text-red-700 mt-1">{{ topicStore.feedbackError }}</p>
                            </div>
                        </div>

                        <div v-else-if="isSuccess" v-motion :initial="{ opacity: 0, y: -10 }"
                            :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }"
                            class="rounded-xl bg-emerald-50 border-l-4 border-emerald-500 p-4 flex items-start gap-4">
                            <svg class="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor"
                                viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                            <div>
                                <p class="font-semibold text-emerald-800">¡Tema registrado exitosamente!</p>
                                <p class="text-sm text-emerald-700 mt-1">El tema de estudio ha sido indexado en tu
                                    repositorio de conocimiento.</p>
                            </div>
                        </div>
                    </transition>

                    <button type="submit" :disabled="topicStore.isSubmitting || isDescriptionOverLimit" v-motion
                        :initial="{ opacity: 0, y: 20 }"
                        :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 500 } }"
                        class="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm py-4 px-6 uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                        <!-- Efecto brillo en hover -->
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out">
                        </div>

                        <!-- Contenido del boton -->
                        <div class="relative flex items-center justify-center gap-3">
                            <svg v-if="topicStore.isSubmitting" class="w-5 h-5 animate-spin" fill="none"
                                viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            {{ topicStore.isSubmitting ? 'Indexando Tema...' : 'Registrar Tema de Estudio' }}
                        </div>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Transiciones */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.4s ease;
}

.slide-fade-enter-from {
    transform: translateY(-12px);
    opacity: 0;
}

.slide-fade-leave-to {
    transform: translateY(12px);
    opacity: 0;
}

/* Efecto de foco mejorado */
input:focus,
select:focus,
textarea:focus {
    box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.1);
}

/* Scroll customizado para textarea */
textarea::-webkit-scrollbar {
    width: 6px;
}

textarea::-webkit-scrollbar-track {
    background: rgba(217, 119, 6, 0.05);
    border-radius: 10px;
}

textarea::-webkit-scrollbar-thumb {
    background: rgba(217, 119, 6, 0.3);
    border-radius: 10px;
}

textarea::-webkit-scrollbar-thumb:hover {
    background: rgba(217, 119, 6, 0.5);
}

/* Animación de pulse para contador */
@keyframes pulse-custom {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

.animate-pulse {
    animation: pulse-custom 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>