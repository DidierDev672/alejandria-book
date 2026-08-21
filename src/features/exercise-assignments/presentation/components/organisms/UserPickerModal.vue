<script setup lang="ts">
import { watch } from 'vue'
import BaseModal from '@/utils/components/BaseModal.vue'
import BaseLoading from '@/utils/components/BaseLoading.vue'
import BaseErrorDisplay from '@/utils/components/BaseErrorDisplay.vue'
import { useAssignmentUserCatalogStore } from '../../../application/stores/useAssignmentUserCatalogStore'
import UserPickerCard from '../molecules/UserPickerCard.vue'

const props = defineProps<{
  isOpen: boolean
  selectedUserId: string
}>()

const emit = defineEmits<{
  close: []
  select: [userId: string]
}>()

const userStore = useAssignmentUserCatalogStore()

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
      <p class="mt-1 text-sm text-amber-100/80">Un solo gladiador a la vez. Márcalo y sigue.</p>
    </template>
    <template #content>
      <div class="space-y-4">
        <input
          :value="userStore.searchQuery"
          type="search"
          placeholder="Consultar por nombre, teléfono o documento..."
          class="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          @input="userStore.setSearchQuery(($event.target as HTMLInputElement).value)"
        >

        <div class="relative min-h-48">
        <BaseLoading :is-loading="userStore.isLoading" text="Cargando usuarios..." />

        <BaseErrorDisplay
          v-if="userStore.error && !userStore.isLoading"
          title="No se pudo cargar la lista"
          :message="userStore.error"
          mode="container"
          @retry="userStore.fetchUsers"
        />

        <div
          v-else-if="!userStore.isLoading && userStore.filteredUsers.length === 0"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <h3 class="mb-1 font-serif text-lg font-semibold text-stone-700">No hay coincidencias</h3>
          <p class="max-w-xs text-sm text-stone-400">Prueba con otro nombre, teléfono o documento.</p>
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
              :phone="user.phone"
              :document-number="user.id_number"
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
