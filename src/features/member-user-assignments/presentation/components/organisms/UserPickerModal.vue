<script setup lang="ts">
import BaseErrorDisplay from '@/utils/components/BaseErrorDisplay.vue'
import BaseLoading from '@/utils/components/BaseLoading.vue'
import BaseModal from '@/utils/components/BaseModal.vue'
import { watch } from 'vue'
import { useMemberUserUserCatalogStore } from '../../../application/stores/useMemberUserUserCatalogStore'
import UserPickerCard from '../molecules/UserPickerCard.vue'

const props = defineProps<{
  isOpen: boolean
  selectedUserId: string
}>()

const emit = defineEmits<{
  close: []
  select: [userId: string]
}>()

const userStore = useMemberUserUserCatalogStore()

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      userStore.setSearchQuery('')
      void userStore.fetchUsers()
    }
  },
)
</script>

<template>
  <BaseModal :is-open="isOpen" max-with-class="max-w-2xl" @close="emit('close')">
    <template #header>
      <h3 class="font-serif text-2xl font-bold tracking-wide text-white">Elegir usuario</h3>
      <p class="mt-1 text-sm text-amber-100/80">Esta cuenta será el ancla de esa persona en el sistema.</p>
    </template>
    <template #content>
      <div class="space-y-4">
        <input
          :value="userStore.searchQuery"
          type="search"
          placeholder="Consultar por nombre, documento o email..."
          class="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          @input="userStore.setSearchQuery(($event.target as HTMLInputElement).value)"
        >

        <div class="relative min-h-48">
          <BaseLoading :is-loading="userStore.isLoading" text="Cargando usuarios..." />

          <BaseErrorDisplay
            v-if="userStore.error && !userStore.isLoading"
            title="No se pudo abrir la lista"
            :message="userStore.error"
            mode="container"
            @retry="userStore.fetchUsers"
          />

          <div
            v-else-if="!userStore.isLoading && userStore.filteredUsers.length === 0"
            class="flex flex-col items-center justify-center py-12 text-center"
          >
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg class="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 class="mb-1 font-serif text-lg font-semibold text-stone-700">No hay coincidencias</h3>
            <p class="max-w-xs text-sm text-stone-400">
              {{ userStore.searchQuery ? 'Prueba con otro nombre, documento o email.' : 'Todavía no hay usuarios registrados para elegir.' }}
            </p>
          </div>

          <div v-else-if="!userStore.isLoading" class="space-y-3">
            <div
              v-for="(user, index) in userStore.filteredUsers"
              :key="user.id"
              v-motion
              :initial="{ opacity: 0, y: 12 }"
              :enter="{ opacity: 1, y: 0 }"
              :transition="{ duration: 320, delay: index * 55, ease: [0.16, 1, 0.3, 1] }"
            >
              <UserPickerCard
                :name="user.name_full"
                :document-number="user.id_number"
                :email="user.email"
                :is-selected="selectedUserId === user.id"
                @toggle="emit('select', user.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
