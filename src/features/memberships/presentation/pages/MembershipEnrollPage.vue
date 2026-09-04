<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import BaseInput from '@/utils/components/BaseInput.vue'
import BaseModal from '@/utils/components/BaseModal.vue'
import LoadingView from '@/utils/loading/presentation/components/LoadingView.vue'
import MemberPickerModal from '../components/organisms/MemberPickerModal.vue'
import PlanPickerModal from '../components/organisms/PlanPickerModal.vue'
import { useMembershipEnrollStore } from '../../application/stores/useMembershipEnrollStore'
import type { Member } from '@/features/members/domain/entities/Member.types'
import type { MembershipPlanPayload } from '../../domain/entities/Membership.types'

const enroll = useMembershipEnrollStore()
const { memberName, planName, startDate, endDate, isRenewable, isCancellable, canSubmit, isSubmitting, submitOutcome } =
  storeToRefs(enroll)

const memberModalOpen = ref(false)
const planModalOpen = ref(false)
const selectedMember = ref<Member | null>(null)
const selectedPlan = ref<MembershipPlanPayload | null>(null)

const isResultOpen = computed(() => submitOutcome.value !== null)
const isSuccess = computed(() => submitOutcome.value === 'success')

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  enter: { opacity: 1, y: 0, transition: { duration: 600 } },
  animate: { opacity: 1, y: 0 },
}

const datesValid = computed(() => {
  if (!startDate.value || !endDate.value) return true
  return new Date(endDate.value) >= new Date(startDate.value)
})

function pickMember(member: Member): void {
  selectedMember.value = member
  enroll.setSelection(
    { id: member.id, name: member.name_full },
    selectedPlan.value ? { id: planIdValue(selectedPlan.value), name: selectedPlan.value.name } : null,
  )
  memberModalOpen.value = false
}

function planIdValue(plan: MembershipPlanPayload): string {
  return plan.id ?? plan.name
}

function pickPlan(plan: MembershipPlanPayload): void {
  selectedPlan.value = plan
  enroll.setSelection(selectedMember.value ? { id: selectedMember.value.id, name: selectedMember.value.name_full } : null, { id: planIdValue(plan), name: plan.name })
  planModalOpen.value = false
}

async function handleSubmit(): Promise<void> {
  if (!canSubmit.value || !datesValid.value || isSubmitting.value) return
  await enroll.registerMembership()
}

function closeResult(): void {
  const wasSuccess = isSuccess.value
  enroll.clearSubmitOutcome()
  if (wasSuccess) {
    selectedMember.value = null
    selectedPlan.value = null
    enroll.clearSelection()
    enroll.startDate = ''
    enroll.endDate = ''
  }
}

onUnmounted(() => {
  enroll.$reset()
})
</script>

<template>
  <div class="min-h-screen bg-[#FFFBF5] px-6 py-8">
    <div class="pointer-events-none fixed top-0 right-0 -z-10 opacity-10">
      <svg width="360" height="260" viewBox="0 0 360 260" fill="none" aria-hidden="true">
        <circle cx="320" cy="-20" r="160" fill="#f59e0b" />
        <circle cx="270" cy="55" r="80" fill="#ea580c" />
      </svg>
    </div>

    <div class="mx-auto max-w-4xl space-y-6">
      <!-- ═════════════ Header / breadcrumb ═════════════ -->
      <header
        v-motion
        :initial="fadeUp.initial"
        :enter="fadeUp.enter"
        :animate="fadeUp.animate"
        class="relative overflow-hidden rounded-xl border border-amber-200 bg-amber-100 px-5 py-6 shadow-sm sm:px-8"
      >
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 opacity-90" />
        <div class="pointer-events-none absolute top-0 right-0 opacity-20">
          <svg width="200" height="130" viewBox="0 0 200 130" fill="none" aria-hidden="true">
            <circle cx="180" cy="-10" r="95" fill="#FDE68A" />
            <circle cx="140" cy="35" r="48" fill="#FB923C" />
          </svg>
        </div>
        <div class="relative">
          <nav aria-label="Ruta de navegación" class="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/90">
            <span>Coliseo</span>
            <span aria-hidden="true">›</span>
            <span>Membresías</span>
            <span aria-hidden="true">›</span>
            <span class="text-white">Registrar</span>
          </nav>
          <h1 class="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
            Da la bienvenida a un miembro
          </h1>
          <p class="mt-1 max-w-xl text-sm text-amber-50/80">
            Cada membresía es una promesa de pertenencia. Aquí armas, con calma, el lugar que alguien va a ocupar: quién es, qué plan sostiene y por cuánto tiempo.
          </p>
        </div>
      </header>

      <!-- ═════════════ Form content ═════════════ -->
      <section
        v-motion
        :initial="fadeUp.initial"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 120 } }"
        :animate="fadeUp.animate"
        class="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm"
      >
        <form class="space-y-8 p-5 sm:p-8" @submit.prevent="handleSubmit">
          <!-- ─────────── Miembro ─────────── -->
          <div>
            <div class="mb-3 flex items-center justify-between">
              <div>
                <h2 class="font-serif text-lg font-bold text-stone-800">¿Quién se queda?</h2>
                <p class="text-xs text-stone-500">Busca y elige al miembro que recibirá la membresía.</p>
              </div>
              <span v-if="selectedMember"
                class="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1 text-[11px] font-bold text-white"
              >
                Miembro seleccionado
              </span>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <div class="flex-1">
                <BaseInput
                  v-model="memberName"
                  label="Miembro"
                  :show-clear="false"
                  placeholder="Toca el botón para buscar un miembro"
                  :disabled="true"
                />
              </div>
              <button
                type="button"
                class="inline-flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                @click="memberModalOpen = true"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                </svg>
                Ver miembros
              </button>
            </div>

            <p v-if="selectedMember" class="mt-2 text-xs text-stone-500">
              {{ selectedMember.name_full }} · {{ selectedMember.number_document }}
            </p>
          </div>

          <!-- ─────────── Plan ─────────── -->
          <div>
            <div class="mb-3 flex items-center justify-between">
              <div>
                <h2 class="font-serif text-lg font-bold text-stone-800">¿Qué plan lo sostiene?</h2>
                <p class="text-xs text-stone-500">Elige el plan que acompaña su permanencia.</p>
              </div>
              <span v-if="selectedPlan"
                class="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1 text-[11px] font-bold text-white"
              >
                Plan seleccionado
              </span>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <div class="flex-1">
                <BaseInput
                  v-model="planName"
                  label="Plan"
                  :show-clear="false"
                  placeholder="Toca el botón para ver los planes"
                  :disabled="true"
                />
              </div>
              <button
                type="button"
                class="inline-flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                @click="planModalOpen = true"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 3m0 0l3-3M6 9V4a3 3 0 013-3h8a2 2 0 012 2v15M5 21a2 2 0 01-2-2v-3m14 0a2 2 0 012 2v3" />
                </svg>
                Ver planes
              </button>
            </div>

            <p v-if="selectedPlan" class="mt-2 text-xs text-stone-500">
              {{ selectedPlan.name }} · {{ selectedPlan.is_active ? 'Activo' : 'Inactivo' }}
            </p>
          </div>

          <!-- ─────────── Fechas ─────────── -->
          <div>
            <h2 class="mb-1 font-serif text-lg font-bold text-stone-800">El tiempo de esta membresía</h2>
            <p class="mb-3 text-xs text-stone-500">Define cuándo empieza a contar y cuándo termina.</p>

            <div class="grid gap-4 sm:grid-cols-2">
              <BaseInput
                v-model="startDate"
                type="date"
                label="Fecha de inicio"
                :show-clear="false"
              />
              <BaseInput
                v-model="endDate"
                type="date"
                label="Fecha de finalización"
                :show-clear="false"
              />
            </div>
            <p v-if="!datesValid" class="mt-2 text-xs font-medium text-rose-600">
              El final no puede ir antes del inicio. Ajusta las fechas para que el tiempo tenga orden.
            </p>
          </div>

          <!-- ─────────── Switch: renovable / desactivable ─────────── -->
          <div class="rounded-xl border border-amber-300 bg-[#FFFBF5] p-4">
            <h2 class="font-serif text-base font-bold text-stone-800">Reglas de la membresía</h2>
            <p class="mb-4 text-xs text-stone-500">Define cómo se comporta esta membresía con el tiempo.</p>

            <div class="grid gap-4 sm:grid-cols-2">
              <div class="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-white px-4 py-3">
                <div>
                  <p class="text-sm font-medium text-stone-800">Renovable</p>
                  <p class="mt-0.5 text-xs text-stone-500">Al terminar, se renueva sola.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="isRenewable"
                  aria-label="Activar renovación automática"
                  class="relative h-7 w-12 shrink-0 rounded-full transition-colors"
                  :class="isRenewable ? 'bg-amber-600' : 'bg-stone-300'"
                  @click="isRenewable = !isRenewable"
                >
                  <span
                    class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform"
                    :class="isRenewable ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>

              <div class="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-white px-4 py-3">
                <div>
                  <p class="text-sm font-medium text-stone-800">Desactivable</p>
                  <p class="mt-0.5 text-xs text-stone-500">Puede apagarse antes de tiempo.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="isCancellable"
                  aria-label="Permitir desactivar la membresía"
                  class="relative h-7 w-12 shrink-0 rounded-full transition-colors"
                  :class="isCancellable ? 'bg-amber-600' : 'bg-stone-300'"
                  @click="isCancellable = !isCancellable"
                >
                  <span
                    class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform"
                    :class="isCancellable ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- ─────────── Resumen + enviar ─────────── -->
          <div v-if="selectedMember || selectedPlan" class="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">Tu membresía</p>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <span v-if="selectedMember" class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {{ selectedMember.name_full }}
              </span>
              <span v-if="selectedPlan" class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {{ selectedPlan.name }}
              </span>
              <span v-if="startDate" class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {{ startDate }} → {{ endDate || '…' }}
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              class="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:pointer-events-none disabled:opacity-50"
              :disabled="!canSubmit || !datesValid || isSubmitting"
            >
              Guardar membresía
            </button>
          </div>
        </form>
      </section>
    </div>

    <LoadingView
      :is-loading="isSubmitting"
      title="Estamos abriendo un lugar para él"
      description="La membresía se está escribiendo con calma. En un instante tu miembro tendrá un sitio que lo sostiene."
    />

    <MemberPickerModal
      :is-open="memberModalOpen"
      :selected-member-id="selectedMember?.id"
      @close="memberModalOpen = false"
      @select="pickMember"
    />
    <PlanPickerModal
      :is-open="planModalOpen"
      :selected-plan-name="selectedPlan?.name"
      @close="planModalOpen = false"
      @select="pickPlan"
    />

    <BaseModal :is-open="isResultOpen" max-with-class="max-w-md" :expandable="false" @close="closeResult">
      <template #header>
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            :class="isSuccess ? 'bg-white/15 ring-1 ring-white/20' : 'bg-rose-500/20 ring-1 ring-rose-200/30'"
          >
            <svg
              v-if="isSuccess"
              class="h-6 w-6 text-emerald-100"
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
            <h3 class="font-serif text-2xl font-bold tracking-wide text-white">
              {{ isSuccess ? 'Ya tiene su lugar' : 'Esta vez no se pudo' }}
            </h3>
            <p class="mt-1 text-sm text-amber-100/80">
              {{ isSuccess ? 'La membresía quedó guardada, con calma y para quedarse.' : 'No pasó nada grave: el intento no avanzó, pero todo lo que elegiste sigue aquí.' }}
            </p>
          </div>
        </div>
      </template>
      <template #content>
        <div v-if="isSuccess" class="py-4 text-center">
          <p class="text-base leading-relaxed text-stone-600">
            Listo. {{ selectedMember?.name_full || 'Tu miembro' }} ya pertenece con el plan
            <span class="font-semibold text-stone-800">{{ selectedPlan?.name || 'elegido' }}</span>.
            Nadie se queda fuera cuando hay un lugar pensado para él.
          </p>
        </div>
        <div v-else class="flex items-start gap-4 rounded-2xl border border-rose-200/80 bg-rose-50 p-4">
          <p class="text-sm leading-relaxed text-stone-600">
            Se presentó un error al intentar registrar la membresía. Respira: no es tu culpa ni la de tu miembro. Lo que armaste quedó intacto, y podemos intentarlo otra vez cuando quieras, sin prisa y sin nada perdido.
          </p>
        </div>
      </template>
      <template #footer>
        <button
          type="button"
          class="inline-flex w-full items-center justify-center rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-700"
          @click="closeResult"
        >
          {{ isSuccess ? 'Perfecto, listo' : 'Intentarlo otra vez' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>
