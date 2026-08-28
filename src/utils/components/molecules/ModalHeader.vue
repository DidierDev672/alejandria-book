<script lang="ts">

defineProps({
    title: {
        type: String,
        required: true,
    },
})

defineEmits(['close'])
</script>

<template>
    <div class="flex items-center justify-between p-6 border-b border-slate-100">
        <h3 class="text-lg font-semibold text-slate-800 tracking-tight">
            {{ title }}
        </h3>
        <button @click="$emit('close')" aria-label="Cerrar modal"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
</template>