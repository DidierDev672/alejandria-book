<script setup lang="ts">
import { watch } from 'vue'
import { useAssignRolesUserStore, type UserListItem } from '../../../application/stores/useAssignRolesUserStore'
import UserListItemMolecule from '../molecules/UserListItem.vue'

interface User {
  id: string
  name_full: string
  phone: string
}

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  select: [user: User]
}>()

const store = useAssignRolesUserStore()

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && !store.hasUsers) {
      store.fetchUsers()
    }
  }
)

function handleToggle(userId: string): void {
  const user = store.users?.find((u) => u.id === userId)
  if (user) {
    emit('select', { id: user.id, name_full: user.name_full, phone: user.phone })
    emit('close')
  }
}

function handleClose(): void {
  store.setSearchQuery('')
  emit('close')
}

function handleBackdropClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="handleBackdropClick"
      >
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="isOpen"
            class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
          >
            <!-- Header -->
            <div class="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-lg font-serif font-bold text-white">Seleccionar Usuario</h2>
                    <p class="text-amber-100 text-xs">{{ store.users?.length || 0 }} usuarios disponibles</p>
                  </div>
                </div>
                <button
                  type="button"
                  class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  @click="handleClose"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Search -->
            <div class="px-6 py-4 border-b border-stone-200">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  v-model="store.searchQuery"
                  type="text"
                  placeholder="Buscar por nombre o teléfono..."
                  class="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-stone-200 bg-stone-50 text-stone-800 placeholder:text-stone-400 transition-all duration-200 focus:outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <!-- Content -->
            <div class="px-6 py-4 max-h-96 overflow-y-auto">
              <!-- Loading -->
              <div v-if="store.isLoading" class="flex flex-col items-center justify-center py-12">
                <svg class="animate-spin h-10 w-10 text-amber-500 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-stone-500 text-sm">Cargando usuarios...</p>
              </div>

              <!-- Error -->
              <div v-else-if="store.error" class="text-center py-12">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-red-600 font-medium">{{ store.error }}</p>
                <button
                  type="button"
                  class="mt-4 px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 hover:underline"
                  @click="store.fetchUsers()"
                >
                  Reintentar
                </button>
              </div>

              <!-- Empty state -->
              <div v-else-if="store.filteredUsers.length === 0" class="text-center py-12">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
                  <svg class="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p class="text-stone-600 font-medium">
                  {{ store.searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios disponibles' }}
                </p>
                <p class="text-stone-400 text-sm mt-1">
                  {{ store.searchQuery ? 'Intenta con otros términos' : 'Registra un usuario primero' }}
                </p>
              </div>

              <!-- User list -->
              <div v-else class="space-y-2">
                <UserListItemMolecule
                  v-for="user in store.filteredUsers"
                  :key="user.id"
                  :id="user.id"
                  :name="user.name_full"
                  :phone="user.phone"
                  :is-selected="false"
                  @toggle="handleToggle"
                />
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-stone-200 bg-stone-50">
              <div class="flex items-center justify-between">
                <p class="text-sm text-stone-500">
                  <span class="font-medium text-stone-700">{{ store.filteredUsers.length }}</span>
                  resultado{{ store.filteredUsers.length !== 1 ? 's' : '' }}
                </p>
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-stone-700 bg-white border-2 border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all duration-200"
                  @click="handleClose"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
