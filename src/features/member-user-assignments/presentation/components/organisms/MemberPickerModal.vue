<script setup lang="ts">
import BaseErrorDisplay from '@/utils/components/BaseErrorDisplay.vue'
import BaseLoading from '@/utils/components/BaseLoading.vue'
import BaseModal from '@/utils/components/BaseModal.vue'
import { watch } from 'vue'
import { useMemberUserMemberCatalogStore } from '../../../application/stores/useMemberUserMemberCatalogStore'
import { MemberUserAssignmentDomainService } from '../../../domain/services/MemberUserAssignmentDomainService'
import MemberPickerCard from '../molecules/MemberPickerCard.vue'

const props = defineProps<{
  isOpen: boolean
  selectedMemberId: string
}>()

const emit = defineEmits<{
  close: []
  select: [memberId: string]
}>()

const memberStore = useMemberUserMemberCatalogStore()

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      memberStore.setSearchQuery('')
      void memberStore.fetchMembers()
    }
  },
)
</script>

<template>
  <BaseModal :is-open="isOpen" max-with-class="max-w-2xl" @close="emit('close')">
    <template #header>
      <h3 class="font-serif text-2xl font-bold tracking-wide text-white">Elegir miembro</h3>
      <p class="mt-1 text-sm text-amber-100/80">Márcalo con calma. Un gladiador a la vez basta.</p>
    </template>
    <template #content>
      <div class="space-y-4">
        <input
          :value="memberStore.searchQuery"
          type="search"
          placeholder="Consultar por nombre, documento o teléfono..."
          class="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          @input="memberStore.setSearchQuery(($event.target as HTMLInputElement).value)"
        >

        <div class="relative min-h-48">
          <BaseLoading :is-loading="memberStore.isLoading" text="Cargando miembros..." />

          <BaseErrorDisplay
            v-if="memberStore.error && !memberStore.isLoading"
            title="No se pudo abrir el censo"
            :message="memberStore.error"
            mode="container"
            @retry="memberStore.fetchMembers"
          />

          <div
            v-else-if="!memberStore.isLoading && memberStore.filteredMembers.length === 0"
            class="flex flex-col items-center justify-center py-12 text-center"
          >
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg class="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="mb-1 font-serif text-lg font-semibold text-stone-700">No hay coincidencias</h3>
            <p class="max-w-xs text-sm text-stone-400">
              {{ memberStore.searchQuery ? 'Prueba con otro nombre, documento o teléfono.' : 'Todavía no hay miembros para elegir.' }}
            </p>
          </div>

          <div v-else-if="!memberStore.isLoading" class="space-y-3">
            <div
              v-for="(member, index) in memberStore.filteredMembers"
              :key="member.id"
              v-motion
              :initial="{ opacity: 0, y: 12 }"
              :enter="{ opacity: 1, y: 0 }"
              :transition="{ duration: 320, delay: index * 55, ease: [0.16, 1, 0.3, 1] }"
            >
              <MemberPickerCard
                :name="member.name_full"
                :document-label="MemberUserAssignmentDomainService.documentLabel(member.type_document, member.number_document)"
                :phone="member.phone_number"
                :is-selected="selectedMemberId === member.id"
                @toggle="emit('select', member.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
