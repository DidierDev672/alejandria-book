<script setup lang="ts">
// ============================================================
// ORGANISM - Assigned workouts data table
// ============================================================

import type { MemberRoutine } from '../../../domain/entities/MemberRoutine.types'
import WorkoutTableRow from '../molecules/WorkoutTableRow.vue'

defineProps<{
  workouts: MemberRoutine[]
  memberNames?: Record<string, string>
  isSearching?: boolean
  searchQuery?: string
}>()

defineEmits<{
  (e: 'view', workout: MemberRoutine): void
  (e: 'edit', workout: MemberRoutine): void
  (e: 'delete', workout: MemberRoutine): void
}>()
</script>

<template>
  <div
    class="relative overflow-hidden rounded-3xl border border-amber-500/20
           bg-white/80 backdrop-blur-sm shadow-xl shadow-amber-100/60"
  >
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-amber-200/70 border-b border-amber-200">
            <th class="text-left px-6 py-4 text-xs font-bold text-stone-700 uppercase tracking-wider">
              Miembro
            </th>
            <th class="text-left px-6 py-4 text-xs font-bold text-stone-700 uppercase tracking-wider">
              Nombre
            </th>
            <th class="text-center px-4 py-4 text-xs font-bold text-stone-700 uppercase tracking-wider">
              Inicio
            </th>
            <th class="text-center px-4 py-4 text-xs font-bold text-stone-700 uppercase tracking-wider">
              Fin
            </th>
            <th class="text-center px-4 py-4 text-xs font-bold text-stone-700 uppercase tracking-wider">
              Estado
            </th>
            <th class="text-center px-4 py-4 text-xs font-bold text-stone-700 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-amber-50">
          <tr v-if="workouts.length === 0">
            <td colspan="6" class="px-6 py-14 text-center">
              <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p class="text-sm font-semibold text-stone-700 mb-1">
                {{ isSearching ? 'Sin resultados' : 'Sin rutinas asignadas' }}
              </p>
              <p class="text-xs text-stone-400 max-w-sm mx-auto">
                <template v-if="isSearching">
                  Ninguna rutina coincide con "{{ searchQuery }}"
                </template>
                <template v-else>
                  Cuando asignes una rutina a un gladiador, aparecerá aquí.
                </template>
              </p>
            </td>
          </tr>

          <WorkoutTableRow
            v-for="(workout, index) in workouts"
            :key="workout.id"
            :workout="workout"
            :member-name="memberNames?.[workout.member_id]"
            :index="index"
            @view="$emit('view', $event)"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>
