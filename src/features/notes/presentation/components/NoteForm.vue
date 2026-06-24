<script setup lang="ts">
import type { Book } from '@/features/dashboard/domain/BookEntity';
import { BookApi } from '@/features/dashboard/infrastructure/BookApi';
import { reactive, ref } from 'vue';
import { useTopicStore } from '../../../topics/application/useTopicStore';
import { useNoteStore } from '../../application/useNoteStore';
import { NoteFactory, type NoteType } from '../../domain/entities/Note';
import BaseModal from '../../../../utils/components/BaseModal.vue';

const noteStore = useNoteStore();
const topicStore = useTopicStore();
const form = ref({ ...NoteFactory.createEmpty() });
const isSuccess = ref(false);

// Modal de selección de libros
const showBookModal = ref(false);
const books = ref<Book[]>([]);
const isLoadingBooks = ref(false);
const selectedBookId = ref<string | null>(null);
const bookApi = new BookApi();

// Modal de selección de temas
const showTopicModal = ref(false);
const selectedTopicId = ref<string>('');

// Mapeo de tipos de tema para etiquetas y colores
const topicTypeLabels: Record<string, string> = {
    research: 'Investigación',
    tech_stack: 'Tecnología',
    literature: 'Literatura',
    philosophy: 'Filosofía y Ética'
};

const topicTypeColors: Record<string, string> = {
    research: '#8B7355',
    tech_stack: '#4A6B7C',
    literature: '#7B5F65',
    philosophy: '#6B5F7B'
};


const noteTypes: { value: NoteType; label: string }[] = [
    { value: 'summary', label: 'Resumen' },
    { value: 'quote', label: 'Cita' },
    { value: 'idea', label: 'Idea' },
    { value: 'analysis', label: 'Análisis' },
    { value: 'note', label: 'Nota' },
];

// Errores de validacion
const errors = reactive({
    name: '',
    content: '',
    idBook: '',
    idTopics: ''
});

// Paleta cromática pastel/editorial silenciosa para los bloques de notas
const colorPalette = [
    '#FEF3C7', '#FCE7F3', '#DBEAFE', '#D1FAE5', '#FECACA', '#E9D5FF'
];

const handleSubmit = async () => {
    errors.name = !form.value.name.trim() ? 'El título es obligatorio' : '';
    errors.content = !form.value.content.trim() ? 'El contenido es obligatorio' : '';
    errors.idBook = !form.value.idBook ? 'Debes seleccionar un libro' : '';
    errors.idTopics = !form.value.idTopics ? 'Debes seleccionar un tema' : '';
    if (errors.name || errors.content || errors.idBook || errors.idTopics) return;

    const success = await noteStore.registerNote(form.value);
    if (success) {
        isSuccess.value = true;
        form.value = NoteFactory.createEmpty();
        setTimeout(() => {
            isSuccess.value = false;
        }, 4000);
    }
};

// Funciones del modal de libros
const openBookModal = async () => {
    showBookModal.value = true;
    isLoadingBooks.value = true;
    try {
        books.value = await bookApi.getAll();
    } catch (error) {
        console.error('Error al cargar libros:', error);
    } finally {
        isLoadingBooks.value = false;
    }
};

const closeBookModal = () => {
    showBookModal.value = false;
    selectedBookId.value = null;
};

const selectBook = (bookId: string) => {
    selectedBookId.value = bookId;
};

const confirmBookSelection = () => {
    if (selectedBookId.value) {
        form.value.idBook = selectedBookId.value;
    }
    closeBookModal();
};

// Funciones del modal de temas
const openTopicModal = async () => {
    showTopicModal.value = true;
    selectedTopicId.value = form.value.idTopics || '';
    await topicStore.loadTopics();
};

const closeTopicModal = () => {
    showTopicModal.value = false;
    selectedTopicId.value = '';
};

const selectTopic = (topicId: string) => {
    selectedTopicId.value = topicId;
};

const confirmTopicSelection = () => {
    if (selectedTopicId.value) {
        form.value.idTopics = selectedTopicId.value;
    }
    closeTopicModal();
};

const getTopicTypeLabel = (type: string): string => {
    return topicTypeLabels[type] || type;
};

const getTopicTypeColor = (type: string): string => {
    return topicTypeColors[type] || '#8B7355';
};
</script>

<template>
    <div class="min-h-screen-svh bg-gradient-to-br from-amber-50 via-white to-orange-50 py-8 px-4">
        <!-- Background decorativo -->
        <div class="fixed inset-0 pointer-none overflow-hidden">
            <div class="absolute -top-40 -right-40 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
            <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-100 rounded-full blur-3xl opacity-20"></div>
        </div>

        <!-- Contenido principal -->
        <div v-motion :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 600, ease: 'easeOut' } }"
            class="relative max-w-4xl mx-auto">
            <!-- Card principal -->
            <div class="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
                <!-- Header con icono -->
                <div :initial="{ opacity: 0, y: -20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 100, duration: 500 } }"
                    class="relative bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-12">
                    <!-- Decoracion de fondo -->
                    <div class="absolute inset-0 opacity-10">
                        <div class="absolute top-4 right-4 w-32 h-32 border border-white rounded-full"></div>
                        <div class="absolute bottom-4 left-4 w-24 h-24 border border-white rounded-full"></div>
                    </div>

                    <!-- Contenido del header -->
                    <div class="relative z-10">
                        <div class="flex items-center gap-3 mb-2">
                            <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" />
                            </svg>
                            <h1 class="text-3xl font-serif text-white tracking-wide">Bitácora de Lectura</h1>
                        </div>
                        <p class="text-amber-100 text-sm font-medium uppercase tracking-wides">
                            Captura tus pensamiento y descubrimientos
                        </p>
                    </div>
                </div>

                <!-- Formulario -->
                <form @submit.prevent="handleSubmit" class="p-8 md:p-12 space-y-6">

                    <!-- Campo: Titulo de la Nota -->
                    <div v-motion :initial="{ opacity: 0, x: -20 }"
                        :enter="{ opacity: 1, x: 0, transition: { delay: 150, duration: 500 } }" class="group">
                        <label
                            class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-700 mb-3">
                            <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Título
                            de
                            la
                            Nota</label>
                        <input v-model="form.name" type="text" required placeholder="Ej. Metáfora del hilo conductor..."
                            class="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 group-hover:border-amber-300" />
                        <p v-if="errors.name" class="text-xs text-red-600 mt-2 flex items-center gap-1">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M18.101 12.93a1 1 0 00-1.010-1.019c-1.16.064-2.303-.155-3.194-.75-.837-.563-1.534-1.434-2.027-2.422.645-1.215.915-2.699.915-4.287 0-3.424-1.924-6.403-4.606-6.403-2.682 0-4.606 2.979-4.606 6.403 0 3.424 1.924 6.403 4.606 6.403.196 0 .388-.015.578-.043.34.668.883 1.291 1.604 1.769.574.386 1.286.647 2.084.752.23.037.456.048.678.035.06.368.09.743.07 1.123-.02.394-.12.753-.27 1.074h-2.547c.066-.174.12-.353.159-.534a2 2 0 00-.966-2.309l-.997-.554a1.98 1.98 0 00-.97-.242c-.425.008-.845.092-1.241.232.26.902.818 1.746 1.658 2.336 1.074.733 2.497 1.038 4.011.999 1.515-.04 2.917-.38 3.95-1.085.98-.668 1.602-1.75 1.602-2.943 0-.29-.027-.574-.08-.848z" />
                            </svg>
                            {{ errors.name }}
                        </p>

                    </div>

                    <!-- Campo: Contenido -->
                    <div v-motion :initial="{ opacity: 0, x: -20 }"
                        :enter="{ opacity: 1, x: 0, transition: { delay: 200, duration: 500 } }" class="group">
                        <label
                            class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-700 mb-3">
                            <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Contenido
                            de la
                            Anotación</label>
                        <textarea v-model="form.content" required rows="5" maxlength="50000"
                            placeholder="Escribe tus reflexiones o fragmentos aquí..."
                            class="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 resize-none group-hover:border-amber-300"></textarea>
                        <div class="flex justify-between items-center mt-2">
                            <p v-if="errors.content" class="text-xs text-red-600 flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M18.101 12.93a1 1 0 00-1.010-1.019c-1.16.064-2.303-.155-3.194-.75-.837-.563-1.534-1.434-2.027-2.422.645-1.215.915-2.699.915-4.287 0-3.424-1.924-6.403-4.606-6.403-2.682 0-4.606 2.979-4.606 6.403 0 3.424 1.924 6.403 4.606 6.403.196 0 .388-.015.578-.043.34.668.883 1.291 1.604 1.769.574.386 1.286.647 2.084.752.23.037.456.048.678.035.06.368.09.743.07 1.123-.02.394-.12.753-.27 1.074h-2.547c.066-.174.12-.353.159-.534a2 2 0 00-.966-2.309l-.997-.554a1.98 1.98 0 00-.97-.242c-.425.008-.845.092-1.241.232.26.902.818 1.746 1.658 2.336 1.074.733 2.497 1.038 4.011.999 1.515-.04 2.917-.38 3.95-1.085.98-.668 1.602-1.75 1.602-2.943 0-.29-.027-.574-.08-.848z" />
                                </svg>
                                {{ errors.content }}
                            </p>
                            <span class="text-xs text-gray-500 font-medium">{{ form.content.length }}/5000</span>
                        </div>
                    </div>

                    <!-- Grid: Tipo y Color -->
                    <div v-motion :intial="{ opacity: 0, x: -20 }"
                        :enter="{ opacity: 1, x: 0, transition: { delay: 250, duration: 500 } }"
                        class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Tipo de Nota -->
                        <div class="group">
                            <label
                                class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-700 mb-3">
                                <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                                Tipo
                                de
                                Nota</label>
                            <select v-model="form.type"
                                class="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 appearance-none cursor-pointer group-hover:border-amber-300 pr-10">
                                <option value="">Seleccionar tipo...</option>
                                <option v-for="type in noteTypes" :key="type.value" :value="type.value">
                                    {{ type.label }}
                                </option>
                                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </select>
                        </div>

                        <!-- Color picker -->
                        <div class="group">
                            <label
                                class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-700 mb-3">
                                <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                                Color
                                del
                                Bloque</label>
                            <div class="flex items-center gap-3 flex-wrap">
                                <button v-for="color in colorPalette" :key="color" type="button"
                                    @click="form.color = color" v-motion :initial="{ scale: 0, opacity: 0 }"
                                    :enter="{ scale: 1, opacity: 1, transition: { duration: 300 } }"
                                    :style="{ backgroundColor: color }" :class="[
                                        'w-8 h-8 rounded-full transition-all duration-300 border-2 flex items-center justify-center shadow-sm',
                                        form.color === color
                                            ? 'border-gray-900 scale-110 shadow-lg ring-2 ring-amber-400'
                                            : 'border-gray-300 hover:scale-110 hover:border-gray-500'
                                    ]
                                        ">
                                    <svg v-if="form.color === color" class="w-4 h-4 text-gray-900" fill="currentColor"
                                        viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Grid: IDs -->
                    <div v-motion :initial="{ opacity: 0, x: -20 }"
                        :enter="{ opacity: 1, x: 0, transition: { delay: 300, duration: 500 } }"
                        class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- ID Libro -->
                        <div v-motion :initial="{ opacity: 0, x: -20 }"
                            :enter="{ opacity: 1, x: 0, transition: { delay: 300, duration: 500 } }" class="group">
                            <label
                                class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-700 mb-3">
                                <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                ID
                                del
                                Libro</label>
                            <div class="flex gap-2">
                                <input v-model="form.idBook" type="text" required placeholder="uuid-libro"
                                    class="flex-1 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 group-hover:border-amber-300 font-mono text-xs" />
                                <button type="button" @click="openBookModal"
                                    class="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Seleccionar Libro
                                </button>
                            </div>
                            <p v-if="errors.idBook" class="text-xs text-red-600 mt-2 flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M18.101 12.93a1 1 0 00-1.010-1.019c-1.16.064-2.303-.155-3.194-.75-.837-.563-1.534-1.434-2.027-2.422.645-1.215.915-2.699.915-4.287 0-3.424-1.924-6.403-4.606-6.403-2.682 0-4.606 2.979-4.606 6.403 0 3.424 1.924 6.403 4.606 6.403.196 0 .388-.015.578-.043.34.668.883 1.291 1.604 1.769.574.386 1.286.647 2.084.752.23.037.456.048.678.035.06.368.09.743.07 1.123-.02.394-.12.753-.27 1.074h-2.547c.066-.174.12-.353.159-.534a2 2 0 00-.966-2.309l-.997-.554a1.98 1.98 0 00-.97-.242c-.425.008-.845.092-1.241.232.26.902.818 1.746 1.658 2.336 1.074.733 2.497 1.038 4.011.999 1.515-.04 2.917-.38 3.95-1.085.98-.668 1.602-1.75 1.602-2.943 0-.29-.027-.574-.08-.848z" />
                                </svg>
                                {{ errors.idBook }}
                            </p>
                        </div>

                        <!-- ID Tema -->
                        <div class="group">
                            <label
                                class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-700 mb-3">
                                <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                ID
                                del Tema /
                                Tópico</label>
                            <div class="flex gap-2">
                                <input v-model="form.idTopics" type="text" required placeholder="uuid-tema"
                                    class="flex-1 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 group-hover:border-amber-300 font-mono text-xs" />
                                <button type="button" @click="openTopicModal"
                                    class="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Seleccionar Tema
                                </button>
                            </div>
                            <p v-if="errors.idTopics" class="text-xs text-red-600 mt-2 flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M18.101 12.93a1 1 0 00-1.010-1.019c-1.16.064-2.303-.155-3.194-.75-.837-.563-1.534-1.434-2.027-2.422.645-1.215.915-2.699.915-4.287 0-3.424-1.924-6.403-4.606-6.403-2.682 0-4.606 2.979-4.606 6.403 0 3.424 1.924 6.403 4.606 6.403.196 0 .388-.015.578-.043.34.668.883 1.291 1.604 1.769.574.386 1.286.647 2.084.752.23.037.456.048.678.035.06.368.09.743.07 1.123-.02.394-.12.753-.27 1.074h-2.547c.066-.174.12-.353.159-.534a2 2 0 00-.966-2.309l-.997-.554a1.98 1.98 0 00-.97-.242c-.425.008-.845.092-1.241.232.26.902.818 1.746 1.658 2.336 1.074.733 2.497 1.038 4.011.999 1.515-.04 2.917-.38 3.95-1.085.98-.668 1.602-1.75 1.602-2.943 0-.29-.027-.574-.08-.848z" />
                                </svg>
                                {{ errors.idTopics }}
                            </p>
                        </div>
                    </div>

                    <!-- Mensajes de estado -->
                    <transition name="slide-fade">
                        <div v-if="noteStore.error" v-motion :initial="{ opacity: 0, y: -10 }"
                            :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }"
                            class="rounded-xl bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
                            <svg class="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p class="font-semibold text-red-800">Error al guardar</p>
                                <p class="text-sm text-red-700 mt-1">{{ noteStore.error }}</p>
                            </div>
                        </div>

                        <div v-else-if="isSuccess" v-motion :initial="{ opacity: 0, y: -10 }"
                            :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }"
                            class="rounded-xl bg-green-50 border-l-4 border-green-500 p-4 flex items-start gap-3">
                            <svg class="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor"
                                viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                            <div>
                                <p class="font-semibold text-green-800">¡Éxito!</p>
                                <p class="text-sm text-green-700 mt-1">Tu nota ha sido guardada correctamente en tu
                                    bitácora de lectura.</p>
                            </div>
                        </div>
                    </transition>
                    <!-- Boton submit -->
                    <div class="pt-4 space-y-3">
                        <button type="submit" :disabled="noteStore.isLoading" v-motion :initial="{ opacity: 0, y: 20 }"
                            :enter="{ opacity: 1, y: 0, transition: { delay: 400, duration: 500 } }"
                            class="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-sm py-4 px-6 uppercase tracking-wider transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
                            <!-- Efecto brillo en hover -->
                            <div
                                class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out">
                            </div>
                            <!-- Contenido del boton -->
                            <div class="relative flex items-center justify-center gap-2">
                                <svg v-if="noteStore.isLoading" class="w-5 h-5 animate-spin" fill="none"
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
                                {{ noteStore.isLoading ? 'Preservando nota...' : 'Guardar en Bitácora' }}
                            </div>
                        </button>

                        <!-- Texto de ayuda -->
                        <p class="text-center text-xs text-gray-500 font-medium">
                            Tus notas se sincronizaran automáticamente con tu perfil de autor
                        </p>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal de selección de libros -->
        <BaseModal :is-open="showBookModal" max-with-class="max-w-2xl" @close="closeBookModal">
            <template #header>
                <div class="flex items-center gap-3">
                    <svg class="w-6 h-6 text-[#111110]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h2 class="text-lg font-serif font-bold">Seleccionar Libro</h2>
                </div>
            </template>

            <template #content>
                <div class="overflow-y-auto max-h-[60vh] -mx-2 px-2">
                    <div v-if="isLoadingBooks" class="flex flex-col items-center justify-center py-12">
                        <svg class="w-10 h-10 text-amber-600 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p class="text-gray-600 font-medium">Cargando libros...</p>
                    </div>

                    <div v-else-if="books.length === 0" class="text-center py-12">
                        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p class="text-gray-600 font-medium mb-2">No hay libros disponibles</p>
                        <p class="text-sm text-gray-500">Registra un libro primero para poder seleccionarlo.</p>
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="book in books" :key="book.id"
                            class="flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300"
                            :class="selectedBookId === book.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'"
                            @click="selectBook(book.id)">
                            <input type="checkbox" :checked="selectedBookId === book.id"
                                class="mt-1 h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer" />
                            <div class="flex-1 min-w-0">
                                <h3 class="font-semibold text-gray-900 mb-1">{{ book.title }}</h3>
                                <p class="text-sm text-gray-600 mb-1">{{ book.author }}</p>
                                <p class="text-xs text-gray-500 line-clamp-2">{{ book.description }}</p>
                                <div class="flex flex-wrap gap-1 mt-2">
                                    <span v-for="genre in book.genres.slice(0, 3)" :key="genre"
                                        class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{{ genre }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <template #footer>
                <button type="button" @click="closeBookModal"
                    class="px-4 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors">
                    Cancelar
                </button>
                <button type="button" @click="confirmBookSelection" :disabled="!selectedBookId"
                    class="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 shadow-md">
                    Confirmar selección
                </button>
            </template>
        </BaseModal>

        <!-- Modal de selección de temas -->
        <BaseModal :is-open="showTopicModal" max-with-class="max-w-2xl" @close="closeTopicModal">
            <template #header>
                <div class="flex items-center gap-3">
                    <svg class="w-6 h-6 text-[#111110]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h2 class="text-lg font-serif font-bold">Seleccionar Tema</h2>
                </div>
            </template>

            <template #content>
                <div class="overflow-y-auto max-h-[60vh] -mx-2 px-2">
                    <div v-if="topicStore.isLoadingList" class="flex flex-col items-center justify-center py-12">
                        <svg class="w-10 h-10 text-amber-600 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p class="text-gray-600 font-medium">Cargando temas...</p>
                    </div>

                    <div v-else-if="topicStore.topicsList.length === 0" class="text-center py-12">
                        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p class="text-gray-600 font-medium mb-2">No hay temas disponibles</p>
                        <p class="text-sm text-gray-500">Crea un tema primero para poder seleccionarlo.</p>
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="topic in topicStore.topicsList" :key="topic.id || topic.name"
                            class="flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300"
                            :class="selectedTopicId === topic.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'"
                            @click="selectTopic(topic.id || '')">
                            <input type="checkbox" :checked="selectedTopicId === topic.id"
                                class="mt-1 h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer" />
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <h3 class="font-semibold text-gray-900">{{ topic.name }}</h3>
                                    <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                                        :style="{ backgroundColor: getTopicTypeColor(topic.type) + '20', color: getTopicTypeColor(topic.type) }">
                                        {{ getTopicTypeLabel(topic.type) }}
                                    </span>
                                </div>
                                <p class="text-sm text-gray-600 line-clamp-2">{{ topic.description }}</p>
                                <p v-if="topic.createdAt" class="text-xs text-gray-400 mt-1">
                                    {{ new Date(topic.createdAt).toLocaleDateString('es-CO') }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <template #footer>
                <button type="button" @click="closeTopicModal"
                    class="px-4 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors">
                    Cancelar
                </button>
                <button type="button" @click="confirmTopicSelection" :disabled="!selectedTopicId"
                    class="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 shadow-md">
                    Confirmar selección
                </button>
            </template>
        </BaseModal>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
    transform: scale(0.95);
}
</style>