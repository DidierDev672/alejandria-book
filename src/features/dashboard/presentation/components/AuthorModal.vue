<script setup lang="ts">
/**
 * AuthorModal — Organismo molecular para crear/editar autores.
 *
 * Atomic Design: Organism (compuesto de atoms: inputs, badges, botones).
 * SRP: Solo maneja la presentación del formulario modal.
 * ISP: Props y emits estrictamente definidos.
 */
import type { CreateAuthorPayload } from '../../domain/AuthorEntity'
import BaseModal from '../../../../utils/components/BaseModal.vue'

interface Props {
  isOpen: boolean
  editing: boolean
  form: CreateAuthorPayload
  genreInput: string
  submitting: boolean
  apiError: string
  canSubmit: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
  (e: 'update:genre-input', value: string): void
  (e: 'add-genre'): void
  (e: 'remove-genre', index: number): void
}>()

function onGenreKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    emit('add-genre')
  }
}
</script>

<template>
  <BaseModal :is-open="props.isOpen" max-with-class="max-w-lg" @close="emit('close')">
    <template #header>
      <h3 class="text-2xl font-serif font-bold text-white tracking-wide">
        {{ props.editing ? 'Editar Autor' : 'Añadir Autor' }}
      </h3>
      <p class="mt-1 text-sm text-white/70">
        {{ props.editing ? 'Actualiza los datos del autor' : 'Registra un nuevo autor en la biblioteca' }}
      </p>
    </template>

    <template #content>
      <form @submit.prevent="emit('save')" class="space-y-5">
        <!-- ── Nombre (Atom: input) ── -->
        <div>
          <label class="mb-1 block text-sm font-semibold text-gray-700">
            Nombre <span class="text-rose-500">*</span>
          </label>
          <input
            :value="props.form.name"
            type="text"
            required
            class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            placeholder="Nombre completo del autor"
            @input="props.form.name = ($event.target as HTMLInputElement).value"
          />
        </div>

        <!-- ── País (Atom: input) ── -->
        <div>
          <label class="mb-1 block text-sm font-semibold text-gray-700">
            País <span class="text-rose-500">*</span>
          </label>
          <input
            :value="props.form.country"
            type="text"
            required
            class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            placeholder="País de origen"
            @input="props.form.country = ($event.target as HTMLInputElement).value"
          />
        </div>

        <!-- ── Géneros (Molecule: input + badges) ── -->
        <div>
          <label class="mb-1 block text-sm font-semibold text-gray-700">
            Géneros literarios <span class="text-rose-500">*</span>
          </label>
          <div class="flex gap-2">
            <input
              :value="props.genreInput"
              type="text"
              class="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              placeholder="Ej: Realismo mágico"
              @input="emit('update:genre-input', ($event.target as HTMLInputElement).value)"
              @keydown="onGenreKeydown"
            />
            <button
              type="button"
              class="shrink-0 rounded-xl bg-amber-100 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-200 active:scale-95"
              @click="emit('add-genre')"
            >
              Añadir
            </button>
          </div>
          <div v-if="props.form.genres.length" class="mt-2 flex flex-wrap gap-1.5">
            <span
              v-for="(g, i) in props.form.genres"
              :key="i"
              class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
            >
              {{ g }}
              <button
                type="button"
                class="ml-0.5 text-amber-500 transition hover:text-amber-700"
                @click="emit('remove-genre', i)"
              >
                &times;
              </button>
            </span>
          </div>
          <p v-else class="mt-1.5 text-xs text-gray-400">Presiona Enter o haz clic en "Añadir" para agregar un género.</p>
        </div>

        <!-- ── Fecha de nacimiento (Atom: input date) ── -->
        <div>
          <label class="mb-1 block text-sm font-semibold text-gray-700">
            Fecha de nacimiento <span class="text-rose-500">*</span>
          </label>
          <input
            :value="props.form.birthDay"
            type="date"
            required
            class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            @input="props.form.birthDay = ($event.target as HTMLInputElement).value"
          />
        </div>

        <!-- ── Error del API ── -->
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <p v-if="props.apiError" class="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {{ props.apiError }}
          </p>
        </Transition>
      </form>
    </template>

    <template #footer>
      <button
        type="button"
        class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-95"
        @click="emit('close')"
      >
        Cancelar
      </button>
      <button
        type="button"
        :disabled="!props.canSubmit"
        class="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-amber-700 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
        @click="emit('save')"
      >
        <svg v-if="props.submitting" class="mr-1.5 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ props.submitting ? 'Guardando...' : props.editing ? 'Guardar cambios' : 'Añadir autor' }}
      </button>
    </template>
  </BaseModal>
</template>
