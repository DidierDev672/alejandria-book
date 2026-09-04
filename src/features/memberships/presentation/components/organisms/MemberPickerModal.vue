<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseModal from '@/utils/components/BaseModal.vue'
import { useMemberStore } from '@/features/members/application/stores/useMemberStore'
import type { Member } from '@/features/members/domain/entities/Member.types'
import MemberPickerCard from '../molecules/MemberPickerCard.vue'

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
const localSelected = ref<string | null>(props.selectedMemberId ?? null)

function handleSelect(member: Member): void {
  localSelected.value = member.id
}

function confirmSelection(): void {
  const chosen = memberStore.members.find((m) => m.id === localSelected.value)
  if (chosen) {
    emit('select', chosen)
  }
}

function handleClose(): void {
  emit('close')
}

function loadMembers(): void {
  if (memberStore.members.length === 0) {
    memberStore.fetchMembers()
  }
  localSelected.value = props.selectedMemberId ?? null
}

onMounted(loadMembers)
</script>

<template>
  <BaseModal :is-open="isOpen" max-with-class="max-w-3xl" :expandable="false" @close="handleClose">
    <template #header>
      <div>
        <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/90">Coliseo · Membresías</p>
        <h3 class="mt-1 font-serif text-2xl font-bold text-white">Elige un miembro</h3>
        <p class="mt-1 max-w-md text-sm text-amber-50/80">
          Cada persona aquí tiene un lugar. Toca la tarjeta de quien va a recibir esta membresía.
        </p>
      </div>
    </template>

    <template #content>
      <div v-if="memberStore.isLoading" class="flex flex-col items-center gap-3 py-14">
        <div class="h-8 w-8 rounded-full border-2 border-amber-200 border-t-amber-600 animate-spin" aria-hidden="true" />
        <p class="text-sm text-stone-500">Estamos trayendo a tus miembros…</p>
      </div>

      <div v-else-if="memberStore.hasError" class="flex flex-col items-center gap-4 py-12 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 ring-1 ring-rose-200">
          <svg class="h-7 w-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 class="font-serif text-lg font-bold text-stone-800">No pudimos cargar los miembros</h4>
          <p class="mx-auto mt-1 max-w-sm text-sm text-stone-500">{{ memberStore.error }}</p>
        </div>
        <button
          type="button"
          class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          @click="() => memberStore.fetchMembers()"
        >
          Intentar otra vez
        </button>
      </div>

      <div v-else-if="memberStore.members.length === 0" class="flex flex-col items-center gap-3 py-12 text-center">
        <svg class="h-12 w-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4 4 4 0 004 4z" />
        </svg>
        <p class="font-serif text-lg font-bold text-stone-700">Aún no hay miembros</p>
        <p class="max-w-sm text-sm text-stone-500">Cuando registres a alguien, aparecerá aquí para poder asignarle su membresía.</p>
      </div>

      <div v-else class="grid gap-3 sm:grid-cols-2">
        <MemberPickerCard
          v-for="(member, index) in memberStore.members"
          :key="member.id"
          :member="member"
          :index="index"
          :selected="localSelected === member.id"
          @select="handleSelect"
        />
      </div>
    </template>

    <template #footer>
      <button
        type="button"
        class="inline-flex w-full items-center justify-center rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-700 disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
        :disabled="localSelected === null"
        @click="confirmSelection"
      >
        Confirmar miembro
      </button>
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
