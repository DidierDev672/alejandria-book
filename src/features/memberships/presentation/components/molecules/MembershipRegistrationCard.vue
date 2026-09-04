<script setup lang="ts">
/**
 * MembershipRegistrationCard.vue
 *
 * Tarjeta atómica para visualizar una membresía registrada.
 * - Recibe una `MembershipRegistration` y un retardo opcional para escalonar el fade-in.
 * - Usa el directivo `v-motion` (@vueuse/motion) para la transición de entrada.
 * - Resuelve el nombre del miembro (GET /members/{id}) y del plan (GET /planes/{id}):
 *   · Miembro: 200 -> muestra name_full; 400/404 -> píldora "Sin miembro asignado".
 *   · Plan:    200 -> muestra name;     400   -> mensaje amigable de error.
 */
import { computed, onMounted, ref } from 'vue'
import type { MembershipRegistration } from '../../../domain/entities/MembershipRegistration.types'
import { isMembershipActive } from '../../../domain/entities/MembershipRegistration.types'
import {
  HttpMembershipRepository,
  MembershipLookupHttpError,
} from '../../../infrastructure/http/HttpMembershipRepository'

interface Props {
  registration: MembershipRegistration
  enterDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  enterDelay: 0,
})

const emit = defineEmits<{
  (e: 'resolved', payload: { id: string; memberName: string | null; planName: string | null }): void
}>()

type LookupState = 'loading' | 'ok' | 'unassigned' | 'error'

const repository = new HttpMembershipRepository()

const isActive = computed(() => isMembershipActive(props.registration.status))
const statusLabel = computed(() => (isActive.value ? 'Activa' : 'Inactiva'))

const memberState = ref<LookupState>('loading')
const memberName = ref('')
const planState = ref<LookupState>('loading')
const planName = ref('')

const enter = computed(() => ({
  opacity: 1,
  y: 0,
  scale: 1,
  transition: { duration: 0.6, ease: 'easeOut' as const, delay: props.enterDelay },
}))

/* ────────────── Mensajes psicológicos: amigables, sin culpa, con salida ────────────── */
const MEMBER_UNASSIGNED_HINT =
  'Este espacio aguarda a su gladiador. No se ha perdido nada: la membresía sigue intacta y queda lista en cuanto quieras asignarle un miembro.'
const MEMBER_ERROR_HINT =
  'No pudimos traer el nombre del miembro. Respira: los datos de la membresía siguen a salvo. Inténtalo de nuevo en un momento.'
const PLAN_ERROR_HINT =
  'Se presentó un error al obtener el plan. No fue culpa tuya: a veces la información viaja más lenta de lo esperado. Sin prisa, inténtalo de nuevo cuando quieras.'

function isAssignableMiss(error: unknown): boolean {
  return error instanceof MembershipLookupHttpError && (error.status === 400 || error.status === 404)
}

async function loadDetails(): Promise<void> {
  const [memberResult, planResult] = await Promise.allSettled([
    repository.findMemberById(props.registration.member_id),
    repository.findPlanById(props.registration.plan_id),
  ])

  if (memberResult.status === 'fulfilled') {
    memberName.value = memberResult.value.name_full
    memberState.value = 'ok'
  } else if (isAssignableMiss(memberResult.reason)) {
    memberState.value = 'unassigned'
  } else {
    memberState.value = 'error'
  }

  if (planResult.status === 'fulfilled') {
    planName.value = planResult.value.name
    planState.value = 'ok'
  } else {
    planState.value = 'error'
  }

  emit('resolved', {
    id: props.registration.id,
    memberName: memberState.value === 'ok' ? memberName.value : null,
    planName: planState.value === 'ok' ? planName.value : null,
  })
}

onMounted(() => {
  void loadDetails()
})

function formatDate(value: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
</script>

<template>
  <article
    v-motion
    :initial="{ opacity: 0, y: 24, scale: 0.98 }"
    :enter="enter"
    :hovered="{ y: -4, scale: 1.01 }"
    class="group flex flex-col overflow-hidden rounded-2xl border border-amber-200/80 bg-white shadow-sm transition-shadow hover:shadow-lg hover:shadow-amber-100"
  >
    <div class="border-b border-amber-100 bg-gradient-to-r from-amber-50/70 to-orange-50/50 px-5 py-3.5">
      <div class="flex items-center gap-3">
        <span
          class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
          :class="isActive
            ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
            : 'bg-orange-100 text-orange-700 ring-1 ring-orange-200'"
          role="status"
        >
          <span
            class="h-1.5 w-1.5 rounded-full"
            :class="isActive ? 'bg-emerald-500' : 'bg-orange-500'"
            aria-hidden="true"
          />
          {{ statusLabel }}
        </span>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-4 px-5 py-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">Miembro</p>

          <p v-if="memberState === 'loading'" class="mt-1.5 inline-flex h-4 w-28 max-w-full animate-pulse rounded bg-amber-100" aria-hidden="true" />

          <p v-else-if="memberState === 'ok'" class="mt-1 truncate text-sm font-semibold text-stone-800" :title="memberName">
            {{ memberName }}
          </p>

          <span
            v-else-if="memberState === 'unassigned'"
            class="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-200"
            :title="MEMBER_UNASSIGNED_HINT"
            role="status"
          >
            <svg class="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sin miembro asignado
          </span>

          <span
            v-else
            class="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-500 ring-1 ring-stone-200"
            :title="MEMBER_ERROR_HINT"
          >
            Miembro no disponible
          </span>
        </div>

        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">Plan</p>

          <p v-if="planState === 'loading'" class="mt-1.5 inline-flex h-4 w-24 max-w-full animate-pulse rounded bg-amber-100" aria-hidden="true" />

          <p v-else-if="planState === 'ok'" class="mt-1 truncate text-sm font-semibold text-stone-800" :title="planName">
            {{ planName }}
          </p>

          <p
            v-else
            class="mt-1 flex items-start gap-1 text-[11px] leading-snug font-medium text-rose-600"
            :title="PLAN_ERROR_HINT"
          >
            <svg class="mt-px h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Se presentó un error al obtener el plan. No fue culpa tuya; inténtalo de nuevo cuando quieras.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 rounded-xl border border-amber-100 bg-[#FFFBF5] px-4 py-3">
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">Fecha de inicio</p>
          </div>
          <p class="mt-1 text-sm font-semibold text-stone-800">{{ formatDate(registration.date_start) }}</p>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-orange-400" aria-hidden="true" />
            <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">Fecha final</p>
          </div>
          <p class="mt-1 text-sm font-semibold text-stone-800">{{ formatDate(registration.date_end) }}</p>
        </div>
      </div>
    </div>

    <footer v-if="registration.automatic_renewal" class="border-t border-amber-100/70 px-5 py-2.5">
      <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5M20 20v-5h-5M4.998 15.5a8.5 8.5 0 0014.5 0M5 8.5a8.5 8.5 0 0114.502 0" />
        </svg>
        Renovación automática
      </span>
    </footer>
  </article>
</template>