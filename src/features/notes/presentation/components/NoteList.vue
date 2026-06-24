<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useNoteStore } from "../../application/useNoteStore";
import type { Note, NoteType } from "../../domain/entities/Note";
import NotebookSpread from "./NotebookSpread.vue";

/**
 * Componente de listado de notas con diseño de cuaderno
 * Vista de presentación - Capa más externa de la arquitectura Onion
 * Diseño inspirado en Behance: BookStore eCommerce Website
 *
 * FEATURE: Agrupación por títulos repetidos
 * Las notas con título duplicado se agrupan en "Cuadernos" (Notebooks)
 * Al hacer clic en un cuaderno, se abre el componente NotebookSpread
 */

const noteStore = useNoteStore();

// Estado del cuaderno abierto (usando NotebookSpread)
const selectedNotebook = ref<{ title: string; notes: Note[] } | null>(null);
const isNotebookOpen = ref(false);

// Cargar notas al montar el componente
onMounted(async () => {
  await noteStore.loadNotes();
});

/**
 * Computed property que agrupa las notas por título
 * Si hay títulos repetidos, se agrupan en un "notebook"
 * Si el título es único, se muestra como nota individual
 */
const groupedNotes = computed(() => {
  const notes = noteStore.notesList;
  if (!notes || notes.length === 0) return { notebooks: [], singles: [] };

  // Mapa para contar ocurrencias de cada título
  const titleCount = new Map<string, number>();
  const titleToNotes = new Map<string, Note[]>();

  notes.forEach((note) => {
    const title = note.name?.trim() || "Sin título";
    titleCount.set(title, (titleCount.get(title) || 0) + 1);

    if (!titleToNotes.has(title)) {
      titleToNotes.set(title, []);
    }
    titleToNotes.get(title)!.push(note);
  });

  // Separar en notebooks (títulos repetidos) y notas individuales
  const notebooks: { title: string; notes: Note[]; count: number }[] = [];
  const singles: Note[] = [];

  notes.forEach((note) => {
    const title = note.name?.trim() || "Sin título";

    // Solo agregar al array de notebooks la primera vez que encontramos un título repetido
    if (titleCount.get(title)! > 1) {
      // Verificar si ya agregamos este notebook
      const alreadyAdded = notebooks.some((nb) => nb.title === title);
      if (!alreadyAdded) {
        notebooks.push({
          title,
          notes: titleToNotes.get(title) || [],
          count: titleCount.get(title) || 0,
        });
      }
    } else {
      // Título único, agregar a singles
      singles.push(note);
    }
  });

  return { notebooks, singles };
});

// Mapeo de tipos de nota a etiquetas localizadas y colores
const noteTypeConfig: Record<
  NoteType,
  { label: string; color: string; icon: string }
> = {
  summary: {
    label: "Resumen",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  quote: {
    label: "Cita",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
  },
  idea: {
    label: "Idea",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
  analysis: {
    label: "Análisis",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  note: {
    label: "Nota",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  },
};

/**
 * Obtiene la configuración visual para un tipo de nota
 */
const getNoteTypeConfig = (type: NoteType) => {
  return noteTypeConfig[type] || noteTypeConfig.note;
};

/**
 * Abre el cuaderno usando el componente NotebookSpread (vista de libro abierto)
 */
const openNotebook = (notebook: { title: string; notes: Note[] }) => {
  selectedNotebook.value = notebook;
  isNotebookOpen.value = true;
};

/**
 * Cierra el cuaderno NotebookSpread
 */
const closeNotebook = () => {
  isNotebookOpen.value = false;
  setTimeout(() => {
    selectedNotebook.value = null;
  }, 300);
};

/**
 * Navega al formulario para añadir una nueva nota
 */
const goToAddNote = () => {
  // Redirigir a la ruta de creación de nota
  window.location.href = "/dashboard/note";
};

/**
 * Divide el contenido de la nota en 3 párrafos simulados
 * Para visualización estética tipo cuaderno
 */
const formatContent = (content: string): string[] => {
  if (!content) return ["", "", ""];

  // Dividir el contenido en aproximadamente 3 partes
  const words = content.split(" ");
  const totalWords = words.length;
  const wordsPerParagraph = Math.ceil(totalWords / 3);

  const paragraphs: string[] = [];
  for (let i = 0; i < 3; i++) {
    const start = i * wordsPerParagraph;
    const end = Math.min(start + wordsPerParagraph, totalWords);
    const paragraph = words.slice(start, end).join(" ");
    paragraphs.push(paragraph);
  }

  return paragraphs;
};

/**
 * Formatea la fecha de creación
 */
const formatDate = (date?: Date): string => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Maneja la eliminación de una nota con confirmación
 */
const handleDeleteNote = async (id: string, title: string) => {
  const confirmed = confirm(`¿Estás seguro de eliminar la nota "${title}"?`);
  if (confirmed && id) {
    await noteStore.deleteNote(id);
  }
};

/**
 * Mapeo de colores de fondo para las tarjetas
 */
const cardBackgrounds: Record<string, string> = {
  "#f4f1ea": "from-amber-50 via-stone-50 to-stone-100", // Crema por defecto
  "#FEF3C7": "from-amber-50 via-yellow-50 to-amber-100", // Amarillo pálido
  "#FCE7F3": "from-pink-50 via-rose-50 to-pink-100", // Rosa pálido
  "#DBEAFE": "from-blue-50 via-sky-50 to-blue-100", // Azul pálido
  "#D1FAE5": "from-green-50 via-emerald-50 to-green-100", // Verde pálido
  "#FECACA": "from-red-50 via-rose-50 to-red-100", // Rojo pálido
  "#E9D5FF": "from-purple-50 via-violet-50 to-purple-100", // Púrpura pálido
};

/**
 * Obtiene el gradiente de fondo para una nota basado en su color
 */
const getCardBackground = (color: string): string => {
  return cardBackgrounds[color] || cardBackgrounds["#f4f1ea"];
};

/**
 * Obtiene el color predominante de un grupo de notas
 * Usa el color de la primera nota como referencia para el cuaderno
 */
const getNotebookColor = (notes: Note[]): string => {
  if (notes.length === 0) return cardBackgrounds["#f4f1ea"];
  return getCardBackground(notes[0].color);
};

/**
 * Obtiene los tipos únicos de notas en un cuaderno
 */
const getNotebookTypes = (notes: Note[]): NoteType[] => {
  const types = new Set<NoteType>();
  notes.forEach((note) => types.add(note.type));
  return Array.from(types);
};
</script>

<template>
  <!-- Contenedor principal con fondo de librería/bookstore -->
  <div
    class="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50/30 to-stone-200 py-8 px-4 sm:px-6 lg:px-8"
  >
    <!-- Fondo decorativo sutil -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div
        class="absolute -top-40 -right-40 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute -bottom-40 -left-40 w-96 h-96 bg-stone-200/40 rounded-full blur-3xl"
      ></div>
    </div>

    <!-- Contenido principal -->
    <div class="relative max-w-7xl mx-auto">
      <!-- Header de la bitácora -->
      <div class="mb-10 text-center">
        <div class="inline-flex items-center gap-3 mb-3">
          <div
            class="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1
            class="text-3xl sm:text-4xl font-serif font-bold text-stone-800 tracking-tight"
          >
            Bitácora de Lectura
          </h1>
        </div>
        <p class="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto">
          Tus apuntes, citas y reflexiones organizados con la elegancia de un
          cuaderno de escritor
        </p>
      </div>

      <!-- Estado de carga -->
      <div
        v-if="noteStore.isLoadingList"
        class="flex flex-col items-center justify-center py-20"
      >
        <div class="relative">
          <div
            class="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"
          ></div>
          <div
            class="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-orange-400 rounded-full animate-spin"
            style="animation-duration: 1.5s"
          ></div>
        </div>
        <p class="mt-6 text-stone-600 font-medium animate-pulse">
          Cargando notas...
        </p>
        <p class="mt-2 text-stone-400 text-sm">
          Preparando tu biblioteca de ideas
        </p>
      </div>

      <!-- Estado de error -->
      <div
        v-else-if="noteStore.error"
        class="max-w-md mx-auto bg-red-50 border-l-4 border-red-500 rounded-r-xl p-6 shadow-md"
      >
        <div class="flex items-start gap-4">
          <svg
            class="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 class="font-semibold text-red-800">Error al cargar notas</h3>
            <p class="text-red-700 text-sm mt-1">{{ noteStore.error }}</p>
            <button
              @click="noteStore.loadNotes()"
              class="mt-3 text-sm text-red-600 hover:text-red-800 font-medium underline underline-offset-2"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>

      <!-- Grid responsive de notas y cuadernos -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- CUADERNOS: Notas agrupadas por títulos repetidos -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div
          v-for="notebook in groupedNotes.notebooks"
          :key="notebook.title"
          class="group relative"
        >
          <!-- Tarjeta de CUADERNO con diseño de libro/colección -->
          <div
            @click="openNotebook(notebook)"
            :class="[
              'relative h-full bg-gradient-to-b',
              getNotebookColor(notebook.notes),
              'rounded-lg shadow-md hover:shadow-xl',
              'transition-all duration-300 ease-out',
              'transform hover:-translate-y-1 hover:scale-[1.02]',
              'overflow-hidden cursor-pointer',
              'border border-stone-200/60',
            ]"
          >
            <!-- Indicador visual de cuaderno (múltiples capas simulando páginas) -->
            <div
              class="absolute -right-1 top-2 bottom-2 w-3 bg-stone-200/80 rounded-r-md -z-10 transform scale-[0.98]"
            ></div>
            <div
              class="absolute -right-2 top-3 bottom-3 w-3 bg-stone-300/60 rounded-r-md -z-20 transform scale-[0.96]"
            ></div>

            <!-- Línea roja del margen izquierdo (estilo cuaderno) -->
            <div class="absolute left-6 top-0 bottom-0 w-px bg-red-400/60"></div>

            <!-- Líneas horizontales tipo cuaderno (gradiente sutil) -->
            <div
              class="absolute inset-0 opacity-30 pointer-events-none"
              style="
                background-image: repeating-linear-gradient(
                  transparent,
                  transparent 27px,
                  rgba(150, 130, 100, 0.15) 27px,
                  rgba(150, 130, 100, 0.15) 28px
                );
                background-size: 100% 28px;
                margin-top: 56px;
              "
            ></div>

            <!-- Contenido de la tarjeta de CUADERNO -->
            <div class="relative p-5 pl-10">
              <!-- Badge de cuaderno con contador -->
              <div class="flex items-center justify-between mb-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-100 text-amber-800 border-amber-200"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Cuaderno ({{ notebook.count }})
                </span>

                <!-- Tipos de notas en el cuaderno -->
                <div class="flex -space-x-1">
                  <span
                    v-for="type in getNotebookTypes(notebook.notes).slice(0, 3)"
                    :key="type"
                    :class="[
                      'inline-flex items-center justify-center w-5 h-5 rounded-full border text-[8px] font-bold',
                      getNoteTypeConfig(type).color,
                    ]"
                    :title="getNoteTypeConfig(type).label"
                  >
                    {{ getNoteTypeConfig(type).label.charAt(0) }}
                  </span>
                </div>
              </div>

              <!-- Título del cuaderno -->
              <h3
                class="font-serif font-semibold text-stone-800 text-lg leading-tight mb-2 line-clamp-2"
              >
                {{ notebook.title }}
              </h3>

              <!-- Descripción del cuaderno -->
              <p class="text-stone-500 text-sm mb-4">
                {{ notebook.count }} notas relacionadas
              </p>

              <!-- Preview de contenido de las primeras notas -->
              <div class="space-y-2">
                <div
                  v-for="(note, idx) in notebook.notes.slice(0, 2)"
                  :key="note.id || idx"
                  class="text-xs text-stone-600 line-clamp-1 flex items-center gap-2"
                >
                  <span
                    :class="[
                      'w-1.5 h-1.5 rounded-full',
                      getNoteTypeConfig(note.type).color.split(' ')[0],
                    ]"
                  ></span>
                  <span class="truncate">{{ note.content.substring(0, 40) }}...</span>
                </div>
                <p
                  v-if="notebook.notes.length > 2"
                  class="text-xs text-stone-400 italic"
                >
                  + {{ notebook.notes.length - 2 }} notas más...
                </p>
              </div>

              <!-- Footer con fecha del cuaderno -->
              <div
                class="mt-4 pt-3 border-t border-stone-300/50 flex items-center justify-between"
              >
                <span class="text-xs text-stone-400 font-medium">
                  Actualizado:
                  {{ formatDate(notebook.notes[notebook.notes.length - 1]?.updatedAt) }}
                </span>

                <!-- Indicador de clic para abrir -->
                <span
                  class="text-xs text-amber-600 font-medium flex items-center gap-1"
                >
                  Abrir cuaderno
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <!-- Efecto de esquina doblada (estilo papel) -->
            <div
              class="absolute bottom-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            >
              <div
                class="absolute bottom-0 right-0 w-0 h-0 border-l-[32px] border-l-transparent border-b-[32px] border-b-stone-200/50 shadow-[-2px_-2px_5px_rgba(0,0,0,0.05)]"
              ></div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- NOTAS INDIVIDUALES: Títulos únicos -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div
          v-for="(note, index) in groupedNotes.singles"
          :key="note.id || index"
          class="group relative"
        >
          <!-- Tarjeta de nota con diseño de cuaderno -->
          <div
            :class="[
              'relative h-full bg-gradient-to-b',
              getCardBackground(note.color),
              'rounded-lg shadow-md hover:shadow-xl',
              'transition-all duration-300 ease-out',
              'transform hover:-translate-y-1',
              'overflow-hidden',
              'border border-stone-200/60',
            ]"
          >
            <!-- Línea roja del margen izquierdo (estilo cuaderno) -->
            <div class="absolute left-6 top-0 bottom-0 w-px bg-red-400/60"></div>

            <!-- Líneas horizontales tipo cuaderno (gradiente sutil) -->
            <div
              class="absolute inset-0 opacity-30 pointer-events-none"
              style="
                background-image: repeating-linear-gradient(
                  transparent,
                  transparent 27px,
                  rgba(150, 130, 100, 0.15) 27px,
                  rgba(150, 130, 100, 0.15) 28px
                );
                background-size: 100% 28px;
                margin-top: 56px;
              "
            ></div>

            <!-- Contenido de la tarjeta -->
            <div class="relative p-5 pl-10">
              <!-- Badge de tipo de nota -->
              <div class="flex items-center justify-between mb-4">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
                    getNoteTypeConfig(note.type).color,
                  ]"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="getNoteTypeConfig(note.type).icon"
                    />
                  </svg>
                  {{ getNoteTypeConfig(note.type).label }}
                </span>

                <!-- Acciones (aparecen en hover) -->
                <div
                  class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <button
                    @click.stop="handleDeleteNote(note.id || '', note.name)"
                    class="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar nota"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Título de la nota -->
              <h3
                class="font-serif font-semibold text-stone-800 text-lg leading-tight mb-3 line-clamp-2"
              >
                {{ note.name }}
              </h3>

              <!-- Contenido dividido en 3 párrafos estilo cuaderno -->
              <div class="space-y-2 text-stone-600 text-sm leading-relaxed">
                <p
                  v-for="(paragraph, pIndex) in formatContent(note.content)"
                  :key="pIndex"
                  class="line-clamp-3"
                >
                  {{ paragraph || "..." }}
                </p>
              </div>

              <!-- Footer con fecha -->
              <div
                class="mt-4 pt-3 border-t border-stone-300/50 flex items-center justify-between"
              >
                <span class="text-xs text-stone-400 font-medium">
                  {{ formatDate(note.createdAt) }}
                </span>

                <!-- Indicador de hover para editar -->
                <span
                  class="text-xs text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-medium flex items-center gap-1"
                >
                  Ver detalles
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <!-- Efecto de esquina doblada (estilo papel) -->
            <div
              class="absolute bottom-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            >
              <div
                class="absolute bottom-0 right-0 w-0 h-0 border-l-[32px] border-l-transparent border-b-[32px] border-b-stone-200/50 shadow-[-2px_-2px_5px_rgba(0,0,0,0.05)]"
              ></div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div
          v-if="
            groupedNotes.notebooks.length === 0 &&
            groupedNotes.singles.length === 0 &&
            !noteStore.isLoadingList
          "
          class="col-span-full flex flex-col items-center justify-center py-20 text-center"
        >
          <div
            class="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-4"
          >
            <svg
              class="w-12 h-12 text-stone-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-serif font-semibold text-stone-700 mb-2">
            Tu bitácora está vacía
          </h3>
          <p class="text-stone-500 max-w-md">
            Comienza a capturar tus ideas, citas favoritas y reflexiones de
            lectura. Cada gran pensamiento merece ser preservado.
          </p>
        </div>
      </div>

      <!-- Resumen al final -->
      <div
        v-if="
          groupedNotes.notebooks.length > 0 || groupedNotes.singles.length > 0
        "
        class="mt-10 text-center"
      >
        <p class="text-stone-400 text-sm">
          Mostrando {{ groupedNotes.notebooks.length }} cuaderno(s) y
          {{ groupedNotes.singles.length }} nota(s) individual(es) (total:
          {{ noteStore.notesList.length }} notas)
        </p>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- NOTEBOOK SPREAD: Vista de libro abierto para el cuaderno -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <NotebookSpread
      v-if="selectedNotebook"
      :is-open="isNotebookOpen"
      :notes="selectedNotebook.notes"
      :notebook-title="selectedNotebook.title"
      @close="closeNotebook"
      @add-note="goToAddNote"
      @save="closeNotebook"
    />
  </div>
</template>
