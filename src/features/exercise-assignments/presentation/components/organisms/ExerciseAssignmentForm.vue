<script setup lang="ts">
import BaseInput from '@/utils/components/BaseInput.vue'
import { ref } from 'vue'
import { useAssignmentEquipmentCatalogStore } from '../../../application/stores/useAssignmentEquipmentCatalogStore'
import { useAssignmentExerciseCatalogStore } from '../../../application/stores/useAssignmentExerciseCatalogStore'
import { useAssignmentUserCatalogStore } from '../../../application/stores/useAssignmentUserCatalogStore'
import { useExerciseAssignmentFormStore } from '../../../application/stores/useExerciseAssignmentFormStore'
import AssignmentSwitch from '../atoms/AssignmentSwitch.vue'
import EquipmentBadge from '../molecules/EquipmentBadge.vue'
import SelectedExerciseChip from '../molecules/SelectedExerciseChip.vue'
import SelectedUserBadge from '../molecules/SelectedUserBadge.vue'
import EquipmentPickerModal from './EquipmentPickerModal.vue'
import ExercisePickerModal from './ExercisePickerModal.vue'
import UserPickerModal from './UserPickerModal.vue'

const formStore = useExerciseAssignmentFormStore()
const userStore = useAssignmentUserCatalogStore()
const exerciseStore = useAssignmentExerciseCatalogStore()
const equipmentStore = useAssignmentEquipmentCatalogStore()

const isUserModalOpen = ref(false)
const isExerciseModalOpen = ref(false)
const isEquipmentModalOpen = ref(false)

function handleSelectUser(userId: string): void {
  if (formStore.draft.id_user === userId) {
    formStore.clearUser()
    return
  }
  const user = userStore.findById(userId)
  if (user) formStore.selectUser(user)
}

function handleToggleExercise(exerciseId: string): void {
  const exercise = exerciseStore.exercises.find((item) => item.id === exerciseId)
  if (exercise) formStore.toggleExercise(exercise)
}

function handleToggleEquipment(equipmentId: string): void {
  const item = equipmentStore.equipment.find((equipment) => equipment.id === equipmentId)
  if (item) formStore.toggleEquipment(item)
}
</script>

<template>
  <form @submit.prevent>
    <header class="relative overflow-hidden px-5 py-6 sm:px-8 sm:py-7">
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/80 to-transparent" />
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 opacity-90"
      />
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-600/25 via-transparent to-orange-900/20" />
      <div class="pointer-events-none absolute right-0 top-0 opacity-20">
        <svg width="200" height="130" viewBox="0 0 200 130" fill="none" aria-hidden="true">
          <circle cx="180" cy="-10" r="95" fill="#FDE68A" />
          <circle cx="140" cy="35" r="48" fill="#FB923C" />
        </svg>
      </div>
      <div class="pointer-events-none absolute -bottom-8 -left-6 opacity-15">
        <svg width="140" height="90" viewBox="0 0 140 90" fill="none" aria-hidden="true">
          <circle cx="10" cy="90" r="70" fill="#F59E0B" />
        </svg>
      </div>

      <div class="relative flex items-start gap-3">
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.6 }"
          :enter="{ opacity: 1, scale: 1, transition: { delay: 220, duration: 420, ease: [0.16, 1, 0.3, 1] } }"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-lg shadow-orange-900/20 ring-1 ring-white/30"
        >
          <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/90">
            Coliseo · Asignación
          </p>
          <h2 class="mt-1 font-serif text-xl font-bold leading-tight text-white sm:text-2xl">
            Asignar ejercicios a los gladiadores y usuarios
          </h2>
          <p class="mt-1 max-w-xl text-xs leading-relaxed text-amber-50/80 sm:text-sm">
            No estás rellenando un formulario: estás eligiendo el siguiente paso de alguien. Primero a la persona, luego los movimientos que lo van a acompañar y el equipo que hará el trabajo. Puedes dejar ejercicios o equipos vacíos; nosotros los guardaremos como lista en blanco.
          </p>
        </div>
      </div>
    </header>

    <div class="space-y-6 px-5 py-6 sm:px-8 sm:pb-2">
      <div>
      <div class="flex items-start gap-3">
        <div class="min-w-0 flex-1">
          <BaseInput
            v-model="formStore.userIdDisplay"
            label="ID de usuario"
            placeholder="Selecciona un usuario registrado"
            helper-text="Obligatorio. Debe existir en el sistema."
            :error="formStore.validationErrors.id_user"
            required
          />
        </div>
        <button
          type="button"
          class="mt-1 inline-flex h-[52px] shrink-0 items-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
          @click="isUserModalOpen = true"
        >
          Buscar
        </button>
      </div>
      <div v-if="formStore.selectedUser" class="mt-3 flex flex-wrap gap-2">
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.85, y: 6 }"
          :enter="{ opacity: 1, scale: 1, y: 0 }"
          :transition="{ duration: 320, delay: 40, ease: [0.16, 1, 0.3, 1] }"
        >
          <SelectedUserBadge
            :name="formStore.selectedUser.name_full"
            @remove="formStore.clearUser()"
          />
        </div>
      </div>
    </div>

    <div>
      <div class="flex items-start gap-3">
        <div class="min-w-0 flex-1">
          <BaseInput
            :model-value="formStore.exerciseIdsDisplay"
            label="ID de ejercicios"
            placeholder="Se guarda como lista vacía si no eliges ninguno"
            helper-text="Puedes dejarlo vacío. Si no hay selección, se enviará []."
            :show-clear="false"
          />
        </div>
        <button
          type="button"
          class="mt-1 inline-flex h-[52px] shrink-0 items-center gap-2 rounded-xl border border-amber-600 px-4 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
          @click="isExerciseModalOpen = true"
        >
          Buscar
        </button>
      </div>
      <div v-if="formStore.selectedExercises.length > 0" class="mt-3 flex flex-wrap gap-2">
        <div
          v-for="(exercise, index) in formStore.selectedExercises"
          :key="exercise.id"
          v-motion
          :initial="{ opacity: 0, scale: 0.85, y: 6 }"
          :enter="{ opacity: 1, scale: 1, y: 0 }"
          :transition="{ duration: 320, delay: index * 55, ease: [0.16, 1, 0.3, 1] }"
        >
          <SelectedExerciseChip
            :name="exercise.name"
            @remove="formStore.removeExercise(exercise.id)"
          />
        </div>
      </div>
    </div>

    <div>
      <div class="flex items-start gap-3">
        <div class="min-w-0 flex-1">
          <BaseInput
            :model-value="formStore.equipmentIdsDisplay"
            label="ID de equipos"
            placeholder="Se guarda como lista vacía si no eliges ninguno"
            helper-text="Puedes dejarlo vacío. Si no hay selección, se enviará []."
            :show-clear="false"
          />
        </div>
        <button
          type="button"
          class="mt-1 inline-flex h-[52px] shrink-0 items-center gap-2 rounded-xl border border-amber-600 px-4 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
          @click="isEquipmentModalOpen = true"
        >
          Buscar
        </button>
      </div>
      <div v-if="formStore.selectedEquipment.length > 0" class="mt-3 flex flex-wrap gap-2">
        <EquipmentBadge
          v-for="item in formStore.selectedEquipment"
          :key="item.id"
          :name="item.name"
          @remove="formStore.removeEquipment(item.id)"
        />
      </div>
    </div>

    <div class="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div>
        <p class="text-sm font-medium text-stone-800">Asignación activa</p>
        <p class="text-xs text-stone-500">Por defecto queda encendida. Apágala si todavía no debe aplicarse.</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold uppercase tracking-wide" :class="formStore.isActive ? 'text-green-700' : 'text-stone-500'">
          {{ formStore.isActive ? 'Activo' : 'Inactivo' }}
        </span>
        <AssignmentSwitch v-model="formStore.isActive" />
      </div>
    </div>
    </div>

    <UserPickerModal
      :is-open="isUserModalOpen"
      :selected-user-id="formStore.draft.id_user"
      @close="isUserModalOpen = false"
      @select="handleSelectUser"
    />
    <ExercisePickerModal
      :is-open="isExerciseModalOpen"
      :selected-ids="formStore.draft.id_exercise"
      @close="isExerciseModalOpen = false"
      @toggle="handleToggleExercise"
    />
    <EquipmentPickerModal
      :is-open="isEquipmentModalOpen"
      :selected-ids="formStore.draft.id_equipment"
      @close="isEquipmentModalOpen = false"
      @toggle="handleToggleEquipment"
    />
  </form>
</template>
