<script setup lang="ts">
import BaseErrorDisplay from '@/utils/components/BaseErrorDisplay.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberUserAssignmentListStore } from '../../application/stores/useMemberUserAssignmentListStore'
import type { MemberUserAssignmentListItem } from '../../domain/entities/MemberUserAssignment.types'
import { MemberUserAssignmentDomainService } from '../../domain/services/MemberUserAssignmentDomainService'
import MemberUserAssignmentDeleteModal from '../components/organisms/MemberUserAssignmentDeleteModal.vue'
import MemberUserAssignmentDetailModal from '../components/organisms/MemberUserAssignmentDetailModal.vue'

const router = useRouter()
const listStore = useMemberUserAssignmentListStore()

const searchQuery = ref('')
const selectedAssignment = ref<MemberUserAssignmentListItem | null>(null)
const isDetailOpen = ref(false)
const isDeleteOpen = ref(false)
const isDeleting = ref(false)

const filteredAssignments = computed(() =>
  MemberUserAssignmentDomainService.filterAssignments(listStore.rows, searchQuery.value),
)

const hasAssignments = computed(() => listStore.rows.length > 0)
const hasSearchQuery = computed(() => searchQuery.value.trim().length > 0)

function openDetail(assignment: MemberUserAssignmentListItem): void {
  selectedAssignment.value = assignment
  isDetailOpen.value = true
}

function closeDetail(): void {
  isDetailOpen.value = false
  selectedAssignment.value = null
}

function openDelete(assignment: MemberUserAssignmentListItem): void {
  selectedAssignment.value = assignment
  listStore.clearDeleteError()
  isDeleteOpen.value = true
}

function closeDelete(): void {
  if (isDeleting.value) return
  isDeleteOpen.value = false
  selectedAssignment.value = null
  listStore.clearDeleteError()
}

async function confirmDelete(): Promise<void> {
  const assignment = selectedAssignment.value
  if (!assignment || isDeleting.value) return

  isDeleting.value = true
  const ok = await listStore.deleteAssignment(assignment.id)
  isDeleting.value = false

  if (ok) {
    isDeleteOpen.value = false
    selectedAssignment.value = null
  }
}

onMounted(() => {
  void listStore.fetchAssignments()
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

    <div class="mx-auto max-w-7xl space-y-6">
      <header
        v-motion
        :initial="{ opacity: 0, y: -12 }"
        :enter="{ opacity: 1, y: 0 }"
        :transition="{ duration: 400, ease: [0.16, 1, 0.3, 1] }"
        class="relative overflow-hidden rounded-xl border border-amber-200 bg-amber-100 px-5 py-6 shadow-sm sm:px-8"
      >
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 opacity-90"
        />
        <div class="pointer-events-none absolute top-0 right-0 opacity-20">
          <svg width="200" height="130" viewBox="0 0 200 130" fill="none" aria-hidden="true">
            <circle cx="180" cy="-10" r="95" fill="#FDE68A" />
            <circle cx="140" cy="35" r="48" fill="#FB923C" />
          </svg>
        </div>
        <div class="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/90">
              Coliseo · Censo
            </p>
            <h1 class="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
              Lista de miembros asignados
            </h1>
            <p class="mt-1 max-w-xl text-sm text-amber-50/80">
              Aquí ves quién ya tiene un lugar propio: cada vínculo entre una cuenta y un gladiador, sin prisa.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/30 transition-colors hover:bg-white/30"
            @click="router.push({ name: 'assign-members' })"
          >
            Nuevo vínculo
          </button>
        </div>
      </header>

      <div v-if="listStore.isLoading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
        <span class="ml-3 text-sm text-stone-500">Cargando asignaciones...</span>
      </div>

      <BaseErrorDisplay
        v-else-if="listStore.error"
        title="No pudimos abrir esta lista"
        :message="listStore.error"
        mode="container"
        action-text="Intentarlo otra vez"
        @retry="listStore.fetchAssignments"
      />

      <template v-else>
        <div
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0 }"
          :transition="{ duration: 380, delay: 60, ease: [0.16, 1, 0.3, 1] }"
          class="relative"
        >
          <label for="assignment-search" class="sr-only">Buscar asignaciones</label>
          <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </span>
          <input
            id="assignment-search"
            v-model="searchQuery"
            type="search"
            placeholder="Busca por usuario, miembro o identificador..."
            class="w-full rounded-lg border border-amber-300 bg-white py-2 pr-3 pl-10 text-sm text-stone-800 placeholder-stone-400 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
        </div>

        <div
          v-if="!hasAssignments"
          class="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-100 py-16 text-center"
        >
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <svg class="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <h3 class="mb-1 font-serif text-lg font-semibold text-stone-700">Todavía no hay vínculos</h3>
          <p class="max-w-xs text-sm text-stone-400">
            Cuando unas a alguien con su cuenta, aparecerá aquí con calma.
          </p>
        </div>

        <div
          v-else-if="filteredAssignments.length === 0"
          class="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-100 py-16 text-center"
        >
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <svg class="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </div>
          <h3 class="mb-1 font-serif text-lg font-semibold text-stone-700">No encontramos coincidencias</h3>
          <p class="max-w-xs text-sm text-stone-400">
            Prueba con un nombre o un identificador. La lista no se ha perdido.
          </p>
        </div>

        <div
          v-else
          v-motion
          :initial="{ opacity: 0, y: 14 }"
          :enter="{ opacity: 1, y: 0 }"
          :transition="{ duration: 420, delay: 80, ease: [0.16, 1, 0.3, 1] }"
          class="overflow-hidden rounded-xl border border-amber-200 shadow-sm"
        >
          <div class="overflow-x-auto">
            <table class="w-full min-w-[640px] text-left text-sm">
              <caption class="sr-only">Asignaciones de miembros a usuarios</caption>
              <thead class="bg-amber-200">
                <tr>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-semibold tracking-wide text-stone-700 uppercase">
                    Usuario
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-semibold tracking-wide text-stone-700 uppercase">
                    Miembro
                  </th>
                  <th scope="col" class="px-4 py-3 text-right text-xs font-semibold tracking-wide text-stone-700 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-amber-100 bg-[#FFFBF5]">
                <tr
                  v-for="assignment in filteredAssignments"
                  :key="assignment.id"
                  class="hover:bg-amber-50 transition-colors"
                >
                  <td class="px-4 py-3 align-middle">
                    <div class="flex items-center gap-3">
                      <div
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-100"
                      >
                        <span class="text-xs font-semibold text-amber-800">
                          {{ MemberUserAssignmentDomainService.initials(assignment.userName) }}
                        </span>
                      </div>
                      <div class="min-w-0">
                        <p class="truncate font-medium text-stone-800">{{ assignment.userName }}</p>
                        <p class="truncate font-mono text-xs text-stone-500">{{ assignment.id_user }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <div class="flex items-center gap-3">
                      <div
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-100"
                        aria-hidden="true"
                      >
                        <svg class="h-4 w-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      </div>
                      <div class="min-w-0">
                        <p class="truncate font-medium text-stone-800">{{ assignment.memberName }}</p>
                        <p class="truncate font-mono text-xs text-stone-500">{{ assignment.member_id }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-right align-middle">
                    <div class="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        class="rounded-lg p-2 text-stone-400 transition-colors hover:bg-amber-100 hover:text-amber-700"
                        title="Ver detalle"
                        aria-label="Ver detalle de la asignación"
                        @click="openDetail(assignment)"
                      >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        class="rounded-lg p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-700"
                        title="Eliminar"
                        aria-label="Eliminar asignación"
                        @click="openDelete(assignment)"
                      >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex items-center justify-between border-t border-amber-200 bg-amber-100 px-4 py-3">
            <p class="text-xs text-stone-500">
              {{ filteredAssignments.length }}
              {{ filteredAssignments.length === 1 ? 'vínculo' : 'vínculos' }}
              <span v-if="hasSearchQuery"> visibles</span>
            </p>
            <p class="text-xs text-stone-400">Coliseo · Censo</p>
          </div>
        </div>
      </template>
    </div>

    <MemberUserAssignmentDetailModal
      :is-open="isDetailOpen"
      :assignment="selectedAssignment"
      @close="closeDetail"
    />
    <MemberUserAssignmentDeleteModal
      :is-open="isDeleteOpen"
      :user-name="selectedAssignment?.userName ?? ''"
      :member-name="selectedAssignment?.memberName ?? ''"
      :is-deleting="isDeleting"
      :error="listStore.deleteError"
      @close="closeDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
