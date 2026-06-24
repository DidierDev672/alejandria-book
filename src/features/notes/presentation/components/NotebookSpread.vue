<script setup lang="ts">
import { ref, computed } from "vue";
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
      
    </div>
  </div>
</template>
