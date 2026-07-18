<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useAiConfigStore } from '../../config/aiConfigStore';
import type { AiConfig } from '@/stores/chatStore';

const aiStore = useAiConfigStore();

const form = ref<AiConfig>({
  provider: 'ollama',
  baseUrl: 'http://localhost:11434',
  model: '',
  apiKey: '',
});

const isTesting = ref(false);
const testError = ref<string | null>(null);
const testSuccess = ref(false);

// Load existing config when modal opens
watch(() => aiStore.isConfigOpen, (open) => {
  if (open && aiStore.config) {
    form.value = { ...aiStore.config };
  }
  testError.value = null;
  testSuccess.value = false;
});

const handleTest = async () => {
  isTesting.value = true;
  testError.value = null;
  testSuccess.value = false;

  const result = await aiStore.testConnection(form.value);

  isTesting.value = false;
  if (result.ok) {
    testSuccess.value = true;
  } else {
    testError.value = result.error ?? 'No se pudo conectar con el modelo.';
  }
};

const handleSave = () => {
  aiStore.save(form.value);
  aiStore.closeConfig();
};

const handleClose = () => {
  aiStore.closeConfig();
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && aiStore.isConfigOpen) handleClose();
};

onMounted(() => window.addEventListener('keydown', handleEscape));
onUnmounted(() => window.removeEventListener('keydown', handleEscape));
</script>

<template>
  <Teleport to="body">
    <div v-if="aiStore.isConfigOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 250 } }"
        :leave="{ opacity: 0, transition: { duration: 200 } }"
        class="absolute inset-0 bg-black/40 backdrop-blur-md" @click="handleClose" />

      <!-- Modal -->
      <div v-motion :initial="{ opacity: 0, scale: 0.85 }"
        :enter="{ opacity: 1, scale: 1, transition: { duration: 350, ease: [0.16, 1, 0.3, 1] } }"
        :leave="{ opacity: 0, scale: 0.85, transition: { duration: 250 } }"
        class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-amber-100/60 overflow-hidden">

        <!-- Header -->
        <div class="relative bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-8">
          <div class="absolute inset-0 opacity-10">
            <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <pattern id="ai-config-pattern" x="0" y="0" width="80" height="80"
                  patternUnits="userSpaceOnUse">
                  <rect x="10" y="10" width="15" height="50" fill="white" opacity="0.3" rx="2" />
                  <rect x="30" y="10" width="15" height="55" fill="white" opacity="0.2" rx="2" />
                  <rect x="50" y="10" width="15" height="45" fill="white" opacity="0.3" rx="2" />
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#ai-config-pattern)" />
            </svg>
          </div>

          <div class="relative z-10 flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <p class="text-amber-100 text-xs font-medium uppercase tracking-widest mb-2">Configuración</p>
              <h3 class="text-2xl font-serif font-bold text-white tracking-wide">
                Modelo de IA
              </h3>
              <p class="text-amber-100/70 text-sm mt-1">
                Configura el modelo para procesar investigaciones
              </p>
            </div>
            <button type="button" @click="handleClose"
              class="flex-shrink-0 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Cerrar modal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" class="drop-shadow">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Form -->
        <div class="px-6 py-6 space-y-5">
          <!-- Proveedor -->
          <div class="space-y-2">
            <label class="block text-xs font-black text-stone-500 uppercase tracking-[0.15em]">Proveedor</label>
            <div class="grid grid-cols-2 gap-3">
              <button type="button"
                @click="form.provider = 'ollama'; form.baseUrl = 'http://localhost:11434'"
                class="flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 active:scale-95"
                :class="form.provider === 'ollama'
                  ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-sm shadow-amber-200/60'
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:border-amber-200 hover:bg-amber-50/40'">
                <span class="text-xl">&#x1F999;</span>
                <span>Ollama</span>
                <span class="text-[10px] font-normal text-stone-400">llama3, mistral...</span>
              </button>
              <button type="button"
                @click="form.provider = 'openai-compat'; form.baseUrl = 'http://localhost:1234'"
                class="flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 active:scale-95"
                :class="form.provider === 'openai-compat'
                  ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-sm shadow-amber-200/60'
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:border-amber-200 hover:bg-amber-50/40'">
                <span class="text-xl">&#x26A1;</span>
                <span>OpenAI-compatible</span>
                <span class="text-[10px] font-normal text-stone-400">LM Studio, Jan...</span>
              </button>
            </div>
          </div>

          <!-- URL base -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span
                class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shrink-0">
                <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </span>
              <label class="text-xs font-black text-stone-500 uppercase tracking-[0.15em]">URL base</label>
            </div>
            <input v-model="form.baseUrl" type="text"
              :placeholder="form.provider === 'ollama' ? 'http://localhost:11434' : 'http://localhost:1234'"
              class="w-full bg-amber-50/40 border-2 border-amber-200/60 rounded-xl px-5 py-3.5 text-sm text-stone-700 placeholder-stone-400 font-mono focus:outline-none focus:bg-white focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/10 hover:border-amber-300 transition-all duration-200" />
          </div>

          <!-- Modelo -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span
                class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shrink-0">
                <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <label class="text-xs font-black text-stone-500 uppercase tracking-[0.15em]">Nombre del modelo</label>
            </div>
            <input v-model="form.model" type="text"
              :placeholder="form.provider === 'ollama' ? 'llama3, mistral, gemma2...' : 'nombre-del-modelo'"
              class="w-full bg-amber-50/40 border-2 border-amber-200/60 rounded-xl px-5 py-3.5 text-sm text-stone-700 placeholder-stone-400 font-mono focus:outline-none focus:bg-white focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/10 hover:border-amber-300 transition-all duration-200" />
          </div>

          <!-- API Key -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span
                class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shrink-0">
                <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </span>
              <label class="text-xs font-black text-stone-500 uppercase tracking-[0.15em]">
                API Key
                <span class="text-stone-300 font-normal normal-case ml-1">(opcional)</span>
              </label>
            </div>
            <input v-model="form.apiKey" type="password" placeholder="sk-... o vacío para modelos locales"
              class="w-full bg-amber-50/40 border-2 border-amber-200/60 rounded-xl px-5 py-3.5 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/10 hover:border-amber-300 transition-all duration-200" />
          </div>

          <!-- Test feedback -->
          <div v-if="testError"
            class="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            <svg class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p class="text-xs text-rose-600 leading-relaxed">{{ testError }}</p>
          </div>

          <div v-else-if="testSuccess"
            class="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p class="text-xs text-emerald-600 font-medium">Conexion exitosa con el modelo</p>
          </div>

          <!-- Divider -->
          <div class="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

          <!-- Actions -->
          <div class="flex justify-end gap-3">
            <button type="button" @click="handleClose"
              class="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border-2 border-amber-300 rounded-xl hover:bg-amber-50 hover:border-amber-400 transition-all duration-300 active:scale-95">
              Cancelar
            </button>
            <button type="button" @click="handleTest" :disabled="isTesting || !form.model.trim() || !form.baseUrl.trim()"
              class="px-5 py-2.5 text-sm font-bold text-amber-700 bg-amber-100 border-2 border-amber-300 rounded-xl hover:bg-amber-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
              {{ isTesting ? 'Probando...' : 'Probar conexion' }}
            </button>
            <button type="button" @click="handleSave" :disabled="!form.model.trim() || !form.baseUrl.trim()"
              class="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
