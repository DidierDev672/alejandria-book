<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BaseModal from '@/utils/components/BaseModal.vue'
import { MemberProgressDomainService } from '../../domain/services/MemberProgressDomainService'
import type { MemberProgress } from '../../domain/entities/MemberProgress.types'

interface MemberBasicInfo {
  id: string
  name_full: string
  type_document: string
  number_document: string
  genre: string
}

const API_BASE = import.meta.env.VITE_API_ATREIDES || 'http://localhost:8080'

const router = useRouter()

const list = ref<MemberProgress[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const detailModalOpen = ref(false)
const detailProgress = ref<MemberProgress | null>(null)
const detailMember = ref<MemberBasicInfo | null>(null)
const detailMemberLoading = ref(false)
const deleteModalOpen = ref(false)
const deleteTarget = ref<MemberProgress | null>(null)
const memberById = ref<Record<string, MemberBasicInfo>>({})

function normalizeProgress(raw: Record<string, unknown>): MemberProgress {
  return {
    id: String(raw.id ?? ''),
    user_id: String(raw.user_id ?? ''),
    user_name: raw.user_name ? String(raw.user_name) : undefined,
    month_year: String(raw.month_year ?? ''),
    recorded_value: Number(raw.recorded_value ?? 0),
    notes: raw.notes ? String(raw.notes) : undefined,
    created_at: String(raw.created_at ?? new Date().toISOString()),
    updated_at: String(raw.updated_at ?? new Date().toISOString()),
  }
}

function normalizeList(data: unknown): MemberProgress[] {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeProgress(item as Record<string, unknown>))
  }
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown[] }).data)) {
    return (data as { data: Record<string, unknown>[] }).data.map(normalizeProgress)
  }
  if (data && typeof data === 'object') {
    return [normalizeProgress(data as Record<string, unknown>)]
  }
  return []
}

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function normalizeMemberBasic(raw: Record<string, unknown>): MemberBasicInfo {
  return {
    id: String(raw.id ?? ''),
    name_full: String(raw.name_full ?? ''),
    type_document: String(raw.type_document ?? ''),
    number_document: String(raw.number_document ?? ''),
    genre: String(raw.genre ?? raw.gender ?? ''),
  }
}

async function fetchMemberById(id: string): Promise<MemberBasicInfo | null> {
  if (memberById.value[id]) return memberById.value[id]

  try {
    const response = await axios.get(`/members/${id}`, {
      baseURL: API_BASE,
      headers: getAuthHeaders(),
    })
    const member = normalizeMemberBasic(response.data as Record<string, unknown>)
    memberById.value[id] = member
    return member
  } catch {
    return null
  }
}

async function loadMembersForProgress(progressList: MemberProgress[]) {
  const uniqueIds = [...new Set(progressList.map((p) => p.user_id).filter(Boolean))]
  await Promise.allSettled(uniqueIds.map((id) => fetchMemberById(id)))
}

function getMemberDisplayName(userId: string, progress?: MemberProgress): string {
  const cached = memberById.value[userId]
  if (cached?.name_full) return cached.name_full
  return progress?.user_name || `${userId.slice(0, 12)}...`
}

function getMemberInitial(userId: string, progress?: MemberProgress): string {
  const name = memberById.value[userId]?.name_full || progress?.user_name || userId
  return name.charAt(0).toUpperCase()
}

async function fetchProgressMember() {
  loading.value = true
  error.value = null

  try {
    const response = await axios.get('/progress-member', {
      baseURL: API_BASE,
      headers: getAuthHeaders(),
    })
    list.value = normalizeList(response.data)
    await loadMembersForProgress(list.value)
  } catch (err: unknown) {
    const message =
      axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
          ? err.message
          : 'Error desconocido'
    error.value = `Error al cargar el progreso: ${message}`
    list.value = []
  } finally {
    loading.value = false
  }
}

async function openDetailModal(progress: MemberProgress) {
  detailProgress.value = progress
  detailMember.value = memberById.value[progress.user_id] ?? null
  detailMemberLoading.value = !detailMember.value
  detailModalOpen.value = true

  const member = await fetchMemberById(progress.user_id)
  detailMember.value = member
  detailMemberLoading.value = false
}

function openDeleteModal(progress: MemberProgress) {
  deleteTarget.value = progress
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return

  try {
    await axios.delete(`/progress-member/${deleteTarget.value.id}`, {
      baseURL: API_BASE,
      headers: getAuthHeaders(),
    })
    list.value = list.value.filter((item) => item.id !== deleteTarget.value!.id)
    deleteModalOpen.value = false
    deleteTarget.value = null
  } catch (err: unknown) {
    const message =
      axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
          ? err.message
          : 'Error desconocido'
    alert(`Error al eliminar: ${message}`)
  }
}

function goToCreate() {
  router.push({ name: 'member-progress-create' })
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    router.push({ name: 'login' })
    return
  }
  fetchProgressMember()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-stone-100 px-6 py-8">
    <div class="pointer-events-none fixed right-0 top-0 opacity-10 -z-10">
      <svg width="400" height="280" viewBox="0 0 400 280" fill="none">
        <circle cx="360" cy="-25" r="180" fill="#f59e0b" />
        <circle cx="305" cy="65" r="90" fill="#ea580c" />
      </svg>
    </div>
    <div class="pointer-events-none fixed bottom-0 left-0 opacity-5 -z-10">
      <svg width="260" height="210" viewBox="0 0 260 210" fill="none">
        <circle cx="0" cy="210" r="155" fill="#f59e0b" />
      </svg>
    </div>

    <div class="max-w-7xl mx-auto space-y-6">
      <div
        v-motion
        :initial="{ opacity: 0, y: -12 }"
        :enter="{ opacity: 1, y: 0 }"
        class="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-white/80 backdrop-blur-sm px-8 py-6 shadow-xl shadow-amber-100/60"
      >
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
        <div class="relative flex items-center gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 class="font-serif text-2xl font-bold text-stone-800">Progreso de Miembros</h1>
            <p class="text-xs text-stone-400 mt-0.5">Registro mensual de avance de objetivos del Coliseo</p>
          </div>
        </div>
      </div>

      <div
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.1 }"
        class="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-white/80 backdrop-blur-sm p-4 shadow-lg shadow-amber-100/40"
      >
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <p class="text-sm text-stone-500">Seguimiento de progreso de objetivos por miembro y mes</p>
          <button
            @click="goToCreate"
            class="relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl active:scale-95 group"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <svg class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="relative">Registrar Progreso</span>
          </button>
        </div>
      </div>

      <div
        v-if="loading"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1 }"
        class="flex items-center justify-center py-16 rounded-3xl border border-amber-200/60 bg-white/70 backdrop-blur-sm shadow-lg"
      >
        <div class="w-8 h-8 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
        <span class="ml-3 text-sm text-stone-400">Cargando...</span>
      </div>

      <div
        v-else-if="error"
        v-motion
        :initial="{ opacity: 0, scale: 0.98 }"
        :enter="{ opacity: 1, scale: 1 }"
        class="flex flex-col items-center gap-4 py-8"
      >
        <div class="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3 max-w-lg">
          <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
        <button
          @click="fetchProgressMember"
          class="text-sm font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2"
        >
          Reintentar
        </button>
      </div>

      <div
        v-else-if="list.length === 0"
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0 }"
        class="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 py-16 px-8 text-center shadow-xl shadow-amber-100/40"
      >
        <h3 class="font-serif text-lg font-bold text-stone-700 mb-2">No hay registros de progreso</h3>
        <p class="text-sm text-stone-400 max-w-xs mx-auto mb-6">
          Aún no se ha registrado ningún progreso de objetivos.
        </p>
        <button
          @click="goToCreate"
          class="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25"
        >
          Registrar primer progreso
        </button>
      </div>

      <div
        v-else
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.15 }"
        class="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 backdrop-blur-sm shadow-xl shadow-amber-100/40"
      >
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-amber-100 bg-amber-50/60">
                <th class="px-5 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Miembro</th>
                <th class="px-5 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Mes</th>
                <th class="px-5 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Valor</th>
                <th class="px-5 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Notas</th>
                <th class="px-5 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Registro</th>
                <th class="px-5 py-4 text-right text-xs font-semibold text-stone-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-amber-50">
              <tr
                v-for="(progress, index) in list"
                :key="progress.id"
                v-motion
                :initial="{ opacity: 0, x: -8 }"
                :enter="{ opacity: 1, x: 0 }"
                :transition="{ delay: index * 0.04 }"
                class="group hover:bg-amber-50/50 transition-colors duration-150 cursor-pointer"
                @click="openDetailModal(progress)"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/30 to-orange-500/20 border border-amber-200 flex items-center justify-center shrink-0">
                      <span class="text-xs font-bold text-amber-700">
                        {{ getMemberInitial(progress.user_id, progress) }}
                      </span>
                    </div>
                    <div class="font-semibold text-stone-800 group-hover:text-amber-800 transition-colors duration-150">
                      {{ getMemberDisplayName(progress.user_id, progress) }}
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span class="font-semibold text-stone-700">
                    {{ MemberProgressDomainService.formatMonthYear(progress.month_year) }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <span class="font-bold text-amber-700 text-base">{{ progress.recorded_value }}</span>
                </td>
                <td class="px-5 py-4">
                  <span class="text-xs text-stone-500 max-w-[200px] block truncate">{{ progress.notes || '—' }}</span>
                </td>
                <td class="px-5 py-4 text-xs text-stone-400 font-mono">{{ formatDate(progress.created_at) }}</td>
                <td class="px-5 py-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click.stop="openDetailModal(progress)"
                      class="p-2 rounded-xl text-stone-400 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all duration-200 active:scale-90"
                      title="Ver detalle"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      @click.stop="openDeleteModal(progress)"
                      class="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all duration-200 active:scale-90"
                      title="Eliminar"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-5 py-3.5 bg-amber-50/40 border-t border-amber-100">
          <p class="text-xs text-stone-400">
            Total: <span class="font-bold text-amber-600 ml-1">{{ list.length }}</span> registros
          </p>
        </div>
      </div>
    </div>

    <BaseModal :is-open="detailModalOpen" max-with-class="max-w-lg" :expandable="false" @close="detailModalOpen = false">
      <template #header>
        <h3 class="font-serif text-xl font-bold text-white">Detalle del Progreso</h3>
      </template>
      <template #content>
        <div v-if="detailProgress" class="space-y-5">
          <div class="bg-amber-50/60 rounded-2xl px-4 py-3.5 border border-amber-100">
            <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Miembro</span>

            <div v-if="detailMemberLoading" class="flex items-center gap-2 mt-2">
              <div class="w-4 h-4 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
              <p class="text-sm text-stone-400">Cargando información del miembro...</p>
            </div>

            <div v-else-if="detailMember" class="mt-2 space-y-3">
              <p class="font-bold text-stone-800 text-base">{{ detailMember.name_full }}</p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Tipo documento</span>
                  <p class="text-sm text-stone-700 mt-0.5">{{ detailMember.type_document }}</p>
                </div>
                <div>
                  <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Número documento</span>
                  <p class="text-sm text-stone-700 mt-0.5 font-mono">{{ detailMember.number_document }}</p>
                </div>
                <div class="col-span-2">
                  <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Género</span>
                  <p class="text-sm text-stone-700 mt-0.5 capitalize">{{ detailMember.genre }}</p>
                </div>
              </div>
            </div>

            <p v-else class="text-sm text-stone-500 mt-1">
              {{ getMemberDisplayName(detailProgress.user_id, detailProgress) }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-amber-50/60 rounded-2xl px-4 py-3.5 border border-amber-100">
              <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Mes</span>
              <p class="font-bold text-stone-800 text-sm mt-0.5">
                {{ MemberProgressDomainService.formatMonthYear(detailProgress.month_year) }}
              </p>
            </div>
            <div class="bg-amber-50/60 rounded-2xl px-4 py-3.5 border border-amber-100">
              <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Valor</span>
              <p class="font-serif font-bold text-amber-700 text-2xl mt-0.5">{{ detailProgress.recorded_value }}</p>
            </div>
          </div>
          <div v-if="detailProgress.notes" class="bg-amber-50/60 rounded-2xl px-4 py-3.5 border border-amber-100">
            <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Observaciones</span>
            <p class="text-sm text-stone-700 mt-1 leading-relaxed">{{ detailProgress.notes }}</p>
          </div>
        </div>
      </template>
    </BaseModal>

    <BaseModal :is-open="deleteModalOpen" max-with-class="max-w-sm" :expandable="false" @close="deleteModalOpen = false">
      <template #header>
        <h3 class="font-serif text-xl font-bold text-white">Confirmar Eliminación</h3>
      </template>
      <template #content>
        <p class="text-stone-600">¿Estás seguro de eliminar este registro de progreso? Esta acción no se puede deshacer.</p>
      </template>
      <template #footer>
        <button
          type="button"
          @click="deleteModalOpen = false"
          class="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border-2 border-amber-300 rounded-xl hover:bg-amber-50 transition-all active:scale-95"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="confirmDelete"
          class="px-6 py-2.5 text-sm font-bold text-white bg-red-600 border-2 border-red-600 rounded-xl hover:bg-red-700 transition-all active:scale-95"
        >
          Eliminar
        </button>
      </template>
    </BaseModal>
  </div>
</template>
