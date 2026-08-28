<script setup lang="ts">
import BaseModal from '@/utils/components/BaseModal.vue'
import type { MemberUserAssignmentListItem } from '../../../domain/entities/MemberUserAssignment.types'
import { MemberUserAssignmentDomainService } from '../../../domain/services/MemberUserAssignmentDomainService'

defineProps<{
  isOpen: boolean
  assignment: MemberUserAssignmentListItem | null
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <BaseModal :is-open="isOpen" max-with-class="max-w-lg" :expandable="false" @close="$emit('close')">
    <template #header>
      <h3 class="font-serif text-2xl font-bold tracking-wide text-white">Detalle del vínculo</h3>
      <p class="mt-1 text-sm text-amber-100/80">Quién está unido a quién, con calma y completo.</p>
    </template>
    <template #content>
      <div v-if="assignment" class="space-y-5">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-stone-500">Usuario</p>
          <p class="mt-1 font-serif text-lg font-semibold text-stone-800">{{ assignment.userName }}</p>
          <p class="mt-0.5 font-mono text-xs text-stone-400">{{ assignment.id_user }}</p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-stone-500">Miembro</p>
          <p class="mt-1 font-serif text-lg font-semibold text-stone-800">{{ assignment.memberName }}</p>
          <p class="mt-0.5 font-mono text-xs text-stone-400">{{ assignment.member_id }}</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-stone-500">Creado</p>
            <p class="mt-1 text-sm text-stone-700">
              {{ MemberUserAssignmentDomainService.formatDateTime(assignment.created_at) }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-stone-500">Actualizado</p>
            <p class="mt-1 text-sm text-stone-700">
              {{ MemberUserAssignmentDomainService.formatDateTime(assignment.updated_at) }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
