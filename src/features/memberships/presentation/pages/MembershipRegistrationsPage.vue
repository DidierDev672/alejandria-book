<script setup lang="ts">
/**
 * MembershipRegistrationsPage.vue
 *
 * Lista de membresías registradas consumida desde el endpoint GET "/memberships"
 * vía axios + Pinia. Incluye:
 *  - Header estilo "breadcrumb" para orientar al usuario.
 *  - Grilla de tarjetas con fade-in escalonado mediante v-motion.
 *  - Estados de carga, vacío y error (con mensaje amigable al fallar con HTTP 400).
 */
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import LoadingView from '@/utils/loading/presentation/components/LoadingView.vue'
import { useMembershipRegistrationsStore } from '../../application/stores/useMembershipRegistrationsStore'
import MembershipRegistrationCard from '../components/molecules/MembershipRegistrationCard.vue'

const store = useMembershipRegistrationsStore()
const { registrations, isLoading, kind, feedback } = storeToRefs(store)

const search = ref('')

interface ResolvedNames {
  memberName: string | null
  planName: string | null
}

const resolvedNames = ref<Record<string, ResolvedNames>>({})

function onResolved(payload: { id: string; memberName: string | null; planName: string | null }): void {
  resolvedNames.value[payload.id] = {
    memberName: payload.memberName,
    planName: payload.planName,
  }
}

const visibleRegistrations = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return registrations.value
  return registrations.value.filter((registration) => {
    const names = resolvedNames.value[registration.id]
    if (!names) return false
    return (
      names.memberName?.toLowerCase().includes(term) ||
      names.planName?.toLowerCase().includes(term)
    )
  })
})

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  enter: { opacity: 1, y: 0, transition: { duration: 600 } },
  animate: { opacity: 1, y: 0 },
}

const sectionEnter = {
  opacity: 1,
  y: 0,
  transition: { duration: 600, delay: 120 },
}

onMounted(() => {
  store.fetchRegistrations()
})
</script>

<template>
  <div class="min-h-screen bg-[#FFFBF5] px-6 py-8">
    <LoadingView
      :is-loading="isLoading"
      title="Trayendo tus membresías registradas"
      description="Mientras tanto, tus membresías viajan con calma desde el salón. Respira: nada se pierde en el camino."
    />
    <div class="pointer-events-none fixed top-0 right-0 -z-10 opacity-10">
      <svg width="360" height="260" viewBox="0 0 360 260" fill="none" aria-hidden="true">
        <circle cx="320" cy="-20" r="160" fill="#f59e0b" />
        <circle cx="270" cy="55" r="80" fill="#ea580c" />
      </svg>
    </div>

    <div class="mx-auto max-w-6xl space-y-6">
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
          <nav aria-label="Ruta de navegación" class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/90">
            <span>Coliseo</span>
            <span aria-hidden="true">›</span>
            <span>Membresías</span>
            <span aria-hidden="true">›</span>
            <span class="text-white">Registradas</span>
          </nav>
          <h1 class="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
            Membresías registradas
          </h1>
          <p class="mt-1 max-w-xl text-sm text-amber-50/80">
            Aquí vive el compromiso que cada miembro eligió. Míralas con calma: cada tarjeta cuenta la historia de una permanencia en tu salón.
          </p>
        </div>
      </header>

      <!-- ═════════════ Card de contenido ═════════════ -->
      <section
        v-motion
        :initial="fadeUp.initial"
        :enter="sectionEnter"
        :animate="fadeUp.animate"
        class="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm"
      >
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-amber-100 px-5 py-4 sm:px-6">
          <div>
            <h2 class="font-serif text-lg font-bold text-stone-800">Listado de membresías</h2>
            <p class="text-xs text-stone-500">Cada tarjeta representa una membresía registrada.</p>
          </div>

          <div class="relative w-full sm:w-72">
            <svg
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
            <input
              v-model="search"
              type="search"
              role="searchbox"
              aria-label="Buscar membresía registrada"
              placeholder="Buscar por miembro o plan…"
              class="w-full rounded-lg border border-amber-200 bg-[#FFFBF5] py-2 pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <span
            v-if="kind === 'ok'"
            class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            {{ registrations.length }} membresía{{ registrations.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <!-- ═════════ Error ═════════ -->
        <div v-if="kind === 'error'" class="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 ring-1 ring-rose-200">
            <svg class="h-7 w-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-serif text-xl font-bold text-stone-800">{{ feedback?.title }}</h3>
            <p class="mx-auto mt-2 max-w-md text-sm text-stone-500">{{ feedback?.description }}</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
            @click="store.fetchRegistrations"
          >
            Intentar otra vez
          </button>
        </div>

        <!-- ═════════ Empty ═════════ -->
        <div v-else-if="registrations.length === 0" class="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <svg class="h-12 w-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          <p class="font-serif text-lg font-bold text-stone-700">{{ feedback?.title }}</p>
          <p class="max-w-md text-sm text-stone-500">{{ feedback?.description }}</p>
        </div>

        <!-- ═════════ No results (search without match) ═════════ -->
        <div v-else-if="visibleRegistrations.length === 0" class="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <p class="font-serif text-lg font-bold text-stone-700">No encontramos coincidencias</p>
          <p class="max-w-md text-sm text-stone-500">
            Ninguna membresía registrada coincide con "{{ search }}". Prueba con otro nombre de miembro o de plan, o borra la búsqueda para volver a ver todas.
          </p>
          <button
            type="button"
            class="inline-flex items-center rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
            @click="search = ''"
          >
            Limpiar búsqueda
          </button>
        </div>

        <!-- ═════════ Grid de tarjetas ═════════ -->
        <div v-else class="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-6 xl:grid-cols-3">
          <MembershipRegistrationCard
            v-for="(membership, index) in visibleRegistrations"
            :key="membership.id"
            :registration="membership"
            :enter-delay="index * 80"
            @resolved="onResolved"
          />
        </div>

        <!-- Card footer: count -->
        <div v-if="kind === 'ok'" class="border-t border-amber-100 px-5 py-3 text-xs text-stone-500 sm:px-6">
          Mostrando {{ visibleRegistrations.length }} de {{ registrations.length }} membresía{{ registrations.length !== 1 ? 's' : '' }} registrada{{ registrations.length !== 1 ? 's' : '' }}
        </div>
      </section>
    </div>
  </div>
</template>