<script setup lang="ts">
import { useAuthStore } from '@/features/auth/presentation/stores/authStore'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

const userName = computed(() => authStore.user?.name_full || 'Usuario')

// Item simple Dashboard
const dashboardItem = { label: 'Dashboard', icon: 'grid', route: '/dashboard' }

// Dropdown Alejandría
const alejandriaOpen = ref(false)
const alejandriaItems = [
  { label: 'Libros', icon: 'book', route: '/dashboard/books' },
  { label: 'Crear Libro', icon: 'book-plus', route: '/dashboard/books/create' },
  { label: 'Autores', icon: 'users', route: '/dashboard/authors' },
  { label: 'Crear nota', icon: 'note', route: '/dashboard/note' },
  { label: 'Bitácora de notas', icon: 'note-list', route: '/dashboard/notes' },
  { label: 'Crear Tema', icon: 'topic', route: '/dashboard/topic' },
  { label: 'Lista de temas', icon: 'topic-list', route: '/dashboard/topics' }
]

// Dropdown Usuario
const usuarioOpen = ref(false)
const usuarioItems = [
  { label: 'Crear usuarios', icon: 'user-plus', route: '/dashboard/users/create' },
  { label: 'Usuarios', icon: 'user-list', route: '/dashboard/users' }
]

// Dropdown Coliseo
const coliseoOpen = ref(false)
const coliseoItems = [
  { label: 'Crear equipo', icon: 'equipment', route: '/dashboard/coliseo/equipment/create' },
  { label: 'Lista de equipos', icon: 'equipment-list', route: '/dashboard/coliseo/equipment/list' },
  { label: 'Historial de ejercicios', icon: 'exercise-list', route: '/dashboard/coliseo/exercises' }
]

function toggleAlejandria() {
  alejandriaOpen.value = !alejandriaOpen.value
}

function toggleUsuario() {
  usuarioOpen.value = !usuarioOpen.value
}

function toggleColiseo() {
  coliseoOpen.value = !coliseoOpen.value
}

function navigateTo(path: string) {
  router.push(path)
  sidebarOpen.value = false;
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Overlay móvil -->
    <Transition enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        @click="sidebarOpen = false" />
    </Transition>

    <!-- ═══ SIDEBAR ═══ -->
    <aside v-motion v-if="sidebarOpen" :initial="{ opacity: 0, x: -80 }" :enter="{ opacity: 1, x: 0 }"
      :leave="{ opacity: 0, x: -80 }" :transition="{ duration: 300, ease: [0.16, 1, 0.3, 1] }"
      class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-amber-500/20 bg-stone-200/50 backdrop-blur-sm shadow-2xl shadow-black/40">
      <!-- Logo -->
      <div class="pointer-events-none absolute bottom-0 left-0 right-0 opacity-50">
        <svg width="256" height="200" viewBox="0 0 256 200" fill="none">
          <circle cx="20" cy="200" r="120" fill="#f59e0b" />
          <circle cx="200" cy="180" r="80" fill="#ea580c" />
        </svg>
      </div>

      <!-- Logo -->
      <div class="flex h-16 items-center gap-3 border-b border-amber-500/20 px-5">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
          <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <span class="font-serif text-lg font-bold tracking-tight text-amber-500">Alejandria</span>
          <p class="text-[10px] font-medium uppercase tracking-widest text-stone-500">Biblioteca Digital</p>
        </div>
      </div>

      <!-- Nav -->
      <nav class="relative flex-1 space-y-0.5 overflow-y-auto p-4">
        <!-- Dashboard Item Simple -->
        <button v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
          :transition="{ duration: 400, delay: 0, ease: [0.16, 1, 0.3, 1] }" type="button"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
          :class="route.path === dashboardItem.route
            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-500 shadow-sm ring-1 ring-amber-500/20'
            : 'text-stone-400 hover:bg-stone-800 hover:text-amber-100'" @click="navigateTo(dashboardItem.route)">
          <!-- Indicador activo -->
          <span v-if="route.path === dashboardItem.route"
            class="absolute left-0 h-7 w-1 rounded-r-full bg-gradient-to-b from-amber-400 to-orange-500" />

          <!-- Icono Grid -->
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          {{ dashboardItem.label }}
        </button>

        <!-- ═══ DROPDOWN ALEJANDRÍA ═══ -->
        <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
          :transition="{ duration: 400, delay: 50, ease: [0.16, 1, 0.3, 1] }" class="space-y-0.5">
          <button type="button"
            class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-stone-400 hover:bg-stone-800 hover:text-amber-100"
            @click="toggleAlejandria">
            <div class="flex items-center gap-3">
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Alejandría</span>
            </div>
            <svg class="h-4 w-4 shrink-0 transition-transform duration-300" :class="{ 'rotate-180': alejandriaOpen }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Subitems de Alejandría con Motion staggered -->
          <Transition enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2">
            <div v-if="alejandriaOpen" class="ml-4 space-y-0.5 border-l border-amber-500/20 pl-3">
              <button v-for="(item, index) in alejandriaItems" :key="item.route" v-motion
                :initial="{ opacity: 0, x: -15 }" :enter="{ opacity: 1, x: 0 }"
                :transition="{ duration: 300, delay: index * 60, ease: [0.16, 1, 0.3, 1] }" type="button"
                class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
                :class="route.path === item.route
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-500 shadow-sm ring-1 ring-amber-500/20'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-amber-100'" @click="navigateTo(item.route)">
                <!-- Indicador activo -->
                <span v-if="route.path === item.route"
                  class="absolute left-0 h-7 w-1 rounded-r-full bg-gradient-to-b from-amber-400 to-orange-500" />

                <!-- Icono Libro -->
                <svg v-if="item.icon === 'book'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <!-- Icono Book Plus -->
                <svg v-else-if="item.icon === 'book-plus'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20 12h-4m2-2v4" />
                </svg>
                <!-- Icono Users -->
                <svg v-else-if="item.icon === 'users'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <!-- Icono Note -->
                <svg v-else-if="item.icon === 'note'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <!-- Icono Note List -->
                <svg v-else-if="item.icon === 'note-list'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6M9 16h6" />
                </svg>
                <!-- Icono Topic -->
                <svg v-else-if="item.icon === 'topic'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <!-- Icono Topic List -->
                <svg v-else-if="item.icon === 'topic-list'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  <circle cx="9" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="9" cy="10" r="1.5" fill="currentColor" />
                  <circle cx="9" cy="14" r="1.5" fill="currentColor" />
                  <circle cx="9" cy="18" r="1.5" fill="currentColor" />
                </svg>
                {{ item.label }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- ═══ DROPDOWN USUARIO ═══ -->
        <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
          :transition="{ duration: 400, delay: 100, ease: [0.16, 1, 0.3, 1] }" class="space-y-0.5">
          <button type="button"
            class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-stone-400 hover:bg-stone-800 hover:text-amber-100"
            @click="toggleUsuario">
            <div class="flex items-center gap-3">
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Usuario</span>
            </div>
            <svg class="h-4 w-4 shrink-0 transition-transform duration-300" :class="{ 'rotate-180': usuarioOpen }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Subitems de Usuario con Motion staggered -->
          <Transition enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2">
            <div v-if="usuarioOpen" class="ml-4 space-y-0.5 border-l border-amber-500/20 pl-3">
              <button v-for="(item, index) in usuarioItems" :key="item.route" v-motion :initial="{ opacity: 0, x: -15 }"
                :enter="{ opacity: 1, x: 0 }"
                :transition="{ duration: 300, delay: index * 80, ease: [0.16, 1, 0.3, 1] }" type="button"
                class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
                :class="route.path === item.route
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-500 shadow-sm ring-1 ring-amber-500/20'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-amber-100'" @click="navigateTo(item.route)">
                <!-- Indicador activo -->
                <span v-if="route.path === item.route"
                  class="absolute left-0 h-7 w-1 rounded-r-full bg-gradient-to-b from-amber-400 to-orange-500" />

                <!-- Icono User Plus -->
                <svg v-if="item.icon === 'user-plus'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <!-- Icono User List -->
                <svg v-else-if="item.icon === 'user-list'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {{ item.label }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- ═══ DROPDOWN COLISEO ═══ -->
        <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
          :transition="{ duration: 400, delay: 150, ease: [0.16, 1, 0.3, 1] }" class="space-y-0.5">
          <button type="button"
            class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-stone-400 hover:bg-stone-800 hover:text-amber-100"
            @click="toggleColiseo">
            <div class="flex items-center gap-3">
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Coliseo</span>
            </div>
            <svg class="h-4 w-4 shrink-0 transition-transform duration-300" :class="{ 'rotate-180': coliseoOpen }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Subitems de Coliseo con Motion staggered -->
          <Transition enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2">
            <div v-if="coliseoOpen" class="ml-4 space-y-0.5 border-l border-amber-500/20 pl-3">
              <button v-for="(item, index) in coliseoItems" :key="item.route" v-motion :initial="{ opacity: 0, x: -15 }"
                :enter="{ opacity: 1, x: 0 }"
                :transition="{ duration: 300, delay: index * 80, ease: [0.16, 1, 0.3, 1] }" type="button"
                class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
                :class="route.path === item.route
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-500 shadow-sm ring-1 ring-amber-500/20'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-amber-100'" @click="navigateTo(item.route)">
                <!-- Indicador activo -->
                <span v-if="route.path === item.route"
                  class="absolute left-0 h-7 w-1 rounded-r-full bg-gradient-to-b from-amber-400 to-orange-500" />

                <!-- Icono equipment -->
                <svg v-if="item.icon === 'equipment'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <!-- Icono lista de equipos -->
                <svg v-else-if="item.icon === 'equipment-list'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <!-- Icono historial de ejercicios -->
                <svg v-else-if="item.icon === 'exercise-list'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {{ item.label }}
              </button>
            </div>
          </Transition>
        </div>
      </nav>

      <!-- Footer del sidebar -->
      <div class="relative border-t border-amber-500/20 p-4">
        <button type="button"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 hover:ring-1 hover:ring-red-500/20"
          @click="logout">
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- ═══ MAIN ═══ -->
    <div :class="sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'">
      <!-- Header -->
      <header
        class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-amber-200/40 bg-white/90 px-4 shadow-sm backdrop-blur-md sm:px-6">
        <button type="button" class="rounded-xl p-2 text-gray-500 transition hover:bg-amber-50 hover:text-amber-700"
          aria-label="Toggle sidebar" @click="sidebarOpen = !sidebarOpen">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div class="flex-1" />

        <span class="hidden text-sm font-medium text-gray-700 sm:inline">{{ userName }}</span>
        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-xs font-bold text-white shadow-sm">
          {{ userName.charAt(0).toUpperCase() }}
        </div>
      </header>

      <!-- Content -->
      <main class="p-4 sm:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
