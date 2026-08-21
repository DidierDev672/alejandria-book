<script setup lang="ts">
import BaseModal from '@/utils/components/BaseModal.vue'

defineProps<{
  isOpen: boolean
  userName: string
  isDeleting: boolean
  error: string | null
}>()

defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <BaseModal :is-open="isOpen" max-with-class="max-w-md" :expandable="false" @close="$emit('close')">
    <template #header>
      <h3 class="font-serif text-2xl font-bold tracking-wide text-white">Eliminar asignación</h3>
      <p class="mt-1 text-sm text-amber-100/80">Esta acción se puede pensar con calma.</p>
    </template>
    <template #content>
      <p class="text-sm leading-relaxed text-stone-600">
        Vas a quitar la asignación de
        <span class="font-semibold text-stone-800">{{ userName }}</span>.
        No desaparece la persona ni su historia: solo este paso. Si te equivocas, puedes crear una nueva cuando quieras.
      </p>
      <p v-if="error" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ error }}
      </p>
    </template>
    <template #footer>
      <button
        type="button"
        class="rounded-xl border-2 border-amber-300 bg-white px-6 py-2.5 text-sm font-bold text-stone-700 transition-all hover:bg-amber-50 active:scale-95 disabled:opacity-60"
        :disabled="isDeleting"
        @click="$emit('close')"
      >
        Cancelar
      </button>
      <button
        type="button"
        class="rounded-xl bg-red-700 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-800 active:scale-95 disabled:opacity-60"
        :disabled="isDeleting"
        @click="$emit('confirm')"
      >
        {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
      </button>
    </template>
  </BaseModal>
</template>
