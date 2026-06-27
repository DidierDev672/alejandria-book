<script setup lang="ts">
// 1. Contrato de Propiedades con Tipado Estricto (SOLID - ISP)
interface Props {
    title: string;
    description: string;
    buttonText?: string;
}


const props = withDefaults(defineProps<Props>(), {
    buttonText: '',
});


// 2. Definición del evento que notificará al componente padre
const emit = defineEmits<{
    (e: 'action'): void
}>();
</script>


<template>
    <div
        class="w-full max-w-xl mx-auto my-8 p-10 flex flex-col items-center justify-center text-center bg-[#FBF9F4] border-2 border-dashed border-[#DDD7CD] rounded-xl font-sans text-[#242321] transition-all duration-300 hover:border-[#111110]/30">
        <div class="mb-5 text-[#5C554A] flex items-center justify-center">
            <slot name="icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                    <path
                        d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z">
                    </path>
                </svg>
            </slot>
        </div>

        <h3 class="text-lg font-serif font-bold text-[#111110] tracking-wide">
            {{ props.title }}
        </h3>

        <p class="mt-2 text-sm text-gray-500 max-w-sm leading-relaxed">
            {{ props.description }}
        </p>

        <div v-if="$slots.default" class="mt-4 w-full">
            <slot />
        </div>

        <div v-if="props.buttonText" class="mt-8 w-full sm:w-auto">
            <button type="button" @click="emit('action')"
                class="w-full sm:w-auto bg-[#111110] hover:bg-[#2C2A27] text-[#FBF9F4] text-xs font-semibold uppercase tracking-widest px-6 py-3.5 rounded-md transition-all duration-300 shadow-sm active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                {{ props.buttonText }}
            </button>
        </div>
    </div>
</template>