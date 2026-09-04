<script setup lang="ts">
// ============================================================
// PAGE · PaymentListPage (Lista de pagos realizados)
// Consume GET /pays vía Pinia (usePayListStore). Incluye:
//   · Header breadcrumb amigable para orientar al usuario.
//   · Resumen de caja (total de pagos y monto acumulado).
//   · Tabla responsiva con filas alternas y fade-in (Transition).
//   · Estados de carga (LoadingView), error y vacío.
// ============================================================

import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { LoadingView } from '@/utils/loading'
import BaseModal from '@/utils/components/BaseModal.vue'
import { usePayListStore } from '../../application/stores/usePayListStore'
import { PaymentDomainService } from '../../domain/Pay'
import type { PayListRow } from '../../application/stores/usePayListStore'

const store = usePayListStore()
const { rows, isLoading, kind, feedback, totalItems, totalAmount } = storeToRefs(store)

// Fila cuyo detalle se muestra en el modal de visualización.
const selectedRow = ref<PayListRow | null>(null)

// Texto de búsqueda sobre la tabla de pagos.
const searchQuery = ref('')

const filteredPayments = computed<PayListRow[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) => {
    const member = row.memberName ?? row.memberDetail?.name_full ?? ''
    const plan = row.planName ?? row.planDetail?.name ?? ''
    const contextLabel = PaymentDomainService.contextLabel(row.context)
    return (
      member.toLowerCase().includes(query) ||
      plan.toLowerCase().includes(query) ||
      contextLabel.toLowerCase().includes(query) ||
      row.context.toLowerCase().includes(query)
    )
  })
})

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  enter: { opacity: 1, y: 0, transition: { duration: 600 } },
  animate: { opacity: 1, y: 0 },
}

const CONTEXT_BADGES: Record<string, string> = {
  MONTHLYFEE: 'bg-amber-100 text-amber-800 ring-amber-200/70',
  RENEWAL: 'bg-emerald-100 text-emerald-700 ring-emerald-200/70',
  SINGLE_CLASS: 'bg-sky-100 text-sky-700 ring-sky-200/70',
}

function contextBadgeClass(context: string): string {
  return CONTEXT_BADGES[context] ?? 'bg-stone-100 text-stone-600 ring-stone-200/70'
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(Number(value) || 0)
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || '—'
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function documentTypeLabel(type: string | null): string {
  const labels: Record<string, string> = {
    CC: 'Cédula de ciudadanía',
    TI: 'Tarjeta de identidad',
    TARJETA_EXTRANJERO: 'Tarjeta de extranjería',
  }
  return type ? labels[type] ?? type : '—'
}

function planTypeLabel(type: string | null): string {
  const labels: Record<string, string> = {
    BY_CLASS: 'Por clase',
    BY_PERIOD: 'Por período',
  }
  return type ? labels[type] ?? type : '—'
}

function planStatusLabel(isActive: boolean | null): string {
  if (isActive === null) return '—'
  return isActive ? 'Activo' : 'Inactivo'
}

function formatPlain(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(Number(value) || 0)
}

function openDetail(row: PayListRow): void {
  selectedRow.value = row
}

function closeDetail(): void {
  selectedRow.value = null
}

onMounted(() => {
  store.fetchPays()
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
        <div class="pointer-events-none absolute top-0 right-0 opacity-20" aria-hidden="true">
          <svg width="200" height="130" viewBox="0 0 200 130" fill="none">
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
            <span class="text-white">Pagos</span>
          </nav>
          <h1 class="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
            Historias que se sostienen
          </h1>
          <p class="mt-1 max-w-xl text-sm text-amber-50/80">
            Cada pago es un gesto de continuidad: alguien que elige quedarse y un plan que recuerda por qué vale la pena. Aquí vive el registro de cada decisión.
          </p>

          <div class="mt-4 flex flex-wrap gap-3">
            <div class="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 ring-1 ring-white/25 backdrop-blur-sm">
              <span class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100">Pagos realizados</span>
              <span class="font-mono text-lg font-black text-white">{{ totalItems }}</span>
            </div>
            <div class="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 ring-1 ring-white/25 backdrop-blur-sm">
              <span class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100">Monto acumulado</span>
              <span class="font-mono text-lg font-black text-white">{{ formatAmount(totalAmount) }}</span>
            </div>
          </div>
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
        <!-- Card header -->
        <div class="flex flex-col gap-1 border-b border-amber-100 px-5 py-4 sm:px-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="font-serif text-lg font-bold text-stone-800">Listado de pagos</h2>
              <p class="text-xs text-stone-500">El respaldo de cada membresía, contado uno a uno.</p>
            </div>
            <div class="relative sm:w-72">
              <svg
                class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                inputmode="search"
                placeholder="Buscar por miembro, plan o contexto…"
                aria-label="Buscar pagos"
                class="w-full rounded-lg border border-amber-200 bg-white py-2 pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              />
              <button
                v-if="searchQuery"
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                aria-label="Limpiar búsqueda"
                @click="searchQuery = ''"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- ═════════ Loading ═════════
             El overlay LoadingView cubre la página mientras carga. -->
        <div v-if="kind === 'loading' && isLoading" class="px-6 py-16" aria-hidden="true" />

        <!-- ═════════ Error ═════════ -->
        <div v-else-if="kind === 'error'" class="flex flex-col items-center gap-4 px-6 py-14 text-center">
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
            @click="store.fetchPays"
          >
            Intentar otra vez
          </button>
        </div>

        <!-- ═════════ Empty ═════════ -->
        <div v-else-if="kind === 'empty'" class="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <svg class="h-12 w-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p class="font-serif text-lg font-bold text-stone-700">{{ feedback?.title }}</p>
          <p class="max-w-md text-sm text-stone-500">{{ feedback?.description }}</p>
        </div>

        <!-- ═════════ Table ═════════ -->
        <div v-else class="overflow-x-auto" role="region" aria-label="Tabla de pagos realizados">
          <table class="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr class="border-b border-amber-100 bg-amber-50/60">
                <th scope="col" class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-600 sm:px-6">Miembro</th>
                <th scope="col" class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-600 sm:px-6">Membresía</th>
                <th scope="col" class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-600 sm:px-6">Monto</th>
                <th scope="col" class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-600 sm:px-6">Fecha de pago</th>
                <th scope="col" class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-600 sm:px-6">Contexto</th>
                <th scope="col" class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-600 sm:px-6">Acciones</th>
              </tr>
            </thead>
            <TransitionGroup
              name="fade"
              tag="tbody"
              appear
            >
              <tr
                v-for="payment in filteredPayments"
                :key="payment.id"
                class="border-b border-amber-50 transition-colors last:border-0 hover:bg-amber-50/50 odd:bg-[#FFFDF8] even:bg-[#FFF8EE]"
              >
                <td class="px-5 py-4 sm:px-6">
                  <template v-if="payment.memberName">
                    <p class="font-semibold text-stone-800">{{ payment.memberName }}</p>
                  </template>
                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200/70"
                    :title="`Su detalle no se pudo obtener`"
                  >
                    <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    Nombre no disponible
                  </span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <template v-if="payment.planName">
                    <p class="text-sm font-medium text-stone-700">{{ payment.planName }}</p>
                  </template>
                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200/70"
                    :title="`Su detalle no se pudo obtener`"
                  >
                    <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    Plan no disponible
                  </span>
                </td>
                <td class="px-5 py-4 text-sm font-semibold text-stone-800 sm:px-6">
                  {{ formatAmount(payment.amount) }}
                </td>
                <td class="px-5 py-4 text-sm text-stone-600 sm:px-6">
                  {{ formatDate(payment.date_pay) }}
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1"
                    :class="contextBadgeClass(payment.context)"
                  >
                    {{ PaymentDomainService.contextLabel(payment.context) }}
                  </span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm transition-colors hover:bg-amber-100 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
                    :aria-label="`Visualizar detalle del pago`"
                    @click="openDetail(payment)"
                  >
                    <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Visualizar detalle
                  </button>
                </td>
              </tr>
              <tr v-if="filteredPayments.length === 0 && rows.length > 0" key="no-results">
                <td colspan="6" class="px-6 py-10 text-center">
                  <svg class="mx-auto mb-2 h-8 w-8 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  <p class="text-sm font-medium text-stone-600">No hay pagos que coincidan con tu búsqueda.</p>
                  <p class="mt-1 text-xs text-stone-400">Prueba con el nombre del miembro, el plan o el contexto.</p>
                </td>
              </tr>
            </TransitionGroup>
          </table>
        </div>

        <!-- Card footer: count -->
        <div v-if="kind === 'ok'" class="border-t border-amber-100 px-5 py-3 text-xs text-stone-500 sm:px-6">
          Mostrando {{ totalItems }} pago{{ totalItems !== 1 ? 's' : '' }} — un total de {{ formatAmount(totalAmount) }}
        </div>
      </section>
    </div>

    <!-- Overlay de carga mientras llega la respuesta del servidor -->
    <LoadingView
      :is-loading="isLoading && kind === 'loading'"
      title="Ordenando tu historia de pagos"
      description="Estamos buscando cada registro para que nada se pierda en el camino. Un segundo, por favor."
    />

    <!-- Modal de detalle del pago seleccionado -->
    <BaseModal
      :is-open="selectedRow !== null"
      max-with-class="max-w-lg"
      :expandable="false"
      close-label="Cerrar"
      @close="closeDetail"
    >
      <template #header>
        <h3 class="text-2xl sm:text-3xl font-bold text-white tracking-wide">
          Detalle del pago
        </h3>
      </template>
      <template #content>
        <div v-if="selectedRow" class="space-y-4">
          <!-- Resumen del pago -->
          <div class="rounded-xl bg-amber-50/70 p-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1"
                :class="contextBadgeClass(selectedRow.context)"
              >
                {{ PaymentDomainService.contextLabel(selectedRow.context) }}
              </span>
              <span class="text-sm font-semibold text-stone-800">{{ formatAmount(selectedRow.amount) }}</span>
            </div>
            <p class="mt-2 text-xs text-stone-500">Pagado el {{ formatDate(selectedRow.date_pay) }}</p>
          </div>

          <!-- Cascada · Información del miembro -->
          <section v-if="selectedRow.memberDetail" class="overflow-hidden rounded-xl ring-1 ring-amber-100">
            <header class="flex items-center gap-2 bg-amber-600 px-4 py-3 text-sm font-semibold text-white">
              <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0116.5 0V21a.75.75 0 01-.75.75H5.25A.75.75 0 014.5 21v-.75z" />
              </svg>
              Información del miembro
            </header>
            <dl class="divide-y divide-amber-100 bg-white text-sm">
              <div class="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt class="text-xs font-medium text-stone-500">Nombre completo</dt>
                <dd class="text-right font-medium text-stone-800">{{ selectedRow.memberDetail.name_full ?? '—' }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt class="text-xs font-medium text-stone-500">Tipo de documento</dt>
                <dd class="text-right font-medium text-stone-800">{{ documentTypeLabel(selectedRow.memberDetail.type_document) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt class="text-xs font-medium text-stone-500">Número de documento</dt>
                <dd class="text-right font-medium text-stone-800">{{ selectedRow.memberDetail.number_document ?? '—' }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt class="text-xs font-medium text-stone-500">Teléfono</dt>
                <dd class="text-right font-medium text-stone-800">{{ selectedRow.memberDetail.phone_number ?? '—' }}</dd>
              </div>
            </dl>
          </section>
          <div v-else class="rounded-xl bg-amber-50/70 p-4 text-sm text-amber-700">
            La información del miembro no está disponible en este momento.
          </div>

          <!-- Cascada · Información de la membresía -->
          <section v-if="selectedRow.planDetail" class="overflow-hidden rounded-xl ring-1 ring-amber-100">
            <header class="flex items-center gap-2 bg-stone-700 px-4 py-3 text-sm font-semibold text-white">
              <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Información de la membresía
            </header>
            <dl class="divide-y divide-amber-100 bg-white text-sm">
              <div class="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt class="text-xs font-medium text-stone-500">Plan</dt>
                <dd class="text-right font-medium text-stone-800">{{ selectedRow.planDetail.name ?? '—' }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt class="text-xs font-medium text-stone-500">Tipo</dt>
                <dd class="text-right font-medium text-stone-800">{{ planTypeLabel(selectedRow.planDetail.type) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt class="text-xs font-medium text-stone-500">Duración</dt>
                <dd class="text-right font-medium text-stone-800">
                  {{ selectedRow.planDetail.duration_days ? `${selectedRow.planDetail.duration_days} días` : '—' }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt class="text-xs font-medium text-stone-500">Precio</dt>
                <dd class="text-right font-semibold text-stone-800">{{ formatPlain(selectedRow.planDetail.price) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt class="text-xs font-medium text-stone-500">Precio por clase</dt>
                <dd class="text-right font-medium text-stone-800">{{ formatPlain(selectedRow.planDetail.price_per_class) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt class="text-xs font-medium text-stone-500">Clases incluidas</dt>
                <dd class="text-right font-medium text-stone-800">{{ selectedRow.planDetail.classes_included ?? '—' }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt class="text-xs font-medium text-stone-500">Estado</dt>
                <dd class="text-right">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1"
                    :class="selectedRow.planDetail.is_active ? 'bg-emerald-100 text-emerald-700 ring-emerald-200/70' : 'bg-stone-100 text-stone-500 ring-stone-200/70'"
                  >
                    {{ planStatusLabel(selectedRow.planDetail.is_active) }}
                  </span>
                </dd>
              </div>
            </dl>
          </section>
          <div v-else class="rounded-xl bg-amber-50/70 p-4 text-sm text-amber-700">
            La información de la membresía no está disponible en este momento.
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.fade-enter-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.fade-leave-to {
  opacity: 0;
}
.fade-move {
  transition: transform 0.45s ease;
}
</style>
