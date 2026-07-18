<script setup lang="ts">
import axiosInstance from '@/infrastructure/http/axiosInstance'
import { onMounted, ref } from 'vue'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type Role = 'admin' | 'coach' | 'super_admin'

interface AssignRoleEntry {
  member_id: string | null
  user_id: string | null
  roles: Role[]
}

interface MemberData {
  id: string
  name_full: string
  type_document: string
  number_document: string
  phone_number: string
}

interface UserData {
  id: string
  name: string
  email: string
  phone?: string
}

interface EnrichedAssignment extends AssignRoleEntry {
  member?: MemberData
  user?: UserData
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const assignments = ref<EnrichedAssignment[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  coach: 'Coach',
  super_admin: 'Super Admin',
}

const roleColors: Record<Role, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  coach: 'bg-blue-100 text-blue-700 border-blue-200',
  super_admin: 'bg-amber-100 text-amber-700 border-amber-200',
}

const docTypeLabels: Record<string, string> = {
  CC: 'Cédula de Ciudadanía',
  TI: 'Tarjeta de Identidad',
  TARJETA_EXTRANJERO: 'Tarjeta Extranjería',
}

function getAvatarGradient(id: string): string {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
  ]
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

function getInitials(name: string): string {
  if (!name) return '??'
  const parts = name.trim().split(' ')
  if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// ═══════════════════════════════════════════════════════════════
// DATA FETCHING
// ═══════════════════════════════════════════════════════════════

async function fetchAssignments(): Promise<void> {
  isLoading.value = true
  error.value = null

  try {
    const { data } = await axiosInstance.get<AssignRoleEntry[]>('/asignar-roles/list')
    const entries: AssignRoleEntry[] = Array.isArray(data) ? data : []

    const enriched: EnrichedAssignment[] = await Promise.all(
      entries.map(async (entry) => {
        const result: EnrichedAssignment = { ...entry }

        if (entry.member_id) {
          try {
            const { data: memberData } = await axiosInstance.get<MemberData>(`/member/${entry.member_id}`)
            result.member = memberData
          } catch {
            console.warn(`[AssignedRolesList] No se pudo cargar miembro ${entry.member_id}`)
          }
        }

        if (entry.user_id) {
          try {
            const { data: userData } = await axiosInstance.get<UserData>(`/user/${entry.user_id}`)
            result.user = userData
          } catch {
            console.warn(`[AssignedRolesList] No se pudo cargar usuario ${entry.user_id}`)
          }
        }

        return result
      }),
    )

    assignments.value = enriched
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cargar las asignaciones de roles'
    console.error('[AssignedRolesList] Error:', err)
  } finally {
    isLoading.value = false
  }
}

// ═══════════════════════════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════════════════════════

onMounted(() => {
  fetchAssignments()
})
</script>

<template>
  <section class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-stone-100 p-4 sm:p-6 lg:p-8">

    <!-- Decoradores globales -->
    <div class="pointer-events-none fixed right-0 top-0 opacity-10 -z-10">
      <svg width="360" height="260" viewBox="0 0 360 260" fill="none">
        <circle cx="320" cy="-20" r="160" fill="#f59e0b" />
        <circle cx="270" cy="55" r="80" fill="#ea580c" />
      </svg>
    </div>
    <div class="pointer-events-none fixed bottom-0 left-0 opacity-5 -z-10">
      <svg width="240" height="200" viewBox="0 0 240 200" fill="none">
        <circle cx="0" cy="200" r="140" fill="#f59e0b" />
      </svg>
    </div>

    <div class="max-w-6xl mx-auto space-y-6">

      <!-- ── Header ── -->
      <header>
        <div
          class="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-white/80 backdrop-blur-sm px-6 py-6 sm:px-8 sm:py-7 shadow-xl shadow-amber-100/60">
          <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          <div class="pointer-events-none absolute right-0 top-0 opacity-10">
            <svg width="220" height="140" viewBox="0 0 220 140" fill="none">
              <circle cx="200" cy="-10" r="100" fill="#f59e0b" />
              <circle cx="160" cy="40" r="55" fill="#ea580c" />
            </svg>
          </div>
          <div class="relative flex items-center gap-4">
            <div
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
              <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 class="font-serif text-2xl sm:text-3xl font-bold text-stone-800">Roles Asignados</h1>
              <p class="text-sm text-stone-400 mt-0.5">Listado de asignaciones de roles a usuarios y miembros</p>
            </div>
          </div>
        </div>
      </header>

      <!-- ── Loading ── -->
      <div v-if="isLoading"
        class="flex items-center justify-center py-16 rounded-3xl border border-amber-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
        <div class="w-8 h-8 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
        <span class="ml-3 text-sm text-stone-400">Cargando asignaciones…</span>
      </div>

      <!-- ── Error ── -->
      <div v-else-if="error"
        class="relative overflow-hidden rounded-2xl border border-rose-200 bg-rose-50/80 px-6 py-5 shadow-lg shadow-rose-100/60">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/60 to-transparent" />
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-rose-800">Error al cargar</p>
            <p class="text-xs text-rose-600 mt-0.5">{{ error }}</p>
          </div>
          <button @click="fetchAssignments"
            class="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-rose-600 bg-rose-100 border border-rose-200 hover:bg-rose-200 transition-all duration-200 active:scale-95">
            Reintentar
          </button>
        </div>
      </div>

      <!-- ── Empty State ── -->
      <div v-else-if="assignments.length === 0"
        class="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 py-16 px-8 text-center shadow-xl shadow-amber-100/40">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div class="relative inline-flex mb-5">
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-lg scale-110" />
          <div
            class="relative w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 ring-4 ring-amber-100">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <h3 class="font-serif text-lg font-bold text-stone-700 mb-2">No hay asignaciones de roles</h3>
        <p class="text-sm text-stone-400 max-w-xs mx-auto">
          Aún no se han asignado roles a ningún usuario o miembro del sistema.
        </p>
      </div>

      <!-- ── Grid de asignaciones ── -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <article
          v-for="(assignment, index) in assignments"
          :key="`${assignment.member_id ?? 'none'}-${assignment.user_id ?? 'none'}-${index}`"
          class="group relative overflow-hidden rounded-2xl border border-amber-200/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300 hover:-translate-y-1"
        >
          <!-- Línea de acento superior -->
          <div
            class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

          <!-- Banner decorativo -->
          <div
            class="h-16 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-stone-100 group-hover:from-amber-500/20 group-hover:via-orange-500/20 transition-all duration-300" />

          <div class="px-5 pb-5 -mt-8">

            <!-- Avatar + nombre -->
            <div class="flex items-end gap-3 mb-4">
              <div
                :class="`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarGradient(assignment.member?.id ?? assignment.user?.id ?? index.toString())} flex items-center justify-center text-white text-lg font-bold shadow-lg ring-3 ring-white group-hover:scale-105 transition-transform duration-300`">
                {{ getInitials(assignment.member?.name_full ?? assignment.user?.name ?? '??') }}
              </div>
              <div class="min-w-0 pb-0.5">
                <h3 class="font-serif font-bold text-stone-800 text-sm leading-tight truncate group-hover:text-amber-800 transition-colors">
                  {{ assignment.member?.name_full ?? assignment.user?.name ?? 'Sin datos' }}
                </h3>
                <p class="text-[10px] text-stone-400 font-mono mt-0.5">
                  {{ assignment.member_id ? `MIEM-${assignment.member_id.slice(0, 8)}` : `USR-${assignment.user_id?.slice(0, 8)}` }}
                </p>
              </div>
            </div>

            <!-- Tipo de entidad -->
            <div class="mb-3">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border',
                  assignment.member_id
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                ]">
                <span :class="[
                  'w-1.5 h-1.5 rounded-full',
                  assignment.member_id ? 'bg-emerald-500' : 'bg-blue-500'
                ]" />
                {{ assignment.member_id ? 'Miembro' : 'Usuario' }}
              </span>
            </div>

            <!-- Divider -->
            <div class="h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent mb-3" />

            <!-- Información específica -->
            <div v-if="assignment.member" class="space-y-2 mb-3">
              <div class="flex items-center gap-2 text-xs">
                <svg class="w-3.5 h-3.5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a10 10 0 00-9-3" />
                </svg>
                <span class="text-stone-500">{{ docTypeLabels[assignment.member.type_document] ?? assignment.member.type_document }}</span>
                <span class="font-mono font-semibold text-stone-700">{{ assignment.member.number_document }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <svg class="w-3.5 h-3.5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span class="font-mono text-stone-600">{{ assignment.member.phone_number }}</span>
              </div>
            </div>

            <div v-else-if="assignment.user" class="space-y-2 mb-3">
              <div class="flex items-center gap-2 text-xs">
                <svg class="w-3.5 h-3.5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="text-stone-600 truncate">{{ assignment.user.email }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <svg class="w-3.5 h-3.5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span class="font-mono text-stone-600">{{ assignment.user.phone ?? 'Sin teléfono' }}</span>
              </div>
            </div>

            <div v-else class="text-xs text-stone-400 italic mb-3">
              Datos del servidor no disponibles
            </div>

            <!-- Roles -->
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="role in assignment.roles"
                :key="role"
                :class="['inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border', roleColors[role] ?? 'bg-stone-100 text-stone-600 border-stone-200']">
                {{ roleLabels[role] ?? role }}
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- ── Footer ── -->
      <div v-if="assignments.length > 0"
        class="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-white/80 backdrop-blur-sm px-6 py-4 shadow-lg shadow-amber-100/40">
        <div class="flex items-center justify-between">
          <p class="text-xs text-stone-400">
            Total: <span class="font-bold text-amber-600 ml-1">{{ assignments.length }}</span> asignaciones
          </p>
          <div class="flex items-center gap-1.5">
            <span class="inline-block h-2 w-2 rounded-sm bg-gradient-to-br from-amber-400 to-orange-500" />
            <span class="text-xs text-stone-400">Coliseo activo</span>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>
