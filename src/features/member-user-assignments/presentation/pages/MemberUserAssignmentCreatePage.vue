<script setup lang="ts">
import BaseInput from '@/utils/components/BaseInput.vue'
import BaseModal from '@/utils/components/BaseModal.vue'
import LoadingView from '@/utils/loading/presentation/components/LoadingView.vue'
import { computed, onUnmounted, ref } from 'vue'
import { useMemberUserAssignmentFormStore } from '../../application/stores/useMemberUserAssignmentFormStore'
import { useMemberUserMemberCatalogStore } from '../../application/stores/useMemberUserMemberCatalogStore'
import { useMemberUserUserCatalogStore } from '../../application/stores/useMemberUserUserCatalogStore'
import { MemberUserAssignmentDomainService } from '../../domain/services/MemberUserAssignmentDomainService'
import MemberPickerModal from '../components/organisms/MemberPickerModal.vue'
import UserPickerModal from '../components/organisms/UserPickerModal.vue'

const formStore = useMemberUserAssignmentFormStore()
const memberStore = useMemberUserMemberCatalogStore()
const userStore = useMemberUserUserCatalogStore()

const isMemberModalOpen = ref(false)
const isUserModalOpen = ref(false)

const memberSuccess = computed(() =>
  formStore.selectedMember ? 'Este gladiador ya está listo para el vínculo.' : '',
)
const userSuccess = computed(() =>
  formStore.selectedUser ? 'Esta cuenta ya está lista para recibirlo.' : '',
)
const isResultModalOpen = computed(() => formStore.submitOutcome !== null)
const isSuccess = computed(() => formStore.submitOutcome === 'success')

function handleSelectMember(memberId: string): void {
  const member = memberStore.findById(memberId)
  if (member) formStore.selectMember(member)
  isMemberModalOpen.value = false
}

function handleSelectUser(userId: string): void {
  const user = userStore.findById(userId)
  if (user) formStore.selectUser(user)
  isUserModalOpen.value = false
}

async function handleAssign(): Promise<void> {
  if (!formStore.isReady || formStore.isSubmitting) return
  await formStore.submitAssignment()
}

function handleCloseResult(): void {
  const wasSuccess = formStore.submitOutcome === 'success'
  formStore.clearSubmitOutcome()
  if (wasSuccess) {
    formStore.$reset()
  }
}

onUnmounted(() => {
  formStore.$reset()
})
</script>

<template>
  <div class="min-h-screen bg-[#FFFBF5] px-6 py-8">
    <LoadingView
      :is-loading="formStore.isSubmitting"
      title="Estamos uniendo sus lugares"
      description="Respira. Guardamos este vínculo con calma para que esa persona deje de sentirse partida en dos listas."
    />
    <div class="pointer-events-none fixed top-0 right-0 -z-10 opacity-10">
      <svg width="360" height="260" viewBox="0 0 360 260" fill="none">
        <circle cx="320" cy="-20" r="160" fill="#f59e0b" />
        <circle cx="270" cy="55" r="80" fill="#ea580c" />
      </svg>
    </div>

    <div class="mx-auto max-w-3xl space-y-6">
      <header
        v-motion
        :initial="{ opacity: 0, y: -12 }"
        :enter="{ opacity: 1, y: 0 }"
        :transition="{ duration: 400, ease: [0.16, 1, 0.3, 1] }"
        class="relative overflow-hidden rounded-xl border border-amber-200 bg-amber-100 px-5 py-6 shadow-sm sm:px-8"
      >
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 opacity-90" />
        <div class="pointer-events-none absolute right-0 top-0 opacity-20">
          <svg width="200" height="130" viewBox="0 0 200 130" fill="none" aria-hidden="true">
            <circle cx="180" cy="-10" r="95" fill="#FDE68A" />
            <circle cx="140" cy="35" r="48" fill="#FB923C" />
          </svg>
        </div>
        <div class="relative">
          <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/90">
            Coliseo · Censo
          </p>
          <h1 class="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
            Asignar miembro a usuario
          </h1>
          <p class="mt-1 max-w-xl text-sm text-amber-50/80">
            Unir a alguien con su cuenta no es un trámite: es decirle, con calma, que ya tiene un lugar propio aquí.
          </p>
        </div>
      </header>

      <section
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0 }"
        :transition="{ duration: 420, delay: 80, ease: [0.16, 1, 0.3, 1] }"
        class="overflow-hidden rounded-xl border border-amber-200 bg-amber-100 p-5 shadow-sm sm:p-8"
      >
        <div class="space-y-6">
          <div class="flex items-start gap-3">
            <div class="min-w-0 flex-1">
              <BaseInput
                v-model="formStore.memberName"
                label="Miembro"
                placeholder="Elige a la persona del censo"
                helper-text="Usa el botón de al lado si aún no ves el nombre."
                :success="memberSuccess"
                :required="true"
              />
            </div>
            <button
              type="button"
              class="mt-0.5 inline-flex h-[52px] shrink-0 items-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700 sm:h-[56px]"
              @click="isMemberModalOpen = true"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Seleccionar
            </button>
          </div>

          <div class="flex items-start gap-3">
            <div class="min-w-0 flex-1">
              <BaseInput
                v-model="formStore.userName"
                label="Usuario"
                placeholder="Elige la cuenta registrada"
                helper-text="Usa el botón de al lado para ver quién ya está en el sistema."
                :success="userSuccess"
                :required="true"
              />
            </div>
            <button
              type="button"
              class="mt-0.5 inline-flex h-[52px] shrink-0 items-center gap-2 rounded-xl border border-amber-600 px-4 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 sm:h-[56px]"
              @click="isUserModalOpen = true"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Seleccionar
            </button>
          </div>
        </div>

        <div
          v-if="formStore.isReady && formStore.selectedMember && formStore.selectedUser"
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0 }"
          :transition="{ duration: 320, ease: [0.16, 1, 0.3, 1] }"
          class="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <p class="text-xs font-medium uppercase tracking-wide text-stone-500">Así queda el vínculo</p>
          <p class="mt-2 font-serif text-lg font-semibold text-stone-800">
            {{ formStore.selectedMember.name_full }}
          </p>
          <p class="text-sm text-stone-500">
            {{ MemberUserAssignmentDomainService.documentLabel(formStore.selectedMember.type_document, formStore.selectedMember.number_document) }}
            · {{ formStore.selectedMember.phone_number || 'Sin teléfono' }}
          </p>
          <div class="my-3 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
          <p class="font-serif text-lg font-semibold text-stone-800">
            {{ formStore.selectedUser.name_full }}
          </p>
          <p class="text-sm text-stone-500">
            {{ formStore.selectedUser.id_number || 'Sin documento' }}
            · {{ formStore.selectedUser.email || 'Sin email' }}
          </p>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!formStore.isReady || formStore.isSubmitting"
            @click="handleAssign"
          >
            Asignación
          </button>
        </div>
      </section>
    </div>

    <MemberPickerModal
      :is-open="isMemberModalOpen"
      :selected-member-id="formStore.selectedMember?.id ?? ''"
      @close="isMemberModalOpen = false"
      @select="handleSelectMember"
    />
    <UserPickerModal
      :is-open="isUserModalOpen"
      :selected-user-id="formStore.selectedUser?.id ?? ''"
      @close="isUserModalOpen = false"
      @select="handleSelectUser"
    />

    <BaseModal
      :is-open="isResultModalOpen"
      max-with-class="max-w-lg"
      :expandable="false"
      @close="handleCloseResult"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl border"
            :class="isSuccess
              ? 'border-emerald-300/30 bg-emerald-400/30'
              : 'border-rose-300/30 bg-rose-400/30'"
          >
            <svg
              v-if="isSuccess"
              class="h-6 w-6 text-emerald-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-else
              class="h-6 w-6 text-rose-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-serif text-xl font-bold tracking-wide text-white">
              {{ isSuccess ? 'El vínculo ya está hecho' : 'No pudimos completar la asignación' }}
            </h3>
            <p class="mt-0.5 text-xs text-amber-200/80">
              {{ isSuccess ? 'Esa persona ya tiene un solo lugar' : 'El envío no llegó bien, pero lo que elegiste sigue aquí' }}
            </p>
          </div>
        </div>
      </template>

      <template #content>
        <div v-if="isSuccess" class="py-4 text-center">
          <div class="relative mb-6 inline-flex">
            <div class="absolute inset-0 scale-125 rounded-full bg-emerald-400/20 blur-lg" />
            <div
              class="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-200/40"
            >
              <svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p class="text-base leading-relaxed text-stone-600">
            Listo. El miembro y el usuario ya caminan juntos.
            Acabas de decirle a alguien que lo vimos completo, no partido en dos listas.
          </p>
        </div>

        <div v-else class="py-2">
          <div class="flex items-start gap-4 rounded-2xl border border-rose-200/80 bg-rose-50 p-4">
            <div
              class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-100"
            >
              <svg class="h-5 w-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p class="mb-1 text-sm font-bold text-stone-800">Se presentó un error al intentar asignar el usuario</p>
              <p class="text-sm leading-relaxed text-stone-500">
                Algo se atascó al guardar. No es tu culpa y no perdiste lo que elegiste:
                puedes intentarlo otra vez cuando quieras.
              </p>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <button
          v-if="isSuccess"
          type="button"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200/40 transition-all hover:from-emerald-600 hover:to-emerald-700 active:scale-95"
          @click="handleCloseResult"
        >
          Entendido
        </button>
        <button
          v-else
          type="button"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-600 active:scale-95"
          @click="handleCloseResult"
        >
          Intentarlo otra vez
        </button>
      </template>
    </BaseModal>
  </div>
</template>
