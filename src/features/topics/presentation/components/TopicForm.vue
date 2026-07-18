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
        class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-stone-100 py-8 px-4 relative overflow-hidden">

        <!-- Decoradores globales -->
        <div class="pointer-events-none fixed right-0 top-0 opacity-10 -z-10">
            <svg width="380" height="270" viewBox="0 0 380 270" fill="none">
                <circle cx="340" cy="-20" r="170" fill="#f59e0b" />
                <circle cx="285" cy="60" r="85" fill="#ea580c" />
            </svg>
        </div>
        <div class="pointer-events-none fixed bottom-0 left-0 opacity-5 -z-10">
            <svg width="260" height="210" viewBox="0 0 260 210" fill="none">
                <circle cx="0" cy="210" r="155" fill="#f59e0b" />
            </svg>
        </div>

        <!-- Contenedor principal -->
        <div v-motion :initial="{ opacity: 0, y: 24 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 600, ease: 'easeOut' } }"
            class="relative max-w-2xl mx-auto space-y-0">

            <!-- ── Card principal ── -->
            <div
                class="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 backdrop-blur-sm shadow-2xl shadow-amber-100/60">
                <div
                    class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

                <!-- ── Header decorativo ── -->
                <div
                    class="relative bg-gradient-to-r from-amber-600 via-orange-500 to-orange-600 px-8 md:px-12 py-12 overflow-hidden">

                    <!-- Patrón de libros SVG de fondo -->
                    <div class="absolute inset-0 opacity-10 pointer-events-none">
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
                        <div class="flex items-center gap-3 mb-4">
                            <!-- Ícono con halo -->
                            <div class="relative">
                                <div class="absolute inset-0 rounded-xl bg-white/20 blur-sm scale-110" />
                                <div
                                    class="relative w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-sm"
                                    v-motion
                                    :initial="{ opacity: 0, scale: 0.5, rotate: -20 }"
                                    :enter="{ opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 12, delay: 200 } }"
                                    :hovered="{ scale: 1.15, rotate: 5, transition: { type: 'spring', stiffness: 300, damping: 15 } }"
                                    :leave="{ scale: 1, rotate: 0, transition: { duration: 200 } }">
                                    <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <!-- Badge de tipo -->
                            <span
                                class="inline-flex items-center text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/80 bg-white/15 border border-white/20 rounded-full px-3 py-1">
                                Biblioteca · Alajandría
                            </span>
                        </div>

                        <h1 class="font-serif text-3xl md:text-4xl font-bold text-white leading-tight tracking-wide">
                            Nuevo Eje de Estudio
                        </h1>
                        <p class="text-amber-100/80 text-sm font-medium mt-1.5">
                            Clasificación y Taxonomía de Conocimiento
                        </p>
                        <p class="text-amber-100/60 text-xs mt-3 max-w-md leading-relaxed uppercase tracking-widest">
                            Define nuevos temas para organizar tu repositorio de conocimiento académico y literario
                        </p>
                    </div>
                </div>

                <!-- ── Formulario ── -->
                <form @submit.prevent="handleSubmit" class="p-8 md:p-10 space-y-7">

                    <!-- ── Campo: Nombre del tema ── -->
                    <div v-motion :initial="{ opacity: 0, x: -20 }"
                        :enter="{ opacity: 1, x: 0, transition: { delay: 100, duration: 500 } }" class="space-y-2">
                        <!-- Label con ícono badge -->
                        <div class="flex items-center gap-2 mb-1">
                            <span
                                class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shrink-0">
                                <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </span>
                            <label class="text-xs font-black text-stone-500 uppercase tracking-[0.15em]">
                                Nombre del tema
                                <span class="text-orange-500 ml-0.5">*</span>
                            </label>
                        </div>

                        <div class="relative">
                            <input v-model="form.name" type="text" required
                                placeholder="Ej. Arquitectura de Software y Patrones Decoupled"
                                class="w-full bg-amber-50/40 border-2 border-amber-200/60 rounded-xl px-5 py-3.5 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/10 hover:border-amber-300 transition-all duration-200" />
                            <!-- Indicador de campo válido -->
                            <div v-if="form.name?.trim()"
                                class="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- ── Campo: Tipo ── -->
                    <div v-motion :initial="{ opacity: 0, x: -20 }"
                        :enter="{ opacity: 1, x: 0, transition: { delay: 150, duration: 500 } }" class="space-y-2">
                        <div class="flex items-center gap-2 mb-1">
                            <span
                                class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shrink-0">
                                <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </span>
                            <label class="text-xs font-black text-stone-500 uppercase tracking-[0.15em]">
                                Línea de Conocimiento
                                <span class="text-orange-500 ml-0.5">*</span>
                            </label>
                        </div>

                        <div class="relative">
                            <select v-model="form.type"
                                class="w-full appearance-none bg-amber-50/40 border-2 border-amber-200/60 rounded-xl px-5 py-3.5 pr-10 text-sm text-stone-700 focus:outline-none focus:bg-white focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/10 hover:border-amber-300 transition-all duration-200 cursor-pointer"
                                :class="!form.type && 'text-stone-400'">
                                <option value="" disabled>Seleccionar tipo…</option>
                                <option v-for="type in topicTypes" :key="type.value" :value="type.value"
                                    class="text-stone-700">
                                    {{ type.label }}
                                </option>
                            </select>
                            <!-- Chevron -->
                            <div class="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                                <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- ── Divider ── -->
                    <div class="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

                    <!-- ── Campo: Descripción ── -->
                    <div v-motion :initial="{ opacity: 0, x: -20 }"
                        :enter="{ opacity: 1, x: 0, transition: { delay: 200, duration: 500 } }" class="space-y-2">
                        <!-- Label + contador de caracteres -->
                        <div class="flex items-center gap-2 mb-1">
                            <span
                                class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shrink-0">
                                <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </span>
                            <label class="text-xs font-black text-stone-500 uppercase tracking-[0.15em] flex-1">
                                Descripción y Alcance
                                <span class="text-orange-500 ml-0.5">*</span>
                            </label>
                            <!-- Contador — semáforo visual por color -->
                            <div class="shrink-0 text-[10px] font-bold font-mono transition-all duration-300 px-2 py-0.5 rounded-full border"
                                :class="isDescriptionOverLimit
                                    ? 'text-rose-600 bg-rose-50 border-rose-200 animate-pulse'
                                    : descriptionLength > maxDescriptionLength * 0.8
                                        ? 'text-amber-600 bg-amber-50 border-amber-200'
                                        : 'text-stone-400 bg-stone-50 border-stone-200'">
                                {{ descriptionLength }}<span class="opacity-40">/{{ maxDescriptionLength }}</span>
                            </div>
                        </div>

                        <textarea v-model="form.description" required rows="4"
                            placeholder="Define los límites conceptuales, autores base u objetivos de aprendizaje de este tema..."
                            class="w-full bg-amber-50/40 border-2 rounded-xl px-5 py-4 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:bg-white focus:shadow-lg transition-all duration-200 resize-none hover:border-amber-300"
                            :class="isDescriptionOverLimit
                                ? 'border-rose-400 focus:border-rose-500 focus:shadow-rose-500/10'
                                : 'border-amber-200/60 focus:border-amber-500 focus:shadow-amber-500/10'" />

                        <!-- Nota informativa debajo del textarea -->
                        <div class="flex items-center gap-2 mt-1.5">
                            <svg class="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                                    clip-rule="evenodd" />
                            </svg>
                            <p class="text-[11px] text-stone-400">Este tema será asociado automáticamente con tus libros
                                y notas.</p>
                        </div>
                    </div>

                    <!-- ── Feedback: Error / Éxito ── -->
                    <Transition enter-active-class="transition-all duration-300 ease-out"
                        enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
                        leave-active-class="transition-all duration-200 ease-in"
                        leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
                        <!-- Error -->
                        <div v-if="topicStore.feedbackError"
                            class="relative overflow-hidden flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-4">
                            <div
                                class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/60 to-transparent" />
                            <div
                                class="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                                <svg class="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p class="font-bold text-rose-800 text-sm">Error al registrar el tema</p>
                                <p class="text-xs text-rose-600 mt-0.5 leading-relaxed">{{ topicStore.feedbackError }}
                                </p>
                            </div>
                        </div>

                        <!-- Éxito -->
                        <div v-else-if="isSuccess"
                            class="relative overflow-hidden flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4">
                            <div
                                class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
                            <div
                                class="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                                <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p class="font-bold text-emerald-800 text-sm">¡Tema registrado exitosamente!</p>
                                <p class="text-xs text-emerald-600 mt-0.5 leading-relaxed">El tema de estudio ha sido
                                    indexado en tu repositorio de conocimiento.</p>
                            </div>
                        </div>
                    </Transition>

                    <!-- ── Divider ── -->
                    <div class="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

                    <!-- ── Botón submit ── -->
                    <button type="submit" :disabled="topicStore.isSubmitting || isDescriptionOverLimit" v-motion
                        :initial="{ opacity: 0, y: 20 }"
                        :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 500 } }"
                        class="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm py-4 px-6 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] group">
                        <!-- Efecto brillo -->
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                        <div class="relative flex items-center justify-center gap-3">
                            <!-- Spinner -->
                            <svg v-if="topicStore.isSubmitting" class="w-4 h-4 animate-spin" fill="none"
                                viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <!-- Ícono enviar -->
                            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            <span class="tracking-wide uppercase text-xs font-black">
                                {{ topicStore.isSubmitting ? 'Indexando Tema…' : 'Registrar Tema de Estudio' }}
                            </span>
                        </div>
                    </button>

                </form>
            </div>
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