<script setup lang="ts">
/**
 * MembershipListPage.vue
 *
 * Lista de membresías (planes) consumida desde el endpoint GET "/planes"
 * vía axios + Pinia. Incluye:
 *  - Header con estilo "breadcrumb" para orientar al usuario.
 *  - Card de contenido con tabla totalmente responsiva.
 *  - Buscador global en tiempo real.
 *  - Ordenamiento por las columnas "nombre" y "estado (activo)".
 */
import { computed, onMounted, ref } from 'vue'
import { useMembershipListStore } from '../../application/stores/useMembershipListStore'
import type { MembershipPlanPayload } from '../../domain/entities/Membership.types'
import MembershipDetailModal from '../components/organisms/MembershipDetailModal.vue'

const store = useMembershipListStore()

/* ────────────── UI state ────────────── */
const search = ref('')
type SortKey = 'name' | 'is_active'
const sortKey = ref<SortKey>('name')
const sortAsc = ref(true)

/* ────────────── Detail modal state ────────────── */
const detailOpen = ref(false)
const selectedPlan = ref<MembershipPlanPayload | null>(null)

function openDetail(plan: MembershipPlanPayload): void {
  selectedPlan.value = plan
  detailOpen.value = true
}

function closeDetail(): void {
  detailOpen.value = false
}

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  enter: { opacity: 1, y: 0, transition: { duration: 600 } },
  animate: { opacity: 1, y: 0 },
}

/* ────────────── Sorting + search ────────────── */
function toggleSort(key: SortKey): void {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

function sortArrow(key: SortKey): string {
  if (sortKey.value !== key) return '↕'
  return sortAsc.value ? '↑' : '↓'
}

const visiblePlans = computed<MembershipPlanPayload[]>(() => {
  const term = search.value.trim().toLowerCase()

  const filtered = term
    ? store.plans.filter((plan) => plan.name.toLowerCase().includes(term))
    : [...store.plans]

  return filtered.sort((a, b) => {
    const direction = sortAsc.value ? 1 : -1

    if (sortKey.value === 'is_active') {
      return (Number(b.is_active) - Number(a.is_active)) * direction
    }

    return a.name.localeCompare(b.name) * direction
  })
})

/* ────────────── Format helpers ────────────── */
const TYPE_LABELS: Record<string, string> = {
  BY_PERIOD: 'Por periodo',
  BY_CLASS: 'Por clase',
}

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type ?? '—'
}

function durationLabel(days: number | null): string {
  if (!days) return '—'
  if (days === 1) return '1 día'
  return `${days} días`
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function classesLabel(included: number): string {
  return included > 0 ? `${included} clase${included !== 1 ? 's' : ''}` : 'Sin tope'
}

/* ────────────── Lifecycle ────────────── */
onMounted(() => {
  store.fetchPlans()
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
            <span class="text-white">Membresías</span>
          </nav>
          <h1 class="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
            Tus membresías
          </h1>
          <p class="mt-1 max-w-xl text-sm text-amber-50/80">
            Aquí viven los planes que dan forma a la permanencia de tu salón. Revisa cada uno con calma: son la forma en que alguien decide quedarse.
          </p>
        </div>
      </header>

      <!-- ═════════════ Card + table ═════════════ -->
      <section
        v-motion
        :initial="fadeUp.initial"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 120 } }"
        :animate="fadeUp.animate"
        class="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm"
      >
        <!-- Card header: title + search -->
        <div class="flex flex-col gap-4 border-b border-amber-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 class="font-serif text-lg font-bold text-stone-800">Listado de membresías</h2>
            <p class="text-xs text-stone-500">Escribe para filtrar o toca una columna para ordenar.</p>
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
              aria-label="Buscar membresía por nombre"
              placeholder="Buscar por nombre…"
              class="w-full rounded-lg border border-amber-200 bg-[#FFFBF5] py-2 pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>

        <!-- ═════════ Loading ═════════ -->
        <div v-if="store.isLoading" class="flex flex-col items-center justify-center gap-3 px-6 py-16">
          <div class="h-8 w-8 rounded-full border-2 border-amber-200 border-t-amber-600 animate-spin" aria-hidden="true" />
          <p class="text-sm text-stone-500">Estamos trayendo tus membresías…</p>
        </div>

        <!-- ═════════ Error ═════════ -->
        <div v-else-if="store.kind === 'error'" class="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 ring-1 ring-rose-200">
            <svg class="h-7 w-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-serif text-xl font-bold text-stone-800">{{ store.feedback?.title }}</h3>
            <p class="mx-auto mt-2 max-w-md text-sm text-stone-500">{{ store.feedback?.description }}</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
            @click="store.fetchPlans"
          >
            Intentar otra vez
          </button>
        </div>

        <!-- ═════════ Empty ═════════ -->
        <div v-else-if="store.plans.length === 0" class="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <svg class="h-12 w-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="font-serif text-lg font-bold text-stone-700">{{ store.feedback?.title }}</p>
          <p class="max-w-md text-sm text-stone-500">{{ store.feedback?.description }}</p>
        </div>

        <!-- ═════════ No results (search without match) ═════════ -->
        <div v-else-if="visiblePlans.length === 0" class="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <p class="font-serif text-lg font-bold text-stone-700">No encontramos coincidencias</p>
          <p class="max-w-md text-sm text-stone-500">
            Ninguna membresía coincide con "{{ search }}". Prueba con otro nombre, o borra la búsqueda para volver a ver todas.
          </p>
          <button
            type="button"
            class="inline-flex items-center rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
            @click="search = ''"
          >
            Limpiar búsqueda
          </button>
        </div>

        <!-- ═════════ Table ═════════ -->
        <div v-else class="overflow-x-auto" role="region" aria-label="Tabla de membresías">
          <table class="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr class="border-b border-amber-100 bg-amber-50/60">
                <th scope="col" class="px-5 py-3 sm:px-6">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-stone-600 transition-colors hover:text-amber-700"
                    @click="toggleSort('name')"
                  >
                    Nombre <span class="text-amber-500">{{ sortArrow('name') }}</span>
                  </button>
                </th>
                <th scope="col" class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-600 sm:px-6">Tipo</th>
                <th scope="col" class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-600 sm:px-6">Duración</th>
                <th scope="col" class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-600 sm:px-6">Clases</th>
                <th scope="col" class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-600 sm:px-6">Precio</th>
                <th scope="col" class="px-5 py-3 sm:px-6">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-stone-600 transition-colors hover:text-amber-700"
                    @click="toggleSort('is_active')"
                  >
                    Estado <span class="text-amber-500">{{ sortArrow('is_active') }}</span>
                  </button>
                </th>
                <th scope="col" class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-600 sm:px-6">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(plan, index) in visiblePlans"
                :key="plan.name + index"
                class="border-b border-amber-50 transition-colors last:border-0 hover:bg-amber-50/50"
              >
                <td class="px-5 py-4 sm:px-6">
                  <p class="font-semibold text-stone-800">{{ plan.name }}</p>
                  <p class="mt-0.5 text-xs text-stone-400">{{ typeLabel(plan.type) }}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span class="inline-flex items-center rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                    {{ typeLabel(plan.type) }}
                  </span>
                </td>
                <td class="px-5 py-4 text-sm text-stone-600 sm:px-6">
                  {{ durationLabel(plan.duration_days) }}
                </td>
                <td class="px-5 py-4 text-sm text-stone-600 sm:px-6">
                  {{ classesLabel(plan.classes_included) }}
                </td>
                <td class="px-5 py-4 text-sm font-semibold text-stone-800 sm:px-6">
                  {{ formatPrice(plan.price) }}
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    :class="plan.is_active
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-stone-100 text-stone-500'"
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :class="plan.is_active ? 'bg-emerald-500' : 'bg-stone-400'"
                      aria-hidden="true"
                    />
                    {{ plan.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
                      @click="openDetail(plan)"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver detalle
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100"
                      title="Editar membresía"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Card footer: count -->
        <div v-if="store.kind === 'ok'" class="border-t border-amber-100 px-5 py-3 text-xs text-stone-500 sm:px-6">
          Mostrando {{ visiblePlans.length }} de {{ store.plans.length }} membresía{{ store.plans.length !== 1 ? 's' : '' }}
        </div>
      </section>
    </div>

    <!-- ═════════ Detail modal ═════════ -->
    <MembershipDetailModal
      :is-open="detailOpen"
      :membership="selectedPlan"
      @close="closeDetail"
    >
      <template #footer>
        <button
          type="button"
          class="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 sm:w-auto"
          @click="closeDetail"
        >
          Cerrar
        </button>
      </template>
    </MembershipDetailModal>
  </div>
</template>
