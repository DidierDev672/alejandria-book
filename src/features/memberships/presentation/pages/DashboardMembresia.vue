<script setup lang="ts">
// ============================================================
// PAGE · DashboardMembresia
// Panel de Membresías del Coliseo:
//  · Header psicológico con breadcrumb (dónde estás).
//  · Grid de 4 tarjetas-resumen con conteos reales vía:
//      /planes · /memberships · /attendance · /pays
//  · Tabla de asistencias recientes alimentada por:
//      /attendance + /members/{id} + /memberships/{id} + /planes/{id}
// ============================================================

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import type { DashboardCounts } from '../../domain/entities/DashboardMetric.types'
import { HttpMembershipRepository } from '../../infrastructure/http/HttpMembershipRepository'
import { useDashboardStore } from '../../application/stores/useDashboardStore'

const dashboardStore = useDashboardStore()
const { counts, isLoading, kind, feedback } = storeToRefs(dashboardStore)
const router = useRouter()

function goTo(routeName: string) {
  router.push({ name: routeName })
}

type DashboardCountKey = keyof DashboardCounts

function formatDate(value: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  enter: { opacity: 1, y: 0, transition: { duration: 600 } },
  animate: { opacity: 1, y: 0 },
}

onMounted(() => {
  dashboardStore.fetchCounts()
  void loadAttendance()
})

onUnmounted(() => {
  dashboardStore.$reset()
})

const fadeUpDelayed = (delay: number) => ({
  initial: { opacity: 0, y: 40 },
  enter: { opacity: 1, y: 0, transition: { duration: 600, delay } },
  animate: { opacity: 1, y: 0 },
})

interface MetricCard {
  key: string
  countKey: DashboardCountKey
  label: string
  caption: string
  icon: string
  accent: string
  iconText: string
  chip: string
  shadow: string
  decoHex: string
  cardHex: string
  isDark: boolean
  labelCls: string
  valueCls: string
  captionCls: string
  borderCls: string
  actions: { label: string; routeName: string }[]
}

const metrics: MetricCard[] = [
  {
    key: 'planes',
    countKey: 'planes',
    label: 'Planes',
    caption: 'Opciones que sostienen el coliseo',
    icon: 'planes',
    accent: 'bg-[#EA6113]',
    iconText: 'text-white',
    chip: 'bg-[#EA6113]/10 text-[#EA6113] ring-[#EA6113]/20',
    shadow: 'shadow-[#EA6113]/30',
    decoHex: '#EA6113',
    cardHex: '#F26616',
    isDark: false,
    labelCls: 'text-white/80',
    valueCls: 'text-white',
    captionCls: 'text-white/70',
    borderCls: 'border-white/25',
    actions: [
      { label: 'Agregar', routeName: 'membership-create' },
      { label: 'Lista', routeName: 'membership-list' },
    ],
  },
  {
    key: 'membresias',
    countKey: 'memberships',
    label: 'Membresías',
    caption: 'Vínculos activos de cada miembro',
    icon: 'membresias',
    accent: 'bg-[#F88F22]',
    iconText: 'text-white',
    chip: 'bg-[#F88F22]/10 text-[#F88F22] ring-[#F88F22]/20',
    shadow: 'shadow-[#F88F22]/30',
    decoHex: '#F88F22',
    cardHex: '#A62F03',
    isDark: true,
    labelCls: 'text-white/80',
    valueCls: 'text-white',
    captionCls: 'text-white/70',
    borderCls: 'border-white/25',
    actions: [
      { label: 'Agregar', routeName: 'membership-enroll' },
      { label: 'Lista', routeName: 'membership-registrations' },
    ],
  },
  {
    key: 'asistencias',
    countKey: 'assistance',
    label: 'Asistencias',
    caption: 'Presencias que cuentan una historia',
    icon: 'asistencias',
    accent: 'bg-[#FBB931]',
    iconText: 'text-white',
    chip: 'bg-[#FBB931]/10 text-[#B98314] ring-[#FBB931]/30',
    shadow: 'shadow-[#FBB931]/30',
    decoHex: '#FBB931',
    cardHex: '#0D0D0D',
    isDark: true,
    labelCls: 'text-white/80',
    valueCls: 'text-white',
    captionCls: 'text-white/70',
    borderCls: 'border-white/25',
    actions: [
      { label: 'Agregar', routeName: 'assistance-register' },
    ],
  },
  {
    key: 'pagos',
    countKey: 'payments',
    label: 'Pagos',
    caption: 'Esfuerzos registrados de los miembros',
    icon: 'pagos',
    accent: 'bg-[#FFE3B3]',
    iconText: 'text-[#EA6113]',
    chip: 'bg-[#FFE3B3]/40 text-[#EA6113] ring-[#FFE3B3]',
    shadow: 'shadow-[#FBB931]/30',
    decoHex: '#FFE3B3',
    cardHex: '#FFE3B3',
    isDark: false,
    labelCls: 'text-stone-500',
    valueCls: 'text-stone-800',
    captionCls: 'text-stone-500',
    borderCls: 'border-amber-500/20',
    actions: [
      { label: 'Agregar', routeName: 'payment-register' },
      { label: 'Lista', routeName: 'payment-list' },
    ],
  },
]

interface AttendanceRow {
  member: string
  membership: string
  date: string
  memberLoading: boolean
  membershipLoading: boolean
}

const membershipRepository = new HttpMembershipRepository()

const attendanceRows = ref<AttendanceRow[]>([])

const attendanceSearch = ref('')

const filteredAttendanceRows = computed(() => {
  const term = attendanceSearch.value.trim().toLowerCase()
  if (!term) return attendanceRows.value
  return attendanceRows.value.filter((row) => {
    const member = row.member.toLowerCase()
    const membership = row.membership.toLowerCase()
    const date = formatDate(row.date).toLowerCase()
    return member.includes(term) || membership.includes(term) || date.includes(term)
  })
})

async function loadAttendance(): Promise<void> {
  try {
    const records = await membershipRepository.listAttendance()
    attendanceRows.value = records.map((record) => ({
      member: '',
      membership: '',
      date: record.date,
      memberLoading: true,
      membershipLoading: true,
    }))

    await Promise.all(
      records.map(async (record, index) => {
        const row = attendanceRows.value[index]

        const [memberResult, membershipResult] = await Promise.allSettled([
          membershipRepository.findMemberById(record.member_id),
          membershipRepository.findMembershipById(record.membership_id),
        ])

        if (memberResult.status === 'fulfilled') {
          row.member = memberResult.value.name_full
        }
        row.memberLoading = false

        if (membershipResult.status === 'fulfilled') {
          const planResult = await membershipRepository.findPlanById(membershipResult.value.plan_id)
          if (planResult?.name) {
            row.membership = planResult.name
          }
        }
        row.membershipLoading = false
      }),
    )
  } catch {
    attendanceRows.value = []
  }
}
</script>

<template>
  <div
    class="min-h-screen px-6 py-8"
    style="background:
      radial-gradient(120% 90% at 15% 0%, rgba(242, 102, 22, 0.06), transparent 55%),
      radial-gradient(100% 80% at 100% 15%, rgba(89, 18, 2, 0.05), transparent 60%),
      #FBF6EC;"
  >
    <div class="mx-auto max-w-6xl space-y-6">
      <!-- ═════════════ Header / breadcrumb psicológico ═════════════ -->
      <header
        v-motion
        :initial="fadeUp.initial"
        :enter="fadeUp.enter"
        :animate="fadeUp.animate"
class="rounded-3xl border border-[#591202]/50 bg-gradient-to-r from-[#F26616] via-[#A62F03] to-[#0D0D0D] p-6 sm:p-8 shadow-2xl"
      >
        <nav aria-label="Ruta de navegación" class="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#FFE3B3]">
          <span class="transition-colors hover:text-white">Coliseo</span>
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span class="transition-colors hover:text-white">Membresías</span>
        </nav>

        <div class="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="font-serif text-2xl font-black tracking-tight text-white sm:text-4xl">
              El pulso de tu coliseo
            </h1>
            <p class="mt-2 max-w-2xl text-sm leading-relaxed text-[#FFE3B3]/90">
              Aquí vive el vínculo que sostiene a cada miembro: sus planes, sus membresías, sus presencias y sus pagos.
              Todo cuenta, todo se celebra.
            </p>
          </div>
          <span
            class="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-[#0D0D0D]/30 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm"
          >
            <svg v-if="isLoading" class="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span v-else class="h-1.5 w-1.5 rounded-full" :class="kind === 'error' ? 'bg-rose-400' : 'bg-emerald-400'"></span>
            {{ kind === 'error' ? 'Sin conectividad' : (isLoading ? 'Actualizando…' : 'Conteos al día') }}
          </span>
        </div>
      </header>

      <!-- ═════════════ Grid de tarjetas-resumen ═════════════ -->
      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="(metric, i) in metrics"
          :key="metric.key"
          v-motion
          :initial="fadeUpDelayed(i * 90).initial"
          :enter="fadeUpDelayed(i * 90).enter"
          :animate="fadeUpDelayed(i * 90).animate"
          class="group relative overflow-hidden rounded-3xl border p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1"
          :class="metric.borderCls"
          :style="{ backgroundColor: metric.cardHex }"
        >
          <div class="pointer-events-none absolute right-0 top-0 opacity-10" aria-hidden="true">
            <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
              <circle cx="105" cy="-5" r="55" :fill="metric.decoHex" />
              <circle cx="85" cy="20" r="28" :fill="metric.decoHex" />
            </svg>
          </div>

          <div class="flex items-start justify-between">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110"
              :class="[metric.accent, metric.shadow]"
            >
              <svg class="h-5 w-5" :class="metric.iconText" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path
                  v-if="metric.icon === 'planes'"
                  stroke-linecap="round" stroke-linejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
                <path
                  v-else-if="metric.icon === 'membresias'"
                  stroke-linecap="round" stroke-linejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
                <path
                  v-else-if="metric.icon === 'asistencias'"
                  stroke-linecap="round" stroke-linejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  v-else
                  stroke-linecap="round" stroke-linejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
            </div>
            <div class="flex flex-col items-end gap-1.5">
              <button
                v-for="action in metric.actions"
                :key="action.label"
                type="button"
                class="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors"
                :class="
                  metric.isDark
                    ? 'bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25'
                    : 'bg-[#0D0D0D]/10 text-[#0D0D0D] ring-1 ring-[#0D0D0D]/20 hover:bg-[#0D0D0D]/20'
                "
                @click="goTo(action.routeName)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>

          <p class="mt-6 font-serif text-xs font-bold uppercase tracking-[0.16em]" :class="metric.labelCls">{{ metric.label }}</p>
          <p class="mt-1 text-4xl font-black tracking-tight" :class="metric.valueCls">
            {{ counts[metric.countKey].toLocaleString('es-CO') }}
          </p>
          <p class="mt-2 text-xs" :class="metric.captionCls">{{ metric.caption }}</p>
        </div>
      </section>

      <!-- Aviso de error / sin conectividad -->
      <section
        v-if="kind === 'error'"
        class="flex flex-col gap-3 rounded-3xl border border-rose-300/40 bg-rose-50/40 p-5 shadow-xl"
      >
        <div class="flex items-center gap-3">
          <svg class="h-5 w-5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8.78l-3.7 2.6-.37 4.28a4.07 4.07 0 003.62-3.66A3.5 3.5 0 00-2.88-2.82M12 15.22l3.7-2.6.37-4.28a4.07 4.07 0 00-3.62 3.66A3.5 3.5 0 002.88 2.82" />
          </svg>
          <div>
            <h2 class="text-sm font-bold text-rose-600">{{ feedback?.title ?? 'No pudimos cargar los conteos' }}</h2>
            <p class="mt-0.5 text-xs text-stone-500">{{ feedback?.description ?? '' }}</p>
          </div>
        </div>
        <button
          type="button"
          class="w-fit rounded-xl border border-rose-300/50 bg-white/80 px-4 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50"
          @click="dashboardStore.fetchCounts()"
        >
          Reintentar
        </button>
      </section>

      <!-- ═════════════ Tabla de asistencias ═════════════ -->
      <section
        v-motion
        :initial="fadeUpDelayed(360).initial"
        :enter="fadeUpDelayed(360).enter"
        :animate="fadeUpDelayed(360).animate"
        class="relative overflow-hidden rounded-3xl border border-[#591202]/50 p-6 shadow-2xl"
        style="background: linear-gradient(to right, #F26616 0%, #A62F03 50%, #0D0D0D 100%)"
      >
        <div class="pointer-events-none absolute right-0 top-0 opacity-10" aria-hidden="true">
          <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
            <circle cx="160" cy="-10" r="80" fill="#f59e0b" />
            <circle cx="140" cy="20" r="40" fill="#ea580c" />
          </svg>
        </div>

        <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D0D0D] shadow-lg shadow-[#0D0D0D]/40"
            >
              <svg class="h-4 w-4 text-[#FFE3B3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="font-serif text-base font-bold text-white">Asistencias recientes</h2>
              <p class="text-xs text-white/70">Cada presencia cuenta una historia</p>
            </div>
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
              v-model="attendanceSearch"
              type="search"
              role="searchbox"
              aria-label="Buscar asistencia"
              placeholder="Buscar por miembro, plan o fecha…"
              class="w-full rounded-xl border border-amber-200 bg-[#FFFBF5] py-2 pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-white/30 text-xs font-bold uppercase tracking-widest text-white/90">
                <th class="pb-3 pr-4">Miembro</th>
                <th class="pb-3 pr-4">Membresía</th>
                <th class="pb-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in filteredAttendanceRows"
                :key="index"
                class="group border-b border-white/20 transition-colors duration-150 hover:bg-white/10"
              >
                <td class="py-3.5 pr-4">
                  <span v-if="row.memberLoading" class="inline-flex h-4 w-28 animate-pulse rounded bg-white/40" aria-hidden="true" />
                  <span v-else class="font-medium text-white transition-colors group-hover:text-[#FFE3B3]">{{ row.member || 'Miembro no disponible' }}</span>
                </td>
                <td class="py-3.5 pr-4">
                  <span
                    v-if="row.membershipLoading"
                    class="inline-flex h-4 w-24 animate-pulse rounded bg-white/40"
                    aria-hidden="true"
                  />
                  <span
                    v-else
                    class="rounded-md border border-white/30 bg-white/10 px-2 py-0.5 text-xs font-medium text-[#FFE3B3]"
                  >
                    {{ row.membership || 'Plan no disponible' }}
                  </span>
                </td>
                <td class="py-3.5 font-mono text-xs text-white/70">{{ formatDate(row.date) }}</td>
              </tr>
              <tr v-if="attendanceRows.length === 0">
                <td colspan="3" class="py-8 text-center text-sm text-white/70">
                  Aún no hay asistencias registradas.
                </td>
              </tr>
              <tr v-else-if="filteredAttendanceRows.length === 0">
                <td colspan="3" class="py-8 text-center text-sm text-white/70">
                  No encontramos coincidencias para "{{ attendanceSearch }}".
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-5 flex justify-end border-t border-white/25 pt-4">
          <button
            class="flex items-center gap-1.5 text-xs font-bold text-white transition-colors hover:text-[#FFE3B3]"
          >
            Ver todas las asistencias
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
