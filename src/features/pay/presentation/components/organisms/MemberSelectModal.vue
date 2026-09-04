<script setup lang="ts">
// ============================================================
// ORGANISM · MemberSelectModal
// Modal de selección de miembro para el pago.
// Consume /members a través del store (axios + pinia):
//   · 200 -> lista de miembros en tarjetas
//   · 400 -> mensaje de error psicológico, sin tecnicismos
// ============================================================

import { computed, watch } from 'vue'
import BaseModal from '@/utils/components/BaseModal.vue'
import BaseInput from '@/utils/components/BaseInput.vue'
import { useMemberStore } from '@/features/members/application/stores/useMemberStore'
import type { Member } from '@/features/members/domain/entities/Member.types'
import MemberSelectCard from '../molecules/MemberSelectCard.vue'

interface Props {
  isOpen: boolean
  selectedMemberId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', member: Member): void
}>()

const memberStore = useMemberStore()

const searchQuery = defineModel<string>('search', { default: '' })

const filteredMembers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return memberStore.members

  return memberStore.members.filter(
    (member) =>
      member.name_full.toLowerCase().includes(query) ||
      member.number_document.toLowerCase().includes(query) ||
      member.phone_number.toLowerCase().includes(query),
  )
})

watch(
  () => props.isOpen,
  (open) => {
    if (!open) return
    searchQuery.value = ''
    if (memberStore.members.length === 0) {
      memberStore.clearError()
      memberStore.fetchMembers()
    }
  },
)

function handleSelect(member: Member): void {
  emit('select', member)
}

function handleClose(): void {
  emit('close')
}
</script>

<template>
  <BaseModal :is-open="isOpen" max-with-class="max-w-3xl" :expandable="false" @close="handleClose">
    <template #header>
      <div>
        <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/90">Coliseo · Pagos</p>
        <h3 class="mt-1 font-serif text-2xl font-bold text-white">¿Quién realiza el pago?</h3>
        <p class="mt-1 max-w-md text-sm text-amber-50/80">
          Toca la tarjeta de la persona cuyo pago estás registrando. Lo demás se acomoda solo.
        </p>
      </div>
    </template>

    <template #content>
      <BaseInput
        v-model="searchQuery"
        label="Buscar miembro"
        type="search"
        placeholder="Nombre, documento o teléfono…"
        helper-text="Escribe para filtrar la lista al instante."
        :max-length="40"
      />

      <div v-if="memberStore.isLoading" class="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-stone-50 py-14">
        <div class="h-8 w-8 rounded-full border-2 border-amber-200 border-t-amber-600 animate-spin" aria-hidden="true" />
        <p class="text-sm text-stone-500">Estamos mirando quién está en el coliseo…</p>
      </div>

      <div v-else-if="memberStore.hasError" class="mt-4 rounded-2xl bg-rose-50 p-8 text-center ring-1 ring-rose-200">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100">
          <svg class="h-7 w-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h4 class="mt-4 font-serif text-lg font-bold text-stone-800">Algo no encajó en la solicitud</h4>
        <p class="mx-auto mt-1 max-w-sm text-sm text-stone-500">
          El sistema no comprendió la petición como esperábamos. No ha sido culpa tuya: tus datos están a salvo.
          Respira y vuelve a intentarlo.
        </p>
        <button
          type="button"
          class="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-700"
          @click="() => { memberStore.clearError(); memberStore.fetchMembers() }"
        >
          Intentar de nuevo
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      <div v-else-if="memberStore.members.length === 0" class="mt-4 rounded-2xl bg-stone-50 px-8 py-12 text-center">
        <svg class="mx-auto h-12 w-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4 4 4 0 004 4z" />
        </svg>
        <p class="mt-3 font-serif text-lg font-bold text-stone-700">Aún no hay nadie aquí</p>
        <p class="mx-auto max-w-sm text-sm text-stone-500">
          Cuando registres a un miembro del coliseo, aparecerá en esta lista y podrás asociarle su pago.
        </p>
      </div>

      <div v-else class="mt-4">
        <div v-if="filteredMembers.length === 0" class="rounded-2xl bg-stone-50 px-8 py-10 text-center">
          <p class="font-serif text-base font-bold text-stone-700">Nadie coincide con esa búsqueda</p>
          <p class="mx-auto mt-1 max-w-sm text-sm text-stone-500">
            Prueba con otro nombre, documento o número de teléfono.
          </p>
        </div>

        <ul class="grid gap-3 sm:grid-cols-2">
          <li v-for="member in filteredMembers" :key="member.id">
            <MemberSelectCard :member="member" @select="handleSelect" />
          </li>
        </ul>

        <p class="mt-4 flex items-center gap-2 text-xs text-stone-400">
          <span class="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
          {{ filteredMembers.length }} de {{ memberStore.members.length }} miembros
        </p>
      </div>
    </template>

    <template #footer>
      <button
        type="button"
        class="inline-flex w-full items-center justify-center rounded-xl border border-amber-300 bg-white px-6 py-2.5 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-50 sm:w-auto"
        @click="handleClose"
      >
        Cancelar
      </button>
    </template>
  </BaseModal>
</template>