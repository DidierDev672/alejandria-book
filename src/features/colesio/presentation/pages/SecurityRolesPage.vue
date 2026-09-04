<script setup lang="ts">
import axiosInstance from '@/infrastructure/http/axiosInstance'
import { computed, onMounted, ref } from 'vue'
import MemberListModal from '../components/organisms/MemberListModal.vue'
import UserListModal from '../components/organisms/UserListModal.vue'

// ═══════════════════════════════════════════════════════════════
// TYPES - Domain entities
// ═══════════════════════════════════════════════════════════════

type Role = 'admin' | 'coach' | 'super_admin'

interface AssignRoleRequest {
  id: string
  member_id?: string
  user_id?: string
  roles: Role[]
}

interface AssignRoleResponse {
  message: string
  data: {
    id: string
    member_id: string
    user_id: string
    roles: Role[]
  }
}

interface RoleOption {
  value: Role
  label: string
  description: string
}

interface SelectedMember {
  id: string
  name_full: string
  phone_number: string
}

interface SelectedUser {
  id: string
  name_full: string
  phone: string
}

// ═══════════════════════════════════════════════════════════════
// STATE - Reactive state management
// ═══════════════════════════════════════════════════════════════

const showHeader = ref(false)

const form = ref<AssignRoleRequest>({
  id: '',
  member_id: '',
  user_id: '',
  roles: []
})

const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const isMemberModalOpen = ref(false)
const selectedMember = ref<SelectedMember | null>(null)
const isUserModalOpen = ref(false)
const selectedUser = ref<SelectedUser | null>(null)

const roleOptions: RoleOption[] = [
  { value: 'admin', label: 'Administrador', description: 'Acceso completo al sistema' },
  { value: 'coach', label: 'Coach', description: 'Gestiona entrenamientos y miembros' },
  { value: 'super_admin', label: 'Super Admin', description: 'Control total del sistema' }
]

// ═══════════════════════════════════════════════════════════════
// COMPUTED - Derived state
// ═══════════════════════════════════════════════════════════════

const isFormValid = computed(() => {
  return (
    form.value.id.trim() !== '' &&
    (form.value.member_id?.trim() !== '' || form.value.user_id?.trim() !== '') &&
    form.value.roles.length > 0
  )
})

const selectedRolesText = computed(() => {
  if (form.value.roles.length === 0) return 'Ninguno seleccionado'
  return form.value.roles
    .map(role => roleOptions.find(r => r.value === role)?.label)
    .join(', ')
})

// ═══════════════════════════════════════════════════════════════
// METHODS - Business logic
// ═══════════════════════════════════════════════════════════════

async function assignRoles(): Promise<void> {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = null
  successMessage.value = null

  try {
    const payload: Record<string, unknown> = {
      roles: form.value.roles,
      member_id: form.value.member_id || null,
      user_id: form.value.user_id || null,
    }
    const { data } = await axiosInstance.post<AssignRoleResponse>('/asignar-roles', payload)
    successMessage.value = data.message
    resetForm()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al asignar roles'
    console.error('[SecurityRoles] Error:', err)
  } finally {
    isLoading.value = false
  }
}

function toggleRole(role: Role): void {
  const index = form.value.roles.indexOf(role)
  if (index === -1) {
    form.value.roles.push(role)
  } else {
    form.value.roles.splice(index, 1)
  }
}

function isRoleSelected(role: Role): boolean {
  return form.value.roles.includes(role)
}

function handleMemberSelect(member: SelectedMember): void {
  selectedMember.value = member
  form.value.member_id = member.id
}

function handleClearMember(): void {
  selectedMember.value = null
  form.value.member_id = ''
}

function openMemberModal(): void {
  isMemberModalOpen.value = true
}

function closeMemberModal(): void {
  isMemberModalOpen.value = false
}

function handleUserSelect(user: SelectedUser): void {
  selectedUser.value = user
  form.value.user_id = user.id
}

function handleClearUser(): void {
  selectedUser.value = null
  form.value.user_id = ''
}

function openUserModal(): void {
  isUserModalOpen.value = true
}

function closeUserModal(): void {
  isUserModalOpen.value = false
}

function resetForm(): void {
  form.value = {
    id: crypto.randomUUID(),
    member_id: '',
    user_id: '',
    roles: []
  }
  selectedMember.value = null
  selectedUser.value = null
}

function clearMessages(): void {
  error.value = null
  successMessage.value = null
}

// ═══════════════════════════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════════════════════════

onMounted(() => {
  form.value.id = crypto.randomUUID()
  // Desde v-if=false → true la animación dispara las clases .slide-in-enter-*
  showHeader.value = true
})
</script>

<template>
  <section class="min-h-screen overflow-x-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">

    <!-- Decoradores globales -->
    <div class="pointer-events-none fixed right-0 top-0 -z-10 opacity-10">
      <svg width="360" height="260" viewBox="0 0 360 260" fill="none">
        <circle cx="320" cy="-20" r="160" fill="#10b981" />
        <circle cx="270" cy="55" r="80" fill="#14b8a6" />
      </svg>
    </div>
    <div class="pointer-events-none fixed bottom-0 left-0 -z-10 opacity-5">
      <svg width="240" height="200" viewBox="0 0 240 200" fill="none">
        <circle cx="0" cy="200" r="140" fill="#10b981" />
      </svg>
    </div>

    <div class="max-w-4xl mx-auto space-y-6">

      <!-- ── Header ── -->
      <!--
        <Transition name="slide-in"> vincula automáticamente las clases CSS
        con prefijo slide-in-* (enter-active / enter-from / enter-to).
        El header sólo se monta después de onMounted (showHeader), por lo
        que la transición de entrada se ejecuta al llegar a la página.
      -->
      <header>
        <Transition name="slide-in">
          <div
            v-if="showHeader"
            class="relative overflow-hidden rounded-3xl text-white shadow-2xl shadow-emerald-200/50">
            <!-- Gradiente cromático verde: una misma familia de tono en progresión -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-700 via-green-500 to-teal-400" />
            <!-- Brillo sutil para dar profundidad -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

            <div class="pointer-events-none absolute -right-10 -top-16 opacity-20">
              <svg width="260" height="200" viewBox="0 0 260 200" fill="none">
                <circle cx="200" cy="40" r="120" fill="#a7f3d0" />
                <circle cx="150" cy="90" r="60" fill="#d1fae5" />
              </svg>
            </div>

            <div class="relative px-6 py-7 sm:px-8 sm:py-8">
              <!-- Orientación: el usuario sabe dónde está (wayfinding) -->
              <div class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-50 backdrop-blur-sm">
                <svg class="h-3.5 w-3.5 text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 7v4l9 5 9-5V7l-9 5-9-5zm0 2.5v8l9 5 9-5v-8" />
                </svg>
                Estás en · Seguridad y Roles
              </div>

              <div class="mt-4 flex items-center gap-4">
                <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-sm ring-1 ring-white/20">
                  <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h1 class="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                    Seguridad y Accesos
                  </h1>
                  <p class="mt-1 max-w-xl text-sm text-emerald-50/90 leading-relaxed">
                    Tú decides quién entra y con qué permisos. Aquí proteges tu espacio
                    y asignas roles a cada persona con toda la claridad que mereces.
                  </p>
                </div>
              </div>

              <!-- Tónica tranquila: mini guía de confianza -->
              <div class="mt-5 flex flex-wrap gap-2">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-50">
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Solo entran las personas que elijas
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-50">
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Cada rol ve únicamente lo suyo
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-50">
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Puedes cambiar los permisos cuando quieras
                </span>
              </div>
            </div>
          </div>
        </Transition>
      </header>

      <!-- ── Toast: Éxito ── -->
      <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-3"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-3">
        <div v-if="successMessage"
          class="relative overflow-hidden flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 shadow-lg shadow-emerald-100/60">
          <div
            class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-emerald-800">{{ successMessage }}</p>
          </div>
          <button @click="clearMessages"
            class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-emerald-400 hover:text-emerald-700 hover:bg-emerald-100 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Transition>

      <!-- ── Toast: Error ── -->
      <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-3"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-3">
        <div v-if="error"
          class="relative overflow-hidden flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-5 py-4 shadow-lg shadow-rose-100/60">
          <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/60 to-transparent" />
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-rose-800">{{ error }}</p>
          </div>
          <button @click="clearMessages"
            class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-100 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Transition>

      <!-- ── Form Card ── -->
      <div
        class="relative overflow-hidden rounded-3xl border border-emerald-200/60 bg-white/80 backdrop-blur-sm shadow-xl shadow-emerald-100/40">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

        <form @submit.prevent="assignRoles" class="p-6 sm:p-8 space-y-7">
          <input id="id" v-model="form.id" type="hidden" />

          <!-- ── Campo: Miembro ── -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 mb-1">
              <span class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shrink-0">
                <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <label for="member_id" class="text-sm font-bold text-stone-700">
                Miembro
                <span class="text-stone-400 font-normal ml-1 text-xs">(opcional)</span>
              </label>
            </div>

            <div class="flex gap-2">
              <div v-if="selectedMember"
                class="flex-1 px-4 py-3 rounded-xl border-2 border-emerald-300/60 bg-emerald-50/40 flex items-center justify-between">
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/30 to-teal-500/20 border border-emerald-200 flex items-center justify-center shrink-0">
                    <span class="text-sm font-black text-emerald-700">{{ selectedMember.name_full.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-stone-800 text-sm truncate">{{ selectedMember.name_full }}</p>
                    <p class="text-xs text-stone-400 font-mono">{{ selectedMember.phone_number }}</p>
                  </div>
                </div>
                <button type="button" @click="handleClearMember"
                  class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-200 ml-2">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <input v-else id="member_id" v-model="form.member_id" type="text" placeholder="ID del miembro"
                class="flex-1 px-4 py-3 rounded-xl border-2 border-emerald-200/60 bg-emerald-50/40 text-stone-700 placeholder-stone-400 text-sm transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/10 hover:border-emerald-300" />

              <button type="button" @click="openMemberModal"
                class="shrink-0 px-4 py-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-400 transition-all duration-200 active:scale-95"
                title="Seleccionar miembro">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- ── Campo: Usuario ── -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 mb-1">
              <span class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shrink-0">
                <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <label for="user_id" class="text-sm font-bold text-stone-700">
                Usuario
                <span class="text-stone-400 font-normal ml-1 text-xs">(opcional)</span>
              </label>
            </div>

            <div class="flex gap-2">
              <div v-if="selectedUser"
                class="flex-1 px-4 py-3 rounded-xl border-2 border-emerald-300/60 bg-emerald-50/40 flex items-center justify-between">
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/30 to-teal-500/20 border border-emerald-200 flex items-center justify-center shrink-0">
                    <span class="text-sm font-black text-emerald-700">{{ selectedUser.name_full.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-stone-800 text-sm truncate">{{ selectedUser.name_full }}</p>
                    <p class="text-xs text-stone-400">{{ selectedUser.phone || 'Sin teléfono' }}</p>
                  </div>
                </div>
                <button type="button" @click="handleClearUser"
                  class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-200 ml-2">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <input v-else id="user_id" v-model="form.user_id" type="text" placeholder="ID del usuario"
                class="flex-1 px-4 py-3 rounded-xl border-2 border-emerald-200/60 bg-emerald-50/40 text-stone-700 placeholder-stone-400 text-sm transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/10 hover:border-emerald-300" />

              <button type="button" @click="openUserModal"
                class="shrink-0 px-4 py-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-400 transition-all duration-200 active:scale-95"
                title="Seleccionar usuario">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- ── Divider ── -->
          <div class="h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

          <!-- ── Campo: Roles ── -->
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shrink-0">
                <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <label class="text-sm font-bold text-stone-700">
                Roles
                <span class="text-emerald-500 ml-0.5">*</span>
              </label>
              <span v-if="form.roles?.length"
                class="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                {{ form.roles.length }} seleccionado{{ form.roles.length !== 1 ? 's' : '' }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button v-for="role in roleOptions" :key="role.value" type="button" @click="toggleRole(role.value)"
                class="relative p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98] focus:outline-none"
                :class="isRoleSelected(role.value)
                  ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50/60 shadow-md shadow-emerald-200/60'
                  : 'border-stone-200/80 bg-white hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm'">
                <div v-if="isRoleSelected(role.value)"
                  class="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />

                <div class="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200"
                  :class="isRoleSelected(role.value)
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-300/50'
                    : 'border-2 border-stone-200 bg-white'">
                  <svg v-if="isRoleSelected(role.value)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div class="pr-7">
                  <h3 class="font-bold text-sm leading-tight"
                    :class="isRoleSelected(role.value) ? 'text-emerald-800' : 'text-stone-700'">
                    {{ role.label }}
                  </h3>
                  <p class="text-xs text-stone-400 mt-1.5 leading-relaxed">{{ role.description }}</p>
                </div>
              </button>
            </div>

            <p v-if="selectedRolesText" class="text-xs text-stone-400 flex items-center gap-1.5 pt-0.5">
              <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Seleccionados: <span class="font-semibold text-stone-600">{{ selectedRolesText }}</span>
            </p>
          </div>

          <!-- ── Divider ── -->
          <div class="h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

          <!-- ── Acciones ── -->
          <div class="flex flex-col sm:flex-row gap-3 pt-1">
            <button type="button" @click="resetForm"
              class="flex-1 px-6 py-3 rounded-xl font-semibold text-stone-600 bg-stone-100 border-2 border-transparent hover:border-emerald-200 hover:bg-emerald-50 hover:text-stone-700 transition-all duration-200 active:scale-95 text-sm">
              Limpiar
            </button>

            <button type="submit" :disabled="!isFormValid || isLoading"
              class="relative overflow-hidden flex-1 px-6 py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg group">
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              <span v-if="isLoading" class="relative flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Aplicando cambios…
              </span>
              <span v-else class="relative flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Guardar permisos
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modales -->
    <MemberListModal :is-open="isMemberModalOpen" @close="closeMemberModal" @select="handleMemberSelect" />
    <UserListModal :is-open="isUserModalOpen" @close="closeUserModal" @select="handleUserSelect" />
  </section>
</template>

<style scoped>
/*
  <Transition name="slide-in"> añade automáticamente clases con prefijo slide-in-*:
  - .slide-in-enter-active  → reglas de transición durante la entrada
  - .slide-in-enter-from    → estado inicial (antes de la animación)
  - .slide-in-enter-to      → estado final (destino)
  - .slide-in-leave-*       → salida (simétricas)
  El elemento arranca completamente a la derecha (translateX(100%)) e invisible
  (opacity: 0), y se desliza hasta su posición natural con fundido a la vez.
  Cambia translateX(100%) por -100% para que entre desde la izquierda.
*/
.slide-in-enter-active {
  transition:
    opacity 0.55s ease,
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-in-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.slide-in-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.slide-in-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.slide-in-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.slide-in-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>