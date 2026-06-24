<script setup lang="ts">
import axiosInstance from '@/infrastructure/http/axiosInstance'
import BaseModal from '@/utils/components/BaseModal.vue'
import { computed, onMounted, ref } from 'vue'

// Interfaces
interface User {
  id: string
  name: string
  role: string
  email: string
  avatar: string
  phone?: string
  id_number?: string
  date_of_birth?: string
  createdAt?: string
  updatedAt?: string
}

interface ApiUser {
  id: string
  name_full: string
  roles: string[] | null
  email: string
  phone?: string
  id_number?: string
  date_of_birth?: string
  createdAt?: string
  updatedAt?: string
}

// Estado
const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const isModalOpen = ref(false)
const selectedUser = ref<User | null>(null)

// Computed
const filteredUsers = computed(() => {
  const query = searchQuery.value?.toLowerCase()?.trim()
  if (!query) return users.value
  return users.value.filter(
    (user) =>
      (user.name?.toLowerCase() ?? '').includes(query) ||
      (user.role?.toLowerCase() ?? '').includes(query) ||
      (user.email?.toLowerCase() ?? '').includes(query),
  )
})

// Helpers
const generateAvatar = (name: string): string => {
  if (!name) return '??'
  const parts = name.trim().split(' ')
  if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const formatRole = (roles: string[] | null): string => {
  if (!roles || roles.length === 0) return 'Usuario'
  return roles[0] // Tomar el primer rol, o podría unirse: roles.join(', ')
}

const fetchUsers = async () => {
  loading.value = true
  error.value = null

  try {
    const { data } = await axiosInstance.get<ApiUser[]>('/users')
    users.value = data.map((apiUser) => ({
      id: apiUser.id,
      name: apiUser.name_full,
      role: formatRole(apiUser.roles),
      email: apiUser.email,
      avatar: generateAvatar(apiUser.name_full),
      phone: apiUser.phone,
      id_number: apiUser.id_number,
      date_of_birth: apiUser.date_of_birth,
      createdAt: apiUser.createdAt,
      updatedAt: apiUser.updatedAt,
    }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar usuarios'
    console.error('[UserList] Error fetching users:', err)
  } finally {
    loading.value = false
  }
}

const retryFetch = () => {
  fetchUsers()
}

const openUserModal = (user: User) => {
  selectedUser.value = user
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedUser.value = null
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'No disponible'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'No disponible'
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(() => {
  fetchUsers()
})

const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    Administradora: 'bg-purple-100 text-purple-700 border-purple-200',
    Admin: 'bg-purple-100 text-purple-700 border-purple-200',
    Editor: 'bg-blue-100 text-blue-700 border-blue-200',
    Autor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Autora: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Revisor: 'bg-amber-100 text-amber-700 border-amber-200',
    Bibliotecaria: 'bg-rose-100 text-rose-700 border-rose-200',
    Usuario: 'bg-slate-100 text-slate-700 border-slate-200',
  }
  return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200'
}

const getAvatarGradient = (id: string): string => {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
  ]
  // Usar el hash del string id para obtener un índice consistente
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}
</script>

<template>
  <section class="w-full max-w-6xl mx-auto px-4 py-8">
    <!-- Encabezado -->
    <header class="relative mb-10 overflow-hidden rounded-3xl border border-amber-500/20 bg-white px-8 py-8 shadow-2xl">
      <!-- Decoradores SVG de fondo -->
      <div class="pointer-events-none absolute right-0 top-0 opacity-10">
        <svg width="320" height="180" viewBox="0 0 320 180" fill="none">
          <circle cx="280" cy="-20" r="130" fill="#f59e0b" />
          <circle cx="240" cy="40" r="70" fill="#ea580c" />
        </svg>
      </div>
      <div class="pointer-events-none absolute bottom-0 left-0 right-0 opacity-5">
        <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
          <circle cx="0" cy="120" r="90" fill="#f59e0b" />
        </svg>
      </div>
      <!-- Línea de acento superior -->
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
      <div
        class="relative flex flex-col justify-end sm:justify-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <!-- Bloque izquierdo: ícono + textos -->
        <div v-motion :initial="{ opacity: 0, scale: 0.7 }" :enter="{ opacity: 1, scale: 1 }"
          :transition="{ duration: 500, ease: [0.16, 1, 0.3, 1] }"
          class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
          <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <!-- Titulo y subtitulo -->
        <div v-motion :initial="{ opacity: 0, y: -20 }" :enter="{ opacity: 1, y: 0 }" class="flex flex-col text-start"
          :transition="{ duration: 600, delay: 100, ease: 'easeOut' }">
          <div class="mb-1 flex flex-col items-center gap-3">
            <h1 v-motion :initial="{ opacity: 0, y: -20 }" :enter="{ opacity: 1, y: 0 }"
              :transition="{ duration: 600, ease: 'easeOut' }"
              class="font-serif text-2xl font-bold text-amber-500 sm:text-3xl">
              Equipo de Alajandría
            </h1>
            <p v-motion :initial="{ opacity: 0, y: -20 }" :enter="{ opacity: 1, y: 0 }"
              :transition="{ duration: 600, delay: 150, ease: 'easeOut' }" class="text-stone-600 text-sm sm:text-base">
              Gestiona los usuarios y sus roles dentro de la plataforma
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Barra de búsqueda -->
    <div v-motion :initial="{ opacity: 0, y: -10 }" :enter="{ opacity: 1, y: 0 }"
      :transition="{ duration: 500, delay: 200, ease: 'easeOut' }" class="mb-8">
      <div class="relative max-w-md">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input v-model="searchQuery" type="text" placeholder="Buscar por nombre, rol o email..."
          class="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200 shadow-sm" />
        <div v-if="searchQuery" class="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button @click="searchQuery = ''" class="p-1 rounded-full hover:bg-slate-100 transition-colors">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <p v-if="searchQuery" class="mt-2 text-sm text-slate-500">
        {{ filteredUsers.length }} resultado{{ filteredUsers.length !== 1 ? 's' : '' }}
      </p>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :transition="{ duration: 300 }"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-pulse">
        <div class="h-20 bg-slate-200 rounded-t-xl mb-6 -mx-6 -mt-6" />
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 bg-slate-200 rounded-2xl" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-200 rounded w-3/4" />
            <div class="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
        <div class="h-3 bg-slate-200 rounded w-full mb-2" />
        <div class="h-3 bg-slate-200 rounded w-2/3" />
      </div>
    </div>

    <!-- Estado de error -->
    <div v-else-if="error" v-motion :initial="{ opacity: 0, scale: 0.95 }" :enter="{ opacity: 1, scale: 1 }"
      :transition="{ duration: 400, ease: 'easeOut' }" class="text-center py-16">
      <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
        <svg class="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-slate-700 mb-1">Error al cargar usuarios</h3>
      <p class="text-slate-500 mb-4">{{ error }}</p>
      <button @click="retryFetch"
        class="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reintentar
      </button>
    </div>

    <!-- Grid de usuarios -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article v-for="(user, index) in filteredUsers" :key="user.id" v-motion
        :initial="{ opacity: 0, y: 30, scale: 0.95 }" :enter="{ opacity: 1, y: 0, scale: 1 }" :transition="{
          duration: 500,
          delay: 300 + index * 100,
          ease: 'easeOut',
        }" :hovered="{ scale: 1.02, y: -4 }"
        class="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
        <!-- Banner decorativo -->
        <div
          class="h-20 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 group-hover:from-violet-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300" />

        <div class="px-6 pb-6">
          <!-- Avatar -->
          <div class="relative -mt-10 mb-4">
            <div
              :class="`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarGradient(user.id)} flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-500/25 group-hover:shadow-xl group-hover:shadow-violet-500/30 group-hover:scale-105 transition-all duration-300`">
              {{ user.avatar }}
            </div>
          </div>

          <!-- Información del usuario -->
          <div class="space-y-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                {{ user.name }}
              </h3>
              <span
                :class="`inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`">
                {{ user.role }}
              </span>
            </div>

            <div class="flex items-center gap-2 text-slate-500 text-sm">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="truncate">{{ user.email }}</span>
            </div>
          </div>

          <!-- Acciones -->
          <div
            class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
            <span class="text-xs text-slate-400">ID: #{{ user.id.toString().padStart(3, '0') }}</span>
            <button @click="openUserModal(user)"
              class="flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">
              Ver perfil
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Estado vacío -->
    <div v-if="!loading && !error && filteredUsers.length === 0" v-motion :initial="{ opacity: 0, scale: 0.9 }"
      :enter="{ opacity: 1, scale: 1 }" :transition="{ duration: 400, ease: 'easeOut' }" class="text-center py-16">
      <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-slate-700 mb-1">
        {{ searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios disponibles' }}
      </h3>
      <p class="text-slate-500">
        {{ searchQuery ? 'Intenta con otros términos de búsqueda' : 'La lista de usuarios está vacía' }}
      </p>
    </div>

    <!-- Modal de Perfil de Usuario -->
    <BaseModal :is-open="isModalOpen" max-with-class="max-w-2xl" @close="closeModal">
      <!-- Header Slot -->
      <template #header>
        <div class="flex items-center gap-4">
          <div v-if="selectedUser"
            :class="`w-14 h-14 rounded-xl bg-gradient-to-br ${getAvatarGradient(selectedUser.id)} flex items-center justify-center text-white text-xl font-bold shadow-lg`">
            {{ selectedUser.avatar }}
          </div>
          <div>
            <h3 class="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              {{ selectedUser?.name }}
            </h3>
            <span
              :class="`inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30`">
              {{ selectedUser?.role }}
            </span>
          </div>
        </div>
      </template>

      <!-- Content Slot -->
      <template #content>
        <div v-if="selectedUser" class="space-y-6">
          <!-- Información de contacto -->
          <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <h4 class="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Información de Contacto
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex items-start gap-3">
                <div class="p-2 bg-violet-100 rounded-lg">
                  <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase">Correo Electrónico</p>
                  <p class="text-sm font-medium text-slate-800">{{ selectedUser.email }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase">Teléfono</p>
                  <p class="text-sm font-medium text-slate-800">{{ selectedUser.phone || 'No registrado' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Información personal -->
          <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <h4 class="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Información Personal
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex items-start gap-3">
                <div class="p-2 bg-emerald-100 rounded-lg">
                  <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a10 10 0 00-9-3m1.5 7.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase">Número de Identificación</p>
                  <p class="text-sm font-medium text-slate-800">{{ selectedUser.id_number || 'No registrado' }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-2 bg-rose-100 rounded-lg">
                  <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase">Fecha de Nacimiento</p>
                  <p class="text-sm font-medium text-slate-800">{{ formatDate(selectedUser.date_of_birth) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Información del sistema -->
          <div class="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
            <h4 class="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Información del Sistema
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex items-start gap-3">
                <div class="p-2 bg-slate-200 rounded-lg">
                  <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase">Registrado el</p>
                  <p class="text-sm font-medium text-slate-800">{{ formatDateTime(selectedUser.createdAt) }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-2 bg-slate-200 rounded-lg">
                  <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase">Última Actualización</p>
                  <p class="text-sm font-medium text-slate-800">{{ formatDateTime(selectedUser.updatedAt) }}</p>
                </div>
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-amber-200/50">
              <p class="text-xs text-slate-500">
                <span class="font-medium">ID de Usuario:</span> {{ selectedUser.id }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- Footer Slot -->
      <template #footer>
        <button type="button" @click="closeModal"
          class="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border-2 border-amber-300 rounded-xl hover:bg-amber-50 hover:border-amber-400 transition-all duration-300 active:scale-95">
          Cerrar
        </button>
        <button type="button"
          class="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 active:scale-95 shadow-lg shadow-amber-500/25">
          Editar Usuario
        </button>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped>
/* Estilos adicionales opcionales */
article {
  will-change: transform;
}
</style>
