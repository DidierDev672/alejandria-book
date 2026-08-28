<script lang="ts">
import { onMounted, onUnmounted } from 'vue';


const props = defineProps({
    isOpen: { type: Boolean, required: true },
    title: { type: String, default: '' },
    closeOnBackdrop: { type: Boolean, default: true }
});

const emit = defineEmits(['close'])

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
        emit('close');
    }
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <!-- Backdrop -->
            <BaseBackdrop @click="closeOnBackdrop && $emit('close')" />

            <!-- Contenedor del Modal con Motion Animado -->
            <div role="dialog" aria-modal="true"
                class="relative z-50 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
                v-motion :initial="{ opacity: 0, scale: 0.95, y: 15 }"
                :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 300, type: 'spring', stiffness: 250, damping: 25 } }"
                :leave="{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 200, ease: 'easeIn' } }">
                <!-- Header -->
                <ModalHeader v-if="title" :title="title" @close="$emit('close')" />

                <!-- Cuerpo del Modal -->
                <div class="p-6 text-slate-600 space-y-4">
                    <slot />
                </div>

                <!-- Footer Opcional -->
                <div v-if="$slots.footer"
                    class="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                    <slot name="footer" />
                </div>
            </div>
        </div>
    </Teleport>
</template>