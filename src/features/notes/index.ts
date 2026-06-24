/**
 * Barrel export para el feature de Notas
 * Arquitectura: Vertical Slicing + Onion Architecture
 *
 * Este módulo organiza todas las exportaciones del feature de notas
 * siguiendo los principios SOLID y Clean Architecture.
 */

// Domain - Entidades y contratos (núcleo, sin dependencias externas)
export type { Note, NoteType } from "./domain/entities/Note";
export { NoteFactory } from "./domain/entities/Note";
export type { NoteRepository } from "./domain/repositories/NoteRepository";

// Application - Casos de uso y lógica de aplicación
export { useNoteStore } from "./application/useNoteStore";

// Infrastructure - Implementaciones concretas (dependen del domain)
export { AxiosNoteRepository } from "./infrastructure/repositories/AxiosNoteRepository";

// Presentation - Componentes UI (capa más externa)
export { default as NoteForm } from "./presentation/components/NoteForm.vue";
export { default as NoteList } from "./presentation/components/NoteList.vue";
export { default as NotebookSpread } from "./presentation/components/NotebookSpread.vue";
