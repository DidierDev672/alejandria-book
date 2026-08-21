<script setup lang="ts">
defineProps<{
  userName: string
  exerciseNames: string[]
  equipmentNames: string[]
  isActive: boolean
}>()

defineEmits<{
  view: []
  delete: []
}>()
</script>

<template>
  <article
    class="flex h-full flex-col rounded-xl border border-amber-200 bg-amber-100 p-5 shadow-sm transition-shadow hover:shadow-md"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-xs font-medium uppercase tracking-wide text-stone-500">Nombre del usuario</p>
        <h3 class="mt-1 truncate font-serif text-lg font-semibold text-stone-800">{{ userName }}</h3>
      </div>
      <span
        class="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
        :class="isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
      >
        {{ isActive ? 'Activo' : 'Inactivo' }}
      </span>
    </div>

    <div class="mt-4">
      <p class="text-xs font-medium uppercase tracking-wide text-stone-500">Ejercicios</p>
      <div v-if="exerciseNames.length > 0" class="mt-2 flex flex-wrap gap-2">
        <span
          v-for="(name, index) in exerciseNames"
          :key="`${name}-${index}`"
          class="inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm shadow-orange-500/25"
        >
          {{ name }}
        </span>
      </div>
      <p v-else class="mt-1 text-sm text-stone-500">Sin ejercicios en esta asignación.</p>
    </div>

    <div class="mt-4">
      <p class="text-xs font-medium uppercase tracking-wide text-stone-500">Equipos</p>
      <div v-if="equipmentNames.length > 0" class="mt-2 flex flex-wrap gap-2">
        <span
          v-for="(name, index) in equipmentNames"
          :key="`${name}-${index}`"
          class="inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm shadow-orange-500/25"
        >
          {{ name }}
        </span>
      </div>
      <p v-else class="mt-1 text-sm text-stone-500">Sin equipos en esta asignación.</p>
    </div>

    <div class="mt-5 flex gap-2 pt-1">
      <button
        type="button"
        class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-amber-600 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
        @click="$emit('view')"
      >
        Ver detalle
      </button>
      <button
        type="button"
        class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-800"
        @click="$emit('delete')"
      >
        Eliminar
      </button>
    </div>
  </article>
</template>
