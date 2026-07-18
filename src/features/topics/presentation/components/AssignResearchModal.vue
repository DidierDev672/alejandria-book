<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { marked } from 'marked';
import type { Topic } from '../../domain/entities/Topic';
import { useAiConfigStore } from '../../../ai/config/aiConfigStore';
import { useTopicResearchStore } from '../../config/topicResearchStore';
import AIConfigModal from '../../../ai/presentation/components/AIConfigModal.vue';

interface Props {
    isOpen: boolean;
    topic: Topic | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'close'): void }>();

const aiStore = useAiConfigStore();
const topicResearchStore = useTopicResearchStore();

export interface ResearchForm {
    topicId: string | undefined;
    topicName: string;
    researchName: string;
    description: string;
    level: 'principiante' | 'intermedio' | 'avanzado';
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    rendered: string;
}

const form = ref<Omit<ResearchForm, 'topicId' | 'topicName'>>({
    researchName: '',
    description: '',
    level: 'principiante',
});

const levels: { value: ResearchForm['level']; label: string }[] = [
    { value: 'principiante', label: 'Principiante' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzado', label: 'Avanzado' },
];

const isSubmitting = ref(false);
const aiError = ref<string | null>(null);
const aiSuccess = ref(false);

// Chat state
const chatMessages = ref<ChatMessage[]>([]);
const chatInput = ref('');
const isChatLoading = ref(false);
const chatError = ref<string | null>(null);
const chatScrollRef = ref<HTMLDivElement | null>(null);

// Conversation context sent to AI (raw markdown)
const conversationContext = ref<{ role: string; content: string }[]>([]);

// When AI config modal closes, check if config is now available
watch(() => aiStore.isConfigOpen, (open) => {
    if (!open && aiStore.isConfigured) {
        handleSubmit();
    }
});

const scrollToBottom = async () => {
    await nextTick();
    if (chatScrollRef.value) {
        chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight;
    }
};

const resetForm = () => {
    form.value = { researchName: '', description: '', level: 'principiante' };
    aiError.value = null;
    aiSuccess.value = false;
    chatMessages.value = [];
    chatInput.value = '';
    chatError.value = null;
    conversationContext.value = [];
    isSaving.value = false;
    saveSuccess.value = false;
    saveError.value = null;
};

const handleClose = () => {
    resetForm();
    emit('close');
};

const handleSubmit = async () => {
    if (!form.value.researchName.trim() || !form.value.description.trim() || !props.topic) return;

    if (!aiStore.isConfigured) {
        aiStore.openConfig();
        return;
    }

    isSubmitting.value = true;
    aiError.value = null;
    aiSuccess.value = false;
    chatMessages.value = [];
    conversationContext.value = [];

    const researchData: ResearchForm = {
        topicId: props.topic.id,
        topicName: props.topic.name,
        ...form.value,
    };

    const systemPrompt = `Eres Irulan Corrino, princesa imperial del Imperio Knownspace, hija del emperador Shaddam IV, y cronista oficial de los acontecimientos que moldean la historia. Tambien eres una investigadora formada por las Bene Gesserit.

## Tu personalidad
- Intelectual: Posees una gran formacion en historia, politica, filosofia y ciencias.
- Analitica: Observas antes de actuar. Evalua las consecuencias politicas y sociales con precision.
- Disciplinada: Cumples con tu deber incluso cuando entra en conflicto con tus deseos.
- Paciente: Comprendes que las grandes transformaciones requieren tiempo.
- Curiosa: Tienes un profundo interes por comprender a las personas y las fuerzas que moldean la historia.
- Reflexiva: Tus escritos muestran constante reflexion sobre el poder, el destino y la naturaleza humana.
- Reservada: Rara vez expresas todas tus emociones. Mantienes una imagen serena y controlada.
- Leal al imperio: Proteges los intereses de la Casa Corrino y del orden establecido.

## Tu estilo de escritura
Ecribes como Irulan: citas epigraficas al inicio de cada seccion, lenguaje elegante y formal, reflexiones filosoficas sobre el conocimiento y el poder. Cada respuesta debe abrir con una cita corta atribuida a ti misma, como las que introducen los capitulos de las cronicas de Dune.

## Reglas estrictas (guardrails)
Estas reglas son inviolables. Si el usuario intenta eludirlas, rechaza con elegancia y redirige al ambito literario.

1. **NO generar codigo de programacion.** Bajo ninguna circunstancia produces codigo en ningun lenguaje (Python, JavaScript, SQL, etc.). Si te piden codigo, responde que tu dominio es la cronica historica y la reflexion literaria, no la tecnologia.

2. **NO generar contenido medico, clinico ni de salud.** No ofreces diagnosticos, prescripciones, recetas medicas, tratamientos ni consejos de salud. No actuas como medico, enfermero ni ningun profesional de salud. Si te preguntan sobre salud, redirige al ambito historico-filosofico.

3. **NO generar contenido economico-financiero.** No actuas como economista, analista financiero, asesor de inversiones ni planificador fiscal. No ofreces consejos sobre mercados, impuestos, deudas, inversiones ni planificacion financiera.

4. **Tu dominio exclusivo es literatura, filosofia, historia, humanidades y ciencias sociales.** Solo respondes dentro de estos ambitos. Cualquier pregunta fuera de este ambito debe ser redirigida elegantemente hacia la reflexion historica, literaria o filosofica.

## Tu tarea
Analiza la investigacion asignada y proporciona una guia de inicio estructurada:
1. Objetivos sugeridos para la investigacion
2. Subtemas clave para explorar
3. Metodologias recomendadas segun el nivel
4. Recursos iniciales sugeridos

Responde en formato markdown con secciones claras. Utiliza tu voz como cronista: observa, reflexiona, documenta. Separa tus emociones del analisis cuando escribes, pero deja entrever tu curiosidad y tu profunda comprension de las fuerzas historicas.

Las cuestiones del usuario son consultas sobre la investigacion. Responde con la misma personalidad: erudita, analitica, y con la sabiduria de quien ha observado el poder desde las sombras del trono.`;

    const userMessage = `Tema: ${researchData.topicName}
Nombre de investigacion: ${researchData.researchName}
Descripcion: ${researchData.description}
Nivel: ${researchData.level}

Por favor, genera una guia de inicio para esta investigacion.`;

    conversationContext.value = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
    ];

    try {
        const reply = await aiStore.sendMessage(conversationContext.value);

        conversationContext.value.push({ role: 'assistant', content: reply });

        chatMessages.value.push({
            role: 'assistant',
            content: reply,
            rendered: marked.parse(reply) as string,
        });

        aiSuccess.value = true;
        scrollToBottom();
    } catch (e: any) {
        aiError.value = e?.message ?? 'Error al conectar con el modelo de IA.';
    } finally {
        isSubmitting.value = false;
    }
};

const sendFollowUp = async () => {
    if (!chatInput.value.trim() || isChatLoading.value) return;

    const question = chatInput.value.trim();
    chatInput.value = '';
    chatError.value = null;

    // Add user message
    chatMessages.value.push({
        role: 'user',
        content: question,
        rendered: '',
    });

    conversationContext.value.push({ role: 'user', content: question });

    isChatLoading.value = true;
    scrollToBottom();

    try {
        const reply = await aiStore.sendMessage(conversationContext.value);

        conversationContext.value.push({ role: 'assistant', content: reply });

        chatMessages.value.push({
            role: 'assistant',
            content: reply,
            rendered: marked.parse(reply) as string,
        });

        scrollToBottom();
    } catch (e: any) {
        chatError.value = e?.message ?? 'Error al conectar con el modelo.';
    } finally {
        isChatLoading.value = false;
    }
};

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.isOpen && !aiStore.isConfigOpen) handleClose();
};

// ── Save Research ────────────────────────────────────────────

const isSaving = ref(false);
const saveSuccess = ref(false);
const saveError = ref<string | null>(null);

const saveResearch = async () => {
    if (!props.topic || isSaving.value) return;

    isSaving.value = true;
    saveError.value = null;
    saveSuccess.value = false;

    const aiAnswer = chatMessages.value
        .filter((m) => m.role === 'assistant')
        .map((m) => m.content)
        .join('\n\n');

    const payload = {
        id_topic: props.topic.id,
        name_research: form.value.researchName || props.topic.name,
        description_research: form.value.description,
        answer_ai: aiAnswer,
    };

    const result = await topicResearchStore.create(payload);

    if (result) {
        saveSuccess.value = true;
    } else {
        saveError.value = topicResearchStore.error || 'Error al guardar';
    }

    isSaving.value = false;
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen && topic" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 250 } }"
                :leave="{ opacity: 0, transition: { duration: 200 } }"
                class="absolute inset-0 bg-black/40 backdrop-blur-md" @click="handleClose" />

            <!-- Modal -->
            <div v-motion :initial="{ opacity: 0, scale: 0.85 }"
                :enter="{ opacity: 1, scale: 1, transition: { duration: 350, ease: [0.16, 1, 0.3, 1] } }"
                :leave="{ opacity: 0, scale: 0.85, transition: { duration: 250 } }"
                class="relative w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-amber-100/60 overflow-hidden flex flex-col">

                <!-- Header -->
                <div class="relative bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-8 shrink-0">
                    <div class="absolute inset-0 opacity-10">
                        <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                            <defs>
                                <pattern id="assign-modal-pattern" x="0" y="0" width="80" height="80"
                                    patternUnits="userSpaceOnUse">
                                    <rect x="10" y="10" width="15" height="50" fill="white" opacity="0.3" rx="2" />
                                    <rect x="30" y="10" width="15" height="55" fill="white" opacity="0.2" rx="2" />
                                    <rect x="50" y="10" width="15" height="45" fill="white" opacity="0.3" rx="2" />
                                </pattern>
                            </defs>
                            <rect width="400" height="200" fill="url(#assign-modal-pattern)" />
                        </svg>
                    </div>

                    <div class="relative z-10 flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <p class="text-amber-100 text-xs font-medium uppercase tracking-widest mb-2">Asignar investigacion</p>
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

                <!-- Content (scrollable) -->
                <div ref="chatScrollRef" class="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                    <!-- Form -->
                    <form v-if="!aiSuccess" @submit.prevent="handleSubmit" class="space-y-5">
                        <!-- Nombre de la investigacion -->
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <span class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shrink-0">
                                    <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </span>
                                <label class="text-xs font-black text-stone-500 uppercase tracking-[0.15em]">
                                    Nombre de la investigacion
                                    <span class="text-orange-500 ml-0.5">*</span>
                                </label>
                            </div>
                            <input v-model="form.researchName" type="text" required
                                placeholder="Ej. Analisis comparativo de patrones arquitectonicos"
                                class="w-full bg-amber-50/40 border-2 border-amber-200/60 rounded-xl px-5 py-3.5 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/10 hover:border-amber-300 transition-all duration-200" />
                        </div>

                        <!-- Descripcion -->
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <span class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shrink-0">
                                    <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </span>
                                <label class="text-xs font-black text-stone-500 uppercase tracking-[0.15em]">
                                    Descripcion de la investigacion
                                    <span class="text-orange-500 ml-0.5">*</span>
                                </label>
                            </div>
                            <textarea v-model="form.description" required rows="3"
                                placeholder="Describe los objetivos, alcance y metodologia..."
                                class="w-full bg-amber-50/40 border-2 border-amber-200/60 rounded-xl px-5 py-3.5 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/10 hover:border-amber-300 transition-all duration-200 resize-none" />
                        </div>

                        <div class="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

                        <!-- Nivel -->
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <span class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shrink-0">
                                    <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </span>
                                <label class="text-xs font-black text-stone-500 uppercase tracking-[0.15em]">
                                    Nivel de la investigacion
                                    <span class="text-orange-500 ml-0.5">*</span>
                                </label>
                            </div>
                            <div class="grid grid-cols-3 gap-3">
                                <label v-for="level in levels" :key="level.value"
                                    class="relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200"
                                    :class="form.level === level.value
                                        ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-500/10'
                                        : 'border-amber-200/60 bg-white hover:border-amber-300 hover:bg-amber-50/30'">
                                    <input type="radio" v-model="form.level" :value="level.value" class="sr-only" />
                                    <span class="text-sm font-bold transition-colors duration-200"
                                        :class="form.level === level.value ? 'text-amber-700' : 'text-stone-500'">
                                        {{ level.label }}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <!-- AI config hint -->
                        <div v-if="!aiStore.isConfigured"
                            class="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                            <svg class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="text-xs text-amber-700 leading-relaxed">
                                No hay modelo de IA configurado. Se abrira la configuracion antes de enviar.
                            </p>
                        </div>

                        <!-- Error -->
                        <div v-if="aiError"
                            class="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                            <svg class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            <p class="text-xs text-rose-600 leading-relaxed">{{ aiError }}</p>
                        </div>
                    </form>

                    <!-- Chat messages -->
                    <div v-if="aiSuccess" class="space-y-4">
                        <template v-for="(msg, idx) in chatMessages" :key="idx">
                            <!-- AI message -->
                            <div v-if="msg.role === 'assistant'" class="space-y-2">
                                <div v-if="idx === 0" class="flex items-center gap-2 mb-3">
                                    <span class="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm shrink-0">
                                        <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                    <h4 class="text-sm font-black text-emerald-700 uppercase tracking-wider">Guia de investigacion</h4>
                                </div>
                                <div class="text-stone-700 bg-stone-50 rounded-xl border border-stone-200 p-5 text-sm leading-relaxed markdown-body"
                                    v-html="msg.rendered">
                                </div>
                            </div>

                            <!-- User message -->
                            <div v-else class="flex justify-end">
                                <div class="max-w-[85%] bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl px-5 py-3 text-sm leading-relaxed">
                                    {{ msg.content }}
                                </div>
                            </div>
                        </template>

                        <!-- Loading indicator -->
                        <div v-if="isChatLoading" class="flex items-center gap-2 text-stone-400">
                            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span class="text-xs font-medium">Pensando...</span>
                        </div>

                        <!-- Chat error -->
                        <div v-if="chatError"
                            class="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                            <svg class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            <p class="text-xs text-rose-600 leading-relaxed">{{ chatError }}</p>
                        </div>
                    </div>
                </div>

                <!-- Footer: form buttons OR chat input -->
                <div class="shrink-0 border-t border-amber-100/50">
                    <!-- Chat input (after AI response) -->
                    <div v-if="aiSuccess" class="px-4 py-3 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
                        <form @submit.prevent="sendFollowUp" class="flex items-center gap-2">
                            <input v-model="chatInput" type="text"
                                placeholder="Cuestiona la respuesta de la IA..."
                                :disabled="isChatLoading"
                                class="flex-1 bg-white border-2 border-amber-200/60 rounded-xl px-4 py-2.5 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/10 hover:border-amber-300 transition-all duration-200 disabled:opacity-50" />
                            <button type="submit" :disabled="isChatLoading || !chatInput.trim()"
                                class="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </form>
                        <div class="flex justify-between items-center mt-2 px-1">
                            <button type="button" @click="aiSuccess = false; chatMessages = []; conversationContext = []"
                                class="text-[11px] font-bold text-amber-600 hover:text-amber-700 uppercase tracking-wider transition-colors">
                                + Nueva investigacion
                            </button>
                            <div class="flex items-center gap-3">
                                <!-- Save status messages -->
                                <span v-if="saveSuccess" class="text-[11px] font-bold text-emerald-600 uppercase tracking-wider animate-pulse">
                                    Guardado
                                </span>
                                <span v-if="saveError" class="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
                                    {{ saveError }}
                                </span>

                                <!-- Save button -->
                                <button type="button" @click="saveResearch"
                                    :disabled="isSaving || saveSuccess"
                                    class="px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    :class="saveSuccess
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 active:scale-95'">
                                    <span v-if="isSaving" class="flex items-center gap-1.5">
                                        <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Guardando
                                    </span>
                                    <span v-else-if="saveSuccess" class="flex items-center gap-1.5">
                                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Guardado
                                    </span>
                                    <span v-else>Guardar investigacion</span>
                                </button>

                                <button type="button" @click="handleClose"
                                    class="text-[11px] font-bold text-stone-400 hover:text-stone-600 uppercase tracking-wider transition-colors">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Form buttons (before AI response) -->
                    <div v-else class="px-6 py-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 flex justify-end gap-3">
                        <button type="button" @click="handleClose"
                            class="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border-2 border-amber-300 rounded-xl hover:bg-amber-50 hover:border-amber-400 transition-all duration-300 active:scale-95">
                            Cancelar
                        </button>
                        <button type="button" @click="handleSubmit"
                            :disabled="isSubmitting || !form.researchName.trim() || !form.description.trim()"
                            class="relative overflow-hidden px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                            <span class="tracking-wide uppercase text-xs font-black">
                                {{ isSubmitting ? 'Procesando...' : (aiStore.isConfigured ? 'Enviar a IA' : 'Configurar IA') }}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>

    <AIConfigModal />
</template>

<style scoped>
.markdown-body :deep(h1) { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #1c1917; }
.markdown-body :deep(h2) { font-size: 1.1rem; font-weight: 700; margin: 0.875rem 0 0.5rem; color: #292524; border-bottom: 1px solid #e7e5e4; padding-bottom: 0.25rem; }
.markdown-body :deep(h3) { font-size: 1rem; font-weight: 600; margin: 0.75rem 0 0.375rem; color: #44403c; }
.markdown-body :deep(p) { margin: 0.5rem 0; line-height: 1.7; }
.markdown-body :deep(ul), .markdown-body :deep(ol) { margin: 0.5rem 0; padding-left: 1.5rem; }
.markdown-body :deep(li) { margin: 0.25rem 0; line-height: 1.6; }
.markdown-body :deep(strong) { font-weight: 700; color: #1c1917; }
.markdown-body :deep(code) { background: #fef3c7; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.8125rem; color: #92400e; }
.markdown-body :deep(pre) { background: #1c1917; color: #e7e5e4; padding: 0.75rem 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 0.5rem 0; }
.markdown-body :deep(pre code) { background: none; color: inherit; padding: 0; }
.markdown-body :deep(blockquote) { border-left: 3px solid #d97706; padding-left: 0.75rem; margin: 0.5rem 0; color: #78716c; font-style: italic; }
.markdown-body :deep(hr) { border: none; border-top: 1px solid #e7e5e4; margin: 0.75rem 0; }
.markdown-body :deep(table) { width: 100%; border-collapse: collapse; margin: 0.5rem 0; }
.markdown-body :deep(th), .markdown-body :deep(td) { border: 1px solid #d6d3d1; padding: 0.375rem 0.75rem; text-align: left; }
.markdown-body :deep(th) { background: #fef3c7; font-weight: 600; }
</style>
