<script setup lang="ts">
import { onMounted } from 'vue'



// 1. Contrato de Propiedades con Tapado Estricto (SOLID - ISP)
interface Props {
    title?: string
    message?: string
    mode?: 'fullscreen' | 'container'
    actionText?: string
    secondaryActionText?: string
    isRetrying?: boolean
    showSecondaryAction?: boolean
}


const props = withDefaults(defineProps<Props>(), {
    title: 'Ha ocurrido un error inesperado',
    message: 'No se pudieron cargar los datos solicitados, Por favor, intenta nuevamente.',
    actionText: 'Reintentar',
    secondaryActionText: 'Volver al inicio',
    isRetrying: false,
    showSecondaryAction: false,
});


// 2. Contrato de Eventos Emitidos
const emit = defineEmits<{
    (e: 'retry'): void
    (e: 'secondaryAction'): void
}>();

// UX Senior: Transferir automaticamente el foco al botón de reintentar
onMounted(() => {
    if (props.isRetrying) {
        const retryButton = document.querySelector('button[data-action="retry"]');
        if (retryButton) {
            (retryButton as HTMLElement).focus();
        }
    }
});
</script>

<template>
    <div role="alert" aria-live="assertive" :class="[
        'flex flex-col items-center justify-center p-8 text-center font-sans transition-all duration-300',
        props.mode === 'fullscreen'
            ? 'fixed inset-0 z-50 w-screen h-screen bg-[#FBF9F4] text-[#242321]'
            : 'w-full bg-[#FBF9F4] border border-red-100 rounded-lg shadow-sm my-4'
    ]">
        <div class="mb-5 flex items-center justify-center text-red-600 bg-red-50 p-3.5 rounded-full">
            <slot name="icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            </slot>
        </div>

        <h2 class="text-lg font-serif font-bold text-[#111110] tracking-wide max-w-md md:text-xl">
            {{ props.title }}
        </h2>

        <p class="mt-2 text-sm text-gray-500 max-w-sm leading-relaxed">
            {{ props.message }}
        </p>

        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-md">

            <button v-if="props.showSecondaryAction" type="button" :disabled="props.isRetrying"
                @click="emit('secondaryAction')"
                class="w-full sm:w-auto text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-[#111110] px-5 py-3 transition-colors duration-200 disabled:opacity-40 focus:outline-none">
                {{ props.secondaryActionText }}
            </button>

            <button ref="primaryButtonRef" type="button" :disabled="props.isRetrying" @click="emit('retry')"
                class="w-full sm:w-auto inline-flex items-center justify-center bg-[#111110] hover:bg-[#2C2A27] text-[#FBF9F4] text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded transition-all duration-200 disabled:opacity-60 shadow-sm min-w-[120px] focus:ring-2 focus:ring-offset-2 focus:ring-black">
                <svg v-if="props.isRetrying" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>

                <span>{{ props.isRetrying ? 'Cargando...' : props.actionText }}</span>
            </button>

        </div>
    </div>
</template>