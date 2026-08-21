<script setup lang="ts">
import { watch } from 'vue'
import BaseModal from '@/utils/components/BaseModal.vue'
import BaseLoading from '@/utils/components/BaseLoading.vue'
import BaseErrorDisplay from '@/utils/components/BaseErrorDisplay.vue'
import { useAssignmentEquipmentCatalogStore } from '../../../application/stores/useAssignmentEquipmentCatalogStore'
import EquipmentPickerCard from '../molecules/EquipmentPickerCard.vue'

const props = defineProps<{
  isOpen: boolean
  selectedIds: string[]
}>()

const emit = defineEmits<{
  close: []
  toggle: [equipmentId: string]
}>()

const equipmentStore = useAssignmentEquipmentCatalogStore()

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      equipmentStore.setSearchQuery('')
      void equipmentStore.fetchEquipment()
    }
  },
)
</script>

<template>
  <BaseModal :is-open="isOpen" max-with-class="max-w-2xl" @close="emit('close')">
    <template #header>
      <h3 class="font-serif text-2xl font-bold tracking-wide text-white">Elegir equipos</h3>
      <p class="mt-1 text-sm text-amber-100/80">Marca todo lo que hará falta en la sesión.</p>
    </template>
    <template #content>
      <div class="space-y-4">
        <input
          :value="equipmentStore.searchQuery"
          type="search"
          placeholder="Consultar equipos por nombre o tipo..."
          class="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          @input="equipmentStore.setSearchQuery(($event.target as HTMLInputElement).value)"
        >

        <div class="relative min-h-48">
          <BaseLoading :is-loading="equipmentStore.isLoading" text="Cargando equipos..." />

        <BaseErrorDisplay
          v-if="equipmentStore.error && !equipmentStore.isLoading"
          title="No se pudo cargar la lista"
          :message="equipmentStore.error"
          mode="container"
          @retry="equipmentStore.fetchEquipment"
        />

        <div
          v-else-if="!equipmentStore.isLoading && equipmentStore.filteredEquipment.length === 0"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <h3 class="mb-1 font-serif text-lg font-semibold text-stone-700">No hay equipos</h3>
          <p class="max-w-xs text-sm text-stone-400">Ajusta la consulta o registra equipos en el inventario.</p>
        </div>

        <div v-else-if="!equipmentStore.isLoading" class="space-y-3">
          <div
            v-for="(item, index) in equipmentStore.filteredEquipment"
            :key="item.id"
            v-motion
            :initial="{ opacity: 0, y: 12 }"
            :enter="{ opacity: 1, y: 0 }"
            :transition="{ duration: 320, delay: index * 55, ease: [0.16, 1, 0.3, 1] }"
          >
            <EquipmentPickerCard
              :name="item.name"
              :type="item.type"
              :is-selected="selectedIds.includes(item.id)"
              @toggle="emit('toggle', item.id)"
            />
          </div>
        </div>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
