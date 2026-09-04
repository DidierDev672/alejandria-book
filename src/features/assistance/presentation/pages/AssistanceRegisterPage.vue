<script setup lang="ts">
// ============================================================
// PAGE · AssistanceRegisterPage (Registrar asistencia de miembros)
// Slicing vertical (onion) + atomic design:
//   · Miembros -> MemberSelectModal (organism, consume /members)
//   · Membresías -> MembershipPlanCard (molecule, consume
//     /memberships/{member_id} y /planes/{plan_id} vía el store)
//   · Fecha de asistencia -> PayDateField (atom date input)
// El estado de selección (miembro + membresía) reutiliza
// usePayRegisterStore por compartir contratos exactos.
// ============================================================

import { computed, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import BaseInput from '@/utils/components/BaseInput.vue'
import BaseModal from '@/utils/components/BaseModal.vue'
import { LoadingView } from '@/utils/loading'
import { usePayRegisterStore } from '../../../pay/application/stores/usePayRegisterStore'
import { PaymentDomainService } from '../../../pay/domain/Pay'
import { AssistanceDomainService } from '../../../assistance/domain/Assistance'
import { useAssistanceStore } from '../../../assistance/application/stores/useAssistanceStore'
import type { Member } from '../../../members/domain/entities/Member.types'
import MemberSelectModal from '../../../pay/presentation/components/organisms/MemberSelectModal.vue'
import MemberSelectCard from '../../../pay/presentation/components/molecules/MemberSelectCard.vue'
import MembershipPlanCard from '../../../pay/presentation/components/molecules/MembershipPlanCard.vue'
import PayDateField from '../../../pay/presentation/components/atoms/PayDateField.vue'

const store = usePayRegisterStore()
const { member, memberships, membershipsKind, membershipsFeedback, selectedMembership, selectionErrors } =
  storeToRefs(store)

const assistanceStore = useAssistanceStore()
const { isSubmitting, submitOutcome } = storeToRefs(assistanceStore)

const memberModalOpen = ref(false)
const outcomeModalOpen = ref(false)

// Fecha en que ocurre la asistencia; por defecto hoy.
const assistDate = ref<string>(PaymentDomainService.today())

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  enter: { opacity: 1, y: 0, transition: { duration: 600 } },
  animate: { opacity: 1, y: 0 },
}

function openMemberModal(): void {
  memberModalOpen.value = true
}

function handleMemberSelected(selected: Member): void {
  memberModalOpen.value = false
  store.setMember(selected)
}

function clearMember(): void {
  store.setMember(null)
}

function handleCardClicked(membershipId: string): void {
  const next = memberships.value.find((m) => m.id === membershipId) ?? null
  store.setMembership(next)
}

const memberSelectionError = computed(() => selectionErrors.value.selection ?? '')
const dateError = computed(() => (!assistDate.value ? 'Indica la fecha en que ocurre la asistencia.' : ''))

// Formulario listo cuando hay miembro, membresía y fecha.
const canSubmit = computed(
  () => member.value !== null && selectedMembership.value !== null && !!assistDate.value,
)

const isSuccess = computed(() => submitOutcome.value === 'success')
const isError = computed(() => submitOutcome.value === 'error')

async function submit(): Promise<void> {
  if (!member.value || !selectedMembership.value) return

  const payload = AssistanceDomainService.buildPayload(
    member.value.id,
    selectedMembership.value.id,
    assistDate.value,
  )

  await assistanceStore.registerAssistance(payload)
  outcomeModalOpen.value = true
}

function closeOutcomeModal(): void {
  outcomeModalOpen.value = false
}

function clearSelection(): void {
  store.setMember(null)
  store.setMembership(null)
}

onUnmounted(() => {
  store.$reset()
  assistanceStore.$reset()
})
</script>

<template>
  <div class="min-h-screen bg-[#FFFBF5] px-6 py-8">
    <div class="pointer-events-none fixed top-0 right-0 -z-10 opacity-10" aria-hidden="true">
      <svg width="360" height="260" viewBox="0 0 360 260" fill="none">
        <circle cx="320" cy="-20" r="160" fill="#f59e0b" />
        <circle cx="270" cy="55" r="80" fill="#ea580c" />
      </svg>
    </div>

    <div class="mx-auto max-w-5xl space-y-6">
      <!-- ═════════════ Header / breadcrumb ═════════════ -->
      <header
        v-motion
        :initial="fadeUp.initial"
        :enter="fadeUp.enter"
        :animate="fadeUp.animate"
        class="relative overflow-hidden rounded-xl border border-amber-200 bg-amber-100 px-5 py-6 shadow-sm sm:px-8"
      >
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 opacity-90" />
        <div class="pointer-events-none absolute top-0 right-0 opacity-20" aria-hidden="true">
          <svg width="200" height="130" viewBox="0 0 200 130" fill="none">
            <circle cx="180" cy="-10" r="95" fill="#FDE68A" />
            <circle cx="140" cy="35" r="48" fill="#FB923C" />
          </svg>
        </div>
        <div class="relative">
          <nav aria-label="Ruta de navegación" class="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/90">
            <span>Coliseo</span>
            <span aria-hidden="true">›</span>
            <span>Miembros</span>
            <span aria-hidden="true">›</span>
            <span class="text-white">Asistencias</span>
          </nav>
          <h1 class="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
            Cada presencia cuenta una historia
          </h1>
          <p class="mt-1 max-w-xl text-sm text-amber-50/80">
            Registrar una asistencia es dejar constancia de una promesa cumplida:
            alguien que eligió llegar, hoy otra vez. Elige quién vino, su membresía
            y en qué fecha latió su compromiso.
          </p>
        </div>
      </header>

      <!-- ═════════════ Card con el formulario ═════════════ -->
      <section
        v-motion
        :initial="fadeUp.initial"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 120 } }"
        :animate="fadeUp.animate"
        class="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm"
      >
        <form class="space-y-8 p-5 sm:p-8" @submit.prevent="submit">
          <!-- ─────────── 1 · Miembro ─────────── -->
          <section>
            <header class="mb-4 flex items-center gap-2">
              <span class="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-black text-white">1</span>
              <div>
                <h2 class="font-serif text-lg font-bold text-stone-800">¿Quién vino hoy?</h2>
                <p class="text-xs text-stone-500">Una asistencia sin nombre es un latido que no encontramos dónde anclar.</p>
              </div>
            </header>

            <div v-if="!member" class="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div class="relative flex-1 cursor-pointer" @click="openMemberModal">
                <BaseInput
                  label="Miembro del coliseo"
                  type="text"
                  placeholder="Toca para elegir quién asistió…"
                  :error="memberSelectionError"
                  :show-clear="false"
                  :disabled="true"
                />
              </div>
              <button
                type="button"
                class="inline-flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                @click="openMemberModal"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Seleccionar miembro
              </button>
            </div>

            <div v-else class="space-y-3">
              <MemberSelectCard :member="member" :key="member.id" @select="openMemberModal" />
              <div class="flex items-center justify-between gap-3">
                <p class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100">
                    <svg class="h-2.5 w-2.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  Presencia confirmada
                </p>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-xs font-bold text-stone-400 transition-colors hover:text-rose-600"
                  @click="clearMember"
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cambiar miembro
                </button>
              </div>
            </div>
          </section>

          <!-- ─────────── 2 · Membresía ─────────── -->
          <section>
            <header class="mb-4 flex items-center gap-2">
              <span class="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-black text-white">2</span>
              <div>
                <h2 class="font-serif text-lg font-bold text-stone-800">¿Qué membresía lo sostiene?</h2>
                <p class="text-xs text-stone-500">Las membresías se cargan para la persona que confirmaste.</p>
              </div>
            </header>

            <template v-if="!member">
              <p class="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-400">
                Primero confirma quién asistió; aquí aparecerán sus membresías.
              </p>
            </template>

            <template v-else-if="membershipsKind === 'loading'">
              <div class="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-4">
                <div class="h-5 w-5 rounded-full border-2 border-amber-200 border-t-amber-600 animate-spin" aria-hidden="true" />
                <p class="text-sm text-stone-500">Buscando las membresías de {{ member.name_full }}…</p>
              </div>
            </template>

            <template v-else-if="membershipsKind === 'error' && membershipsFeedback">
              <div class="rounded-xl bg-rose-50 px-5 py-4 ring-1 ring-rose-200">
                <h4 class="text-sm font-bold text-rose-800">{{ membershipsFeedback.title }}</h4>
                <p class="mt-1 text-sm text-rose-700">{{ membershipsFeedback.description }}</p>
                <button
                  type="button"
                  class="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-700"
                  @click="() => store.fetchMemberships()"
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Reintentar
                </button>
              </div>
            </template>

            <template v-else-if="membershipsKind === 'empty' && membershipsFeedback">
              <div class="rounded-xl bg-stone-50 px-5 py-5 text-center">
                <h4 class="font-serif text-sm font-bold text-stone-700">{{ membershipsFeedback.title }}</h4>
                <p class="mx-auto mt-1 max-w-sm text-sm text-stone-500">{{ membershipsFeedback.description }}</p>
              </div>
            </template>

            <template v-else-if="membershipsKind === 'ok'">
              <div class="grid gap-3 sm:grid-cols-2">
                <MembershipPlanCard
                  v-for="item in memberships"
                  :key="item.id"
                  :member="member"
                  :membership="item"
                  :selected="selectedMembership?.id === item.id"
                  @select="handleCardClicked(item.id)"
                />
              </div>
              <p v-if="memberSelectionError && !selectedMembership" class="mt-3 text-xs font-medium text-rose-600">
                {{ memberSelectionError }}
              </p>
              <p v-else class="mt-3 text-xs text-stone-400">
                Toca la tarjeta del plan que acompaña a esta persona hoy.
              </p>
            </template>
          </section>

          <!-- ─────────── 3 · Fecha de asistencia ─────────── -->
          <section>
            <header class="mb-4 flex items-center gap-2">
              <span class="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-black text-white">3</span>
              <div>
                <h2 class="font-serif text-lg font-bold text-stone-800">¿En qué fecha sucedió?</h2>
                <p class="text-xs text-stone-500">El día en que esa presencia llenó el recinto.</p>
              </div>
            </header>

            <PayDateField
              v-model="assistDate"
              id="assist-date"
              label="Fecha de la asistencia"
              :error="dateError"
              :max="PaymentDomainService.today()"
            />
          </section>

          <!-- ─────────── Resumen + enviar ─────────── -->
          <aside class="rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50/70 to-white p-5">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">Resumen de la asistencia</p>

            <dl class="mt-4 space-y-3 text-sm">
              <div class="flex items-start justify-between gap-3">
                <dt class="text-stone-500">Miembro</dt>
                <dd class="max-w-[55%] text-right font-bold text-stone-800">{{ member?.name_full ?? '—' }}</dd>
              </div>
              <div class="flex items-start justify-between gap-3">
                <dt class="text-stone-500">Membresía</dt>
                <dd class="max-w-[55%] text-right font-mono text-xs font-bold text-stone-800">
                  {{ selectedMembership?.plan_id ?? '—' }}
                </dd>
              </div>
              <div class="flex items-start justify-between gap-3">
                <dt class="text-stone-500">Fecha</dt>
                <dd class="max-w-[55%] text-right font-bold text-stone-800">{{ assistDate || '—' }}</dd>
              </div>
            </dl>

            <button
              type="submit"
              class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-amber-600/25 transition-all duration-200 hover:from-amber-700 hover:to-orange-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
              :disabled="!canSubmit || isSubmitting"
            >
              <svg v-if="isSubmitting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {{ isSubmitting ? 'Registrando presencia…' : 'Registrar asistencia' }}
            </button>

            <p class="mt-3 text-center text-xs text-stone-400">
              Al registrar, la asistencia queda asociada al miembro, su membresía y la fecha elegida.
            </p>
          </aside>
        </form>
      </section>
    </div>

    <!-- Modal de selección de miembro (consume /members + manejo 400) -->
    <MemberSelectModal
      :is-open="memberModalOpen"
      :selected-member-id="member?.id"
      @close="memberModalOpen = false"
      @select="handleMemberSelected"
    />

    <!-- Overlay de carga mientras se construye y envía el payload -->
    <LoadingView
      :is-loading="isSubmitting"
      title="Guardando su presencia"
      description="Estamos cuidando este momento del miembro en la memoria del coliseo. Un segundo, por favor."
    />

    <!-- Modal de resultado: éxito (201) o error, con lenguaje psicológico -->
    <BaseModal
      v-if="outcomeModalOpen"
      :is-open="outcomeModalOpen"
      :max-with-class="'max-w-md'"
      @close="closeOutcomeModal"
    >
      <template #header>
        <span class="flex items-center gap-2 text-base font-bold text-white">
          <svg
            v-if="isSuccess"
            class="h-5 w-5 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.4"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75l2.25 2.25 4.5-5.25" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          <svg
            v-else
            class="h-5 w-5 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.4"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ isSuccess ? AssistanceDomainService.successTitle() : AssistanceDomainService.errorTitle() }}
        </span>
      </template>

      <template #content>
        <p class="text-sm leading-relaxed text-stone-600">
          {{ isSuccess ? AssistanceDomainService.successMessage() : AssistanceDomainService.errorMessage() }}
        </p>
      </template>

      <template #footer>
        <button
          class="w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-amber-600/25 transition-all duration-200 hover:from-amber-700 hover:to-orange-700 active:scale-[0.98]"
          @click="closeOutcomeModal"
        >
          {{ isSuccess ? 'Perfecto' : 'Intentar de nuevo' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>
