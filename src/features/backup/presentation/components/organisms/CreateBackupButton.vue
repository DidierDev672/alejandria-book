<script setup>
import { ref } from 'vue'

const props = defineProps({
  isCreating: { type: Boolean, default: false },
})

const emit = defineEmits(['create'])

const backupName = ref('')
const showInput = ref(false)

const handleCreate = () => {
  emit('create', backupName.value || undefined)
  backupName.value = ''
  showInput.value = false
}

const toggleInput = () => {
  showInput.value = !showInput.value
  if (!showInput.value) {
    backupName.value = ''
  }
}
</script>

<template>
  <div v-motion :initial="{ opacity: 0, scale: 0.95 }" :enter="{ opacity: 1, scale: 1 }"
    :transition="{ duration: 0.2 }"
    class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5">
    
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-stone-800">Crear Respaldo</h3>
        <p class="text-xs text-stone-500">Genera una copia de seguridad de la base de datos</p>
      </div>
    </div>

    <div v-if="showInput" v-motion :initial="{ opacity: 0, height: 0 }" :enter="{ opacity: 1, height: 'auto' }"
      :transition="{ duration: 0.2 }" class="mb-4">
      <input
        v-model="backupName"
        type="text"
        placeholder="Nombre del respaldo (opcional)"
        class="w-full px-4 py-2.5 bg-white border-2 border-amber-200 rounded-xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
        @keyup.enter="handleCreate"
      />
    </div>

    <div class="flex gap-2">
      <button
        @click="handleCreate"
        :disabled="isCreating"
        class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/20 hover:shadow-xl rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="isCreating" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {{ isCreating ? 'Creando respaldo...' : 'Crear respaldo ahora' }}
      </button>
      <button
        @click="toggleInput"
        :disabled="isCreating"
        class="px-3 py-2.5 text-sm font-medium text-stone-600 bg-white border-2 border-stone-200 hover:border-amber-200 hover:bg-amber-50 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
      >
        <svg v-if="!showInput" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>
