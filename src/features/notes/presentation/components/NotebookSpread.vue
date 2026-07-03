<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { marked } from "marked";
import { storeToRefs } from "pinia";
import { useChatStore } from "@/stores/chatStore";
import type { AiConfig } from "@/stores/chatStore";
import type { Note } from "../../domain/entities/Note";

/**
 * NotebookSpread - Libreta Digital Interactiva
 * 
 * Componente que simula un libro abierto con dos páginas (spread).
 * Diseño realista con efectos de papel, líneas de cuaderno, sombras de lomo,
 * y responsive design que adapta a una sola página en móvil.
 * 
 * Tailwind CSS v4.0 - No custom CSS, solo utilidades.
 */

interface Props {
  notes: Note[];
  notebookTitle: string;
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "addNote"): void;
  (e: "save"): void;
}>();

// Página actual (0-indexed)
const currentPageIndex = ref(0);

// Notas emparejadas para mostrar dos por spread
const pairedNotes = computed(() => {
  const pairs: Array<{ left: Note | null; right: Note | null }> = [];
  const notes = props.notes;
  
  for (let i = 0; i < notes.length; i += 2) {
    pairs.push({
      left: notes[i] || null,
      right: notes[i + 1] || null,
    });
  }
  
  return pairs;
});

// Total de spreads (pares de páginas)
const totalSpreads = computed(() => pairedNotes.value.length || 1);

// Spread actual
const currentSpread = computed(() => {
  return pairedNotes.value[currentPageIndex.value] || { left: null, right: null };
});

// Navegación
const goToNextSpread = () => {
  if (currentPageIndex.value < totalSpreads.value - 1) {
    currentPageIndex.value++;
  }
};

const goToPreviousSpread = () => {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value--;
  }
};

// Verificar si hay más contenido
const hasNextSpread = computed(() => currentPageIndex.value < totalSpreads.value - 1);
const hasPreviousSpread = computed(() => currentPageIndex.value > 0);

// Formatear fecha
const formatDate = (date?: Date): string => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Tipo de nota para badge
const getNoteTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    summary: "Resumen",
    quote: "Cita",
    idea: "Idea",
    analysis: "Análisis",
    note: "Nota",
  };
  return labels[type] || "Nota";
};

const getNoteTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    summary: "bg-blue-100 text-blue-700 border-blue-200",
    quote: "bg-purple-100 text-purple-700 border-purple-200",
    idea: "bg-amber-100 text-amber-700 border-amber-200",
    analysis: "bg-green-100 text-green-700 border-green-200",
    note: "bg-stone-100 text-stone-700 border-stone-200",
  };
  return colors[type] || colors.note;
};

// ============================================================
// AI CHAT — Estado de configuración (UI local)
// ============================================================

const AI_CONFIG_KEY = 'alajandria-ai-config'

// Store de chat: historial persistido en Supabase
const chatStore = useChatStore()
const { messages: visibleMessages, loading: isAiLoading, saving: isSaving, error: aiError } = storeToRefs(chatStore)

// Configuración del modelo (persiste en localStorage, no en Supabase)
const showAiChat = ref(false)
const aiConfig = ref<AiConfig | null>(null)
const showAiConfig = ref(false)
const configTested = ref(false)
const configTestError = ref<string | null>(null)
const isTestingConfig = ref(false)

const configForm = ref({
  provider: 'ollama' as 'ollama' | 'openai-compat',
  baseUrl: 'http://localhost:11434',
  model: '',
  apiKey: '',
})

const chatInput = ref('')
const chatScrollRef = ref<HTMLElement | null>(null)

// ── Configuración del modelo ──────────────────────────────────

function loadAiConfig() {
  try {
    const stored = localStorage.getItem(AI_CONFIG_KEY)
    if (stored) {
      const parsed: AiConfig = JSON.parse(stored)
      aiConfig.value = parsed
      configForm.value = {
        provider: parsed.provider,
        baseUrl: parsed.baseUrl,
        model: parsed.model,
        apiKey: parsed.apiKey,
      }
    }
  } catch { /* ignorar errores de parseo */ }
}

function saveAiConfig(cfg: AiConfig) {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(cfg))
}

function openAiChat() {
  loadAiConfig()
  showAiChat.value = true
  showAiConfig.value = !aiConfig.value
  nextTick(scrollToBottom)
}

function closeAiChat() {
  showAiChat.value = false
}

/** Construye el prompt de sistema a partir de las notas actuales del cuaderno. */
function buildSystemPrompt(): string {
  const notesContext = props.notes.length
    ? props.notes
        .map(
          (n, i) =>
            `Nota ${i + 1}: "${n.name}"\nTipo: ${n.type}\nContenido:\n${n.content}`,
        )
        .join('\n\n---\n\n')
    : '(No hay notas en el cuaderno aún.)'

  return `Eres un asistente creativo especializado en contenido digital para creadores. El usuario tiene un cuaderno titulado "${props.notebookTitle}" con las siguientes notas:

${notesContext}

Tu misión es:
1. Analizar el contenido de las notas y determinar si encaja mejor para un VIDEO LARGO (8-20 min, ideal para explicaciones profundas, tutoriales o narrativas) o un SHORT (15-60 seg, ideal para tips rápidos, frases impactantes o teasers).
2. Justificar tu recomendación con criterios concretos.
3. Cuando el usuario lo pida, generar un GUIÓN DETALLADO con: intro, desarrollo por secciones con duración estimada, llamada a la acción y estilo de presentación.

Responde siempre en español. Sé directo, práctico y creativo. Para los guiones usa una estructura numerada y clara.`
}

async function submitConfig() {
  if (!configForm.value.model.trim() || !configForm.value.baseUrl.trim()) return
  configTestError.value = null
  isTestingConfig.value = true

  const candidate: AiConfig = {
    provider: configForm.value.provider,
    baseUrl: configForm.value.baseUrl.replace(/\/$/, ''),
    model: configForm.value.model.trim(),
    apiKey: configForm.value.apiKey.trim(),
  }

  try {
    await pingAiApi(candidate)
    aiConfig.value = candidate
    saveAiConfig(candidate)
    configTested.value = true
    showAiConfig.value = false
    nextTick(scrollToBottom)
  } catch (err: any) {
    configTestError.value = err?.message ?? 'No se pudo conectar con el modelo'
  } finally {
    isTestingConfig.value = false
  }
}

async function pingAiApi(cfg: AiConfig): Promise<void> {
  if (cfg.provider === 'ollama') {
    const res = await fetch(`${cfg.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: cfg.model,
        messages: [{ role: 'user', content: 'Di solo "ok"' }],
        stream: false,
      }),
    })
    if (!res.ok)
      throw new Error(
        `Ollama respondió ${res.status}. Verifica que el modelo "${cfg.model}" esté disponible.`,
      )
  } else {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cfg.apiKey) headers['Authorization'] = `Bearer ${cfg.apiKey}`
    const res = await fetch(`${cfg.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: cfg.model,
        messages: [{ role: 'user', content: 'Di solo "ok"' }],
        max_tokens: 5,
      }),
    })
    if (!res.ok)
      throw new Error(`La API respondió ${res.status}. Verifica la URL y API key.`)
  }
}

async function resetConfig() {
  aiConfig.value = null
  configTested.value = false
  configTestError.value = null
  localStorage.removeItem(AI_CONFIG_KEY)
  await chatStore.clearHistory()
  showAiConfig.value = true
}

// ── Envío de mensajes ─────────────────────────────────────────

async function sendMessage(overrideText?: string) {
  const text = (overrideText ?? chatInput.value).trim()
  if (!text || isAiLoading.value || !aiConfig.value) return

  chatInput.value = ''
  await nextTick()
  scrollToBottom()

  await chatStore.sendMessage(text, {
    systemPrompt: buildSystemPrompt(),
    aiConfig: aiConfig.value,
  })

  await nextTick()
  scrollToBottom()
}

function handleChatKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function scrollToBottom() {
  if (chatScrollRef.value) {
    chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
  }
}

// ── Formato ───────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function renderMarkdown(content: string): string {
  return marked.parse(content) as string
}
</script>

<template>
  <!-- Contenedor Principal: Pantalla completa con fondo de biblioteca -->
  <div 
    v-if="isOpen"
    class="fixed inset-0 z-50 w-full h-screen overflow-hidden bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 lg:p-8"
    @click.self="emit('close')"
  >
    <!-- Libro Abierto - Container -->
    <div 
      class="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:aspect-[16/10] lg:aspect-[2/1] max-w-7xl mx-auto flex flex-col"
    >
      
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- LIBRO ABIERTO - ESTRUCTURA PRINCIPAL -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div class="relative flex-1 flex flex-col lg:flex-row overflow-hidden rounded-none sm:rounded-2xl shadow-2xl">
        
        <!-- Header del Libro (móvil) -->
        <div class="lg:hidden bg-stone-800 text-stone-100 px-4 py-3 flex items-center justify-between">
          <h2 class="font-serif text-lg truncate pr-4">{{ notebookTitle }}</h2>
          <button 
            @click="emit('close')"
            class="p-2 hover:bg-stone-700 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- PÁGINA IZQUIERDA -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div class="relative flex-1 bg-gradient-to-br from-amber-50 via-yellow-50/80 to-amber-100 overflow-hidden">
          
          <!-- Textura de papel -->
          <div class="absolute inset-0 opacity-40 pointer-events-none"
               style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E'); opacity: 0.03;"
          ></div>
          
          <!-- Líneas horizontales del cuaderno (rayado) -->
          <div class="absolute inset-0 pointer-events-none"
               style="
                 background-image: repeating-linear-gradient(
                   transparent,
                   transparent 31px,
                   rgba(139, 119, 101, 0.15) 31px,
                   rgba(139, 119, 101, 0.15) 32px
                 );
                 background-position: 0 64px;
               "
          ></div>
          
          <!-- Margen izquierdo rojo (línea de cuaderno) -->
          <div class="absolute left-8 sm:left-12 top-0 bottom-0 w-px bg-red-400/50"></div>
          
          <!-- Sombra del lomo (sólo visible en desktop) -->
          <div class="hidden lg:block absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black/10 to-transparent pointer-events-none"></div>
          
          <!-- Contenido de la página izquierda -->
          <div class="relative h-full overflow-y-auto p-6 sm:p-8 lg:p-10">
            
            <!-- Estado vacío izquierda -->
            <div v-if="!currentSpread.left" class="h-full flex flex-col items-center justify-center text-stone-400">
              <svg class="w-16 h-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p class="font-serif italic text-sm">Fin del cuaderno</p>
            </div>
            
            <!-- Nota en página izquierda -->
            <div v-else class="space-y-6">
              <!-- Título y tipo -->
              <div class="border-b-2 border-stone-300/50 pb-4 mb-6">
                <div class="flex items-center gap-3 mb-2">
                  <span :class="['px-2 py-0.5 text-xs font-medium rounded border', getNoteTypeColor(currentSpread.left.type)]">
                    {{ getNoteTypeLabel(currentSpread.left.type) }}
                  </span>
                  <span class="text-xs text-stone-400 font-medium">{{ formatDate(currentSpread.left.createdAt) }}</span>
                </div>
                <h3 class="font-serif text-xl sm:text-2xl font-semibold text-stone-800 leading-tight pl-1">
                  {{ currentSpread.left.name }}
                </h3>
              </div>
              
              <!-- Contenido de la nota alineado con las líneas -->
              <div class="prose prose-stone prose-sm max-w-none">
                <p class="text-stone-700 leading-8 text-base sm:text-lg whitespace-pre-wrap font-serif">
                  {{ currentSpread.left.content }}
                </p>
              </div>
              
              <!-- Número de página -->
              <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-stone-400 font-medium">
                {{ currentPageIndex * 2 + 1 }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- LOMO / CENTRO DEL LIBRO -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div class="hidden lg:flex flex-col items-center justify-center bg-gradient-to-b from-stone-300 via-stone-400 to-stone-300 w-8 relative">
          <!-- Sombra central -->
          <div class="absolute inset-x-0 inset-y-0 bg-gradient-to-r from-black/20 via-stone-500/30 to-black/20"></div>
          
          <!-- Textura del lomo -->
          <div class="absolute inset-0 opacity-30"
               style="background-image: repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px);"
          ></div>
          
          <!-- Decoración del lomo -->
          <div class="relative z-10 flex flex-col items-center gap-4">
            <div class="w-1 h-16 bg-stone-600/40 rounded-full"></div>
            <div class="w-1.5 h-1.5 bg-stone-600/60 rounded-full"></div>
            <div class="w-1 h-16 bg-stone-600/40 rounded-full"></div>
          </div>
        </div>
        
        <!-- Separador móvil -->
        <div class="lg:hidden h-2 bg-gradient-to-b from-stone-300 to-stone-200 relative">
          <div class="absolute inset-0 shadow-inner"></div>
        </div>
        
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- PÁGINA DERECHA -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div class="relative flex-1 bg-gradient-to-bl from-amber-50 via-yellow-50/80 to-amber-100 overflow-hidden">
          
          <!-- Textura de papel -->
          <div class="absolute inset-0 opacity-40 pointer-events-none"
               style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E'); opacity: 0.03;"
          ></div>
          
          <!-- Líneas horizontales del cuaderno (rayado) -->
          <div class="absolute inset-0 pointer-events-none"
               style="
                 background-image: repeating-linear-gradient(
                   transparent,
                   transparent 31px,
                   rgba(139, 119, 101, 0.15) 31px,
                   rgba(139, 119, 101, 0.15) 32px
                 );
                 background-position: 0 64px;
               "
          ></div>
          
          <!-- Margen izquierdo rojo (línea de cuaderno) -->
          <div class="absolute left-8 sm:left-12 top-0 bottom-0 w-px bg-red-400/50"></div>
          
          <!-- Sombra del lomo (sólo visible en desktop) -->
          <div class="hidden lg:block absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
          
          <!-- Pestaña lateral decorativa (sólo desktop) -->
          <div class="hidden lg:block absolute -right-3 top-24 w-6 h-32 bg-gradient-to-r from-amber-600 to-orange-600 rounded-l-lg shadow-lg z-20">
            <div class="absolute inset-y-2 left-0 w-1 bg-white/30 rounded-full"></div>
          </div>
          
          <!-- Contenido de la página derecha -->
          <div class="relative h-full overflow-y-auto p-6 sm:p-8 lg:p-10">
            
            <!-- Estado vacío derecha -->
            <div v-if="!currentSpread.right" class="h-full flex flex-col items-center justify-center text-stone-400">
              <svg class="w-16 h-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p class="font-serif italic text-sm">Continúa escribiendo...</p>
              <button 
                @click="emit('addNote')"
                class="mt-6 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg shadow-md transition-colors"
              >
                + Añadir nota
              </button>
            </div>
            
            <!-- Nota en página derecha -->
            <div v-else class="space-y-6">
              <!-- Título y tipo -->
              <div class="border-b-2 border-stone-300/50 pb-4 mb-6">
                <div class="flex items-center gap-3 mb-2">
                  <span :class="['px-2 py-0.5 text-xs font-medium rounded border', getNoteTypeColor(currentSpread.right.type)]">
                    {{ getNoteTypeLabel(currentSpread.right.type) }}
                  </span>
                  <span class="text-xs text-stone-400 font-medium">{{ formatDate(currentSpread.right.createdAt) }}</span>
                </div>
                <h3 class="font-serif text-xl sm:text-2xl font-semibold text-stone-800 leading-tight pl-1">
                  {{ currentSpread.right.name }}
                </h3>
              </div>
              
              <!-- Contenido de la nota alineado con las líneas -->
              <div class="prose prose-stone prose-sm max-w-none">
                <p class="text-stone-700 leading-8 text-base sm:text-lg whitespace-pre-wrap font-serif">
                  {{ currentSpread.right.content }}
                </p>
              </div>
              
              <!-- Número de página -->
              <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-stone-400 font-medium">
                {{ currentPageIndex * 2 + 2 }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- CONTROLES DE NAVEGACIÓN -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div class="hidden lg:flex items-center justify-between mt-4 px-2">
        <!-- Botón Anterior -->
        <button 
          @click="goToPreviousSpread"
          :disabled="!hasPreviousSpread"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all',
            hasPreviousSpread 
              ? 'bg-white/80 hover:bg-white text-stone-700 shadow-md hover:shadow-lg' 
              : 'bg-white/40 text-stone-400 cursor-not-allowed'
          ]"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>
        
        <!-- Indicador de página -->
        <div class="bg-white/80 backdrop-blur px-4 py-2 rounded-lg shadow-md">
          <span class="text-sm font-medium text-stone-600">
            Spread {{ currentPageIndex + 1 }} de {{ totalSpreads }}
          </span>
        </div>
        
        <!-- Botón Siguiente -->
        <button 
          @click="goToNextSpread"
          :disabled="!hasNextSpread"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all',
            hasNextSpread 
              ? 'bg-white/80 hover:bg-white text-stone-700 shadow-md hover:shadow-lg' 
              : 'bg-white/40 text-stone-400 cursor-not-allowed'
          ]"
        >
          Siguiente
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <!-- Controles móviles (simplificados) -->
      <div class="lg:hidden flex items-center justify-between bg-stone-800 text-white px-4 py-3">
        <button 
          @click="goToPreviousSpread"
          :disabled="!hasPreviousSpread"
          class="p-2 rounded-lg disabled:opacity-40"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <span class="text-sm">
          {{ currentPageIndex * 2 + 1 }} - {{ Math.min(currentPageIndex * 2 + 2, notes.length) }} / {{ notes.length }}
        </span>
        
        <button 
          @click="goToNextSpread"
          :disabled="!hasNextSpread"
          class="p-2 rounded-lg disabled:opacity-40"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- BOTONES FLOTANTES -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      
      <!-- Botón Cerrar (desktop) -->
      <button 
        @click="emit('close')"
        class="hidden lg:flex absolute top-4 right-4 z-30 w-10 h-10 bg-white/90 hover:bg-white text-stone-600 rounded-full shadow-lg hover:shadow-xl items-center justify-center transition-all hover:scale-110"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <!-- Botón Añadir Nota (flotante) -->
      <button 
        @click="emit('addNote')"
        class="absolute bottom-20 lg:bottom-8 right-4 lg:right-8 z-30 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="hidden sm:inline font-medium text-sm">Añadir nota</span>
      </button>
      
      <!-- Botón Guardar (flotante, opcional) -->
      <button 
        @click="emit('save')"
        class="absolute bottom-20 lg:bottom-8 right-36 lg:right-40 z-30 hidden sm:flex items-center gap-2 px-4 py-3 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        <span class="font-medium text-sm">Guardar</span>
      </button>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- BOTÓN FLOTANTE IA -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <button
        @click="openAiChat"
        class="absolute bottom-20 lg:bottom-8 left-4 lg:left-8 z-30 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-stone-800 to-stone-700 hover:from-stone-700 hover:to-stone-600 text-amber-100 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 group"
        title="Asistente IA — Guión de contenido"
      >
        <!-- Icono libro con destellos -->
        <span class="relative flex items-center justify-center">
          <svg class="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span class="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-75"></span>
          <span class="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
        </span>
        <span class="hidden sm:inline font-medium text-sm">Asistente IA</span>
      </button>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- MODAL DE CHAT IA  (z-[60] sobre el libro z-50)               -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showAiChat"
            class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
            @click.self="closeAiChat"
          >
            <!-- Backdrop oscuro -->
            <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px]"></div>

            <!-- Panel principal -->
            <div
              class="relative w-full sm:max-w-xl h-[90vh] sm:h-[82vh] bg-[#1C1A16] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-700/60"
              @click.stop
            >
              <!-- ── Header ── -->
              <div class="flex items-center gap-3 px-5 py-4 border-b border-stone-700/60 bg-stone-900/80 shrink-0">
                <!-- Icono libro -->
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shrink-0">
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-stone-100 truncate">Asistente de Guión</p>
                  <p class="text-xs text-stone-400 truncate">{{ notebookTitle }}</p>
                </div>
                <!-- Indicador de modelo configurado -->
                <div v-if="aiConfig && !showAiConfig" class="flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span class="text-xs text-stone-400 hidden sm:block">{{ aiConfig.model }}</span>
                  <!-- Limpiar historial -->
                  <button
                    @click="chatStore.clearHistory()"
                    class="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-700/60 transition-colors"
                    title="Limpiar historial"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <!-- Reconfigurar modelo -->
                  <button
                    @click="showAiConfig = true"
                    class="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-700/60 transition-colors"
                    title="Reconfigurar modelo"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <!-- Botón cerrar -->
                <button
                  @click="closeAiChat"
                  class="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-700/60 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- ══════════════════════════════════════════════════ -->
              <!-- PANTALLA: CONFIGURACIÓN                           -->
              <!-- ══════════════════════════════════════════════════ -->
              <div v-if="showAiConfig" class="flex-1 overflow-y-auto p-5 space-y-5">
                <!-- Ilustración / intro -->
                <div class="text-center pt-2 pb-4">
                  <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center">
                    <svg class="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 class="text-base font-semibold text-stone-100 font-serif">Configurar modelo de IA local</h3>
                  <p class="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                    Conecta un modelo local (Ollama, LM Studio) para generar guiones basados en tus notas.
                  </p>
                </div>

                <!-- Proveedor -->
                <div class="space-y-2">
                  <label class="text-xs font-medium text-stone-400 uppercase tracking-wider">Proveedor</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      @click="configForm.provider = 'ollama'; configForm.baseUrl = 'http://localhost:11434'"
                      :class="[
                        'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all',
                        configForm.provider === 'ollama'
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                          : 'bg-stone-800/60 border-stone-700/60 text-stone-400 hover:border-stone-600',
                      ]"
                    >
                      <span class="text-lg">🦙</span>
                      <span>Ollama</span>
                      <span class="text-[10px] opacity-60">llama3, mistral…</span>
                    </button>
                    <button
                      @click="configForm.provider = 'openai-compat'; configForm.baseUrl = 'http://localhost:1234'"
                      :class="[
                        'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all',
                        configForm.provider === 'openai-compat'
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                          : 'bg-stone-800/60 border-stone-700/60 text-stone-400 hover:border-stone-600',
                      ]"
                    >
                      <span class="text-lg">⚡</span>
                      <span>OpenAI-compatible</span>
                      <span class="text-[10px] opacity-60">LM Studio, Jan…</span>
                    </button>
                  </div>
                </div>

                <!-- URL base -->
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-stone-400 uppercase tracking-wider">URL base</label>
                  <input
                    v-model="configForm.baseUrl"
                    type="text"
                    placeholder="http://localhost:11434"
                    class="w-full bg-stone-800/80 border border-stone-700/60 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition font-mono"
                  />
                </div>

                <!-- Nombre del modelo -->
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-stone-400 uppercase tracking-wider">Nombre del modelo</label>
                  <input
                    v-model="configForm.model"
                    type="text"
                    :placeholder="configForm.provider === 'ollama' ? 'llama3, mistral, gemma2…' : 'nombre-del-modelo'"
                    class="w-full bg-stone-800/80 border border-stone-700/60 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition font-mono"
                  />
                </div>

                <!-- API Key (opcional) -->
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-stone-400 uppercase tracking-wider">
                    API Key
                    <span class="normal-case text-stone-600 font-normal ml-1">(opcional)</span>
                  </label>
                  <input
                    v-model="configForm.apiKey"
                    type="password"
                    placeholder="sk-… o vacío para modelos locales"
                    class="w-full bg-stone-800/80 border border-stone-700/60 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
                  />
                </div>

                <!-- Error de conexión -->
                <div
                  v-if="configTestError"
                  class="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
                >
                  <svg class="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <p class="text-xs text-red-300">{{ configTestError }}</p>
                </div>

                <!-- Botón conectar -->
                <button
                  @click="submitConfig"
                  :disabled="!configForm.model.trim() || !configForm.baseUrl.trim() || isTestingConfig"
                  class="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-900 shadow-lg"
                >
                  <svg v-if="isTestingConfig" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {{ isTestingConfig ? 'Probando conexión…' : 'Conectar y comenzar' }}
                </button>

                <!-- Note seguridad -->
                <p class="text-center text-[11px] text-stone-600 px-4">
                  La configuración se guarda localmente en tu navegador. Ningún dato sale de tu dispositivo.
                </p>
              </div>

              <!-- ══════════════════════════════════════════════════ -->
              <!-- PANTALLA: CHAT                                    -->
              <!-- ══════════════════════════════════════════════════ -->
              <template v-else>
                <!-- Área de mensajes -->
                <div
                  ref="chatScrollRef"
                  class="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent"
                >
                  <!-- Bienvenida cuando no hay mensajes visibles -->
                  <div v-if="visibleMessages.length === 0" class="h-full flex flex-col items-center justify-center text-center px-4 pb-4">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center mb-4">
                      <svg class="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <p class="text-sm font-semibold text-stone-200 font-serif mb-1">
                      ¿Video largo o short?
                    </p>
                    <p class="text-xs text-stone-500 mb-5 max-w-xs">
                      Analizo tus {{ notes.length }} nota{{ notes.length !== 1 ? 's' : '' }} del cuaderno y te ayudo a crear el guión ideal.
                    </p>
                    <!-- Sugerencias rápidas -->
                    <div class="w-full space-y-2">
                      <button
                        @click="sendMessage('Analiza mis notas y dime si debo hacer un video largo o un short. Justifica tu respuesta.')"
                        class="w-full text-left px-4 py-3 rounded-xl bg-stone-800/80 border border-stone-700/60 hover:border-amber-500/50 hover:bg-stone-800 text-sm text-stone-300 transition-all group"
                      >
                        <span class="text-amber-400 mr-2">→</span>
                        ¿Video largo o short para estas notas?
                      </button>
                      <button
                        @click="sendMessage('Crea un guión detallado para un VIDEO LARGO basado en mis notas. Incluye intro, secciones con duración estimada y cierre.')"
                        class="w-full text-left px-4 py-3 rounded-xl bg-stone-800/80 border border-stone-700/60 hover:border-amber-500/50 hover:bg-stone-800 text-sm text-stone-300 transition-all"
                      >
                        <span class="text-amber-400 mr-2">→</span>
                        Generar guión para video largo
                      </button>
                      <button
                        @click="sendMessage('Crea el guión para un SHORT (máx 60 seg) basado en las ideas más impactantes de mis notas.')"
                        class="w-full text-left px-4 py-3 rounded-xl bg-stone-800/80 border border-stone-700/60 hover:border-amber-500/50 hover:bg-stone-800 text-sm text-stone-300 transition-all"
                      >
                        <span class="text-amber-400 mr-2">→</span>
                        Generar guión para short
                      </button>
                    </div>
                  </div>

                  <!-- Mensajes del chat -->
                  <template v-else>
                    <div
                      v-for="msg in visibleMessages"
                      :key="msg.id"
                      :class="['flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start']"
                    >
                      <div :class="['flex items-end gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row']">
                        <!-- Avatar asistente -->
                        <div v-if="msg.role === 'assistant'" class="shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-0.5">
                          <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>

                        <!-- Burbuja usuario -->
                        <div
                          v-if="msg.role === 'user'"
                          class="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed whitespace-pre-wrap bg-amber-600/90 text-white"
                        >{{ msg.content }}</div>
                        <!-- Burbuja asistente (Markdown) -->
                        <div
                          v-else
                          class="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm bg-stone-800/90 border border-stone-700/50 ai-message-body"
                          v-html="renderMarkdown(msg.content)"
                        ></div>
                      </div>
                      <!-- Timestamp -->
                      <span class="text-[10px] text-stone-600 mt-1 px-1">
                        {{ formatTime(msg.created_at) }}
                      </span>
                    </div>

                    <!-- Indicador "escribiendo…" -->
                    <div v-if="isAiLoading" class="flex justify-start">
                      <div class="shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mr-2 mt-0.5">
                        <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div class="bg-stone-800/90 border border-stone-700/50 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                        <span class="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                        <span class="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                      </div>
                    </div>
                  </template>

                  <!-- Error de respuesta -->
                  <div
                    v-if="aiError"
                    class="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mx-1"
                  >
                    <svg class="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <div>
                      <p class="text-xs text-red-300">{{ aiError }}</p>
                      <button @click="chatStore.error = null; resetConfig()" class="text-[11px] text-amber-400 hover:underline mt-1">
                        Reconfigurar modelo
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Input area -->
                <div class="shrink-0 border-t border-stone-700/60 px-4 py-3 bg-stone-900/80">
                  <!-- Indicador de guardado en Supabase -->
                  <div v-if="isSaving" class="flex items-center gap-1.5 mb-2">
                    <svg class="w-3 h-3 text-stone-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span class="text-[11px] text-stone-600">Guardando en la nube…</span>
                  </div>
                  <div class="flex items-end gap-2">
                    <textarea
                      v-model="chatInput"
                      @keydown="handleChatKey"
                      :disabled="isAiLoading"
                      placeholder="Escribe tu pregunta… (Enter para enviar, Shift+Enter nueva línea)"
                      rows="2"
                      class="flex-1 resize-none bg-stone-800/80 border border-stone-700/60 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition disabled:opacity-50"
                    ></textarea>
                    <button
                      @click="sendMessage()"
                      :disabled="!chatInput.trim() || isAiLoading"
                      class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-md"
                    >
                      <svg class="w-4 h-4 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </Transition>
      </Teleport>

    </div>
  </div>
</template>

<style scoped>
/* Markdown renderizado en las respuestas del asistente */
.ai-message-body {
  font-size: 0.875rem;
  line-height: 1.65;
  color: #e2e0db; /* stone-200 */
}

.ai-message-body :deep(h1),
.ai-message-body :deep(h2),
.ai-message-body :deep(h3),
.ai-message-body :deep(h4) {
  font-family: Georgia, serif;
  font-weight: 600;
  color: #fde68a; /* amber-200 */
  margin-top: 1rem;
  margin-bottom: 0.4rem;
  line-height: 1.3;
}

.ai-message-body :deep(h1) { font-size: 1.05rem; }
.ai-message-body :deep(h2) { font-size: 0.95rem; }
.ai-message-body :deep(h3) { font-size: 0.875rem; }

.ai-message-body :deep(p) {
  margin-bottom: 0.6rem;
}

.ai-message-body :deep(ul),
.ai-message-body :deep(ol) {
  padding-left: 1.25rem;
  margin-bottom: 0.6rem;
  space-y: 0.25rem;
}

.ai-message-body :deep(ul) {
  list-style-type: disc;
}

.ai-message-body :deep(ol) {
  list-style-type: decimal;
}

.ai-message-body :deep(li) {
  margin-bottom: 0.2rem;
}

.ai-message-body :deep(strong) {
  font-weight: 600;
  color: #fcd34d; /* amber-300 */
}

.ai-message-body :deep(em) {
  font-style: italic;
  color: #c4bfb8; /* stone-300 */
}

.ai-message-body :deep(code) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 0.1em 0.35em;
  color: #fb923c; /* orange-400 */
}

.ai-message-body :deep(pre) {
  background-color: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  overflow-x: auto;
  margin-bottom: 0.75rem;
}

.ai-message-body :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  color: #d6d3d1; /* stone-300 */
}

.ai-message-body :deep(blockquote) {
  border-left: 3px solid #f59e0b; /* amber-500 */
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  color: #a8a29e; /* stone-400 */
  font-style: italic;
}

.ai-message-body :deep(hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0.75rem 0;
}

.ai-message-body :deep(a) {
  color: #fbbf24; /* amber-400 */
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Quitar margen inferior del último elemento */
.ai-message-body :deep(*:last-child) {
  margin-bottom: 0;
}
</style>
