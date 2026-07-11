<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMemberStore } from '@/features/members/application/stores/useMemberStore'
import type { Member } from '@/features/members/domain/entities/Member.types'

interface Props { isOpen: boolean }
interface Emits {
  (e: 'select', member: Member): void
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const memberStore = useMemberStore()
const search = ref('')
const selectedIndex = ref(0)

const filteredMembers = computed(() => {
  if (!search.value.trim()) return memberStore.members
  const q = search.value.trim().toLowerCase()
  return memberStore.members.filter(m =>
    m.name_full.toLowerCase().includes(q) || m.number_document.toLowerCase().includes(q)
  )
})

function select(member: Member) {
  emit('select', member)
  search.value = ''
}

function close() {
  search.value = ''
  emit('close')
}

onMounted(async () => {
  if (!memberStore.hasMembers) await memberStore.fetchMembers()
})
</script>
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-md" @click="close" />
      <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-100/60 overflow-hidden max-h-[90vh] flex flex-col">
        <div class="relative bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-serif text-xl font-bold text-white">Seleccionar Miembro</h3>
              <p class="text-xs text-amber-100/70 mt-0.5">Busca y selecciona un gladiador del Coliseo</p>
            </div>
            <button type="button" @click="close" class="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div class="mt-4 relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input v-model="search" type="text" placeholder="Buscar por nombre o documento..."
              class="w-full pl-10 pr-4 py-2.5 text-sm border border-white/20 rounded-xl bg-white/10 text-white placeholder-amber-200/70 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all" />
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-2">
          <div v-if="memberStore.isLoading" class="flex items-center justify-center py-8">
            <div class="w-6 h-6 border-2 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
            <span class="ml-2 text-sm text-stone-400">Cargando...</span>
          </div>
          <div v-else-if="filteredMembers.length === 0" class="text-center py-8">
            <p class="text-sm text-stone-400">No se encontraron gladiadores</p>
          </div>
          <button v-for="member in filteredMembers" :key="member.id" type="button"
            @click="select(member)"
            class="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-300 transition-all text-left active:scale-[0.99]"
          >
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/30 to-orange-500/20 border border-amber-200 flex items-center justify-center shrink-0">
              <span class="text-xs font-bold text-amber-700">{{ member.name_full?.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-stone-800 text-sm truncate">{{ member.name_full }}</p>
              <p class="text-xs text-stone-400 font-mono">{{ member.number_document }}</p>
            </div>
            <svg class="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>