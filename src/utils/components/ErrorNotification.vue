<script setup lang="ts">
import { animateMini, stagger } from 'motion';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';


// Props definidas con TypeScript
interface ErrorNotificationProps {
    message?: string;
    title?: string;
    type?: 'error' | 'warning' | 'success' | 'info';
    duration?: number;
    onClose?: () => void;
    showIcon?: boolean;
}


const props = withDefaults(defineProps<ErrorNotificationProps>(), {
    message: '',
    title: '',
    type: 'error',
    duration: 5000,
    onClose: () => { },
    showIcon: true,
});


// Estado reactivo
const isVisible = ref(true);
const notificationRef = ref<HTMLElement | null>(null);
const childrenElements = ref<Element[]>([]);


// Configuracion de colores basados en paleta BookStore
const themes = {
    error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        iconBg: 'bg-red-100',
        textPrimary: 'text-red-800',
        textSecondary: 'text-red-600',
        buttonBg: 'bg-red-600',
        buttonHover: 'hover:bg-red-700',
        accentColor: '#dc2626',
    },
    warning: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        iconBg: 'bg-amber-100',
        textPrimary: 'text-amber-800',
        textSecondary: 'text-amber-600',
        buttonBg: 'bg-amber-600',
        buttonHover: 'hover:bg-amber-700',
        accentColor: '#d97706',
    },
    success: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        textPrimary: 'text-emerald-800',
        textSecondary: 'text-emerald-600',
        buttonBg: 'bg-emerald-600',
        buttonHover: 'hover:bg-emerald-700',
        accentColor: '#059669',
    },
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        textPrimary: 'text-blue-800',
        textSecondary: 'text-blue-600',
        buttonBg: 'bg-blue-600',
        buttonHover: 'hover:bg-blue-700',
        accentColor: '#2563eb',
    },
} as const

const themeConfig = computed(() => themes[props.type] ?? themes.error)

// Iconos SVG
const icons = {
    error: `
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
      <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836c-.311 1.243-1.035 2.123-2.417 2.123h-.512c-1.382 0-2.106-.88-2.417-2.123l-.709-2.836c-.311-1.243.98-2.279 2.126-1.706Zm0-6.282c.844-.423 1.792.436 1.576 1.433l-.338 1.568c-.216.997-.734 1.697-1.838 1.697h-.01c-1.104 0-1.622-.7-1.838-1.697l-.338-1.568c-.216-.997.732-1.856 1.576-1.433Z" clip-rule="evenodd"/>
    </svg>
    `,
    warning: `
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
      <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd"/>
    </svg>`,
    info: `
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
      <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-6.442c-.24-.12-.536.023-.616.284l-.965 3.122a.75.75 0 0 0 .695.973l3.303.143c.263.011.466.241.456.505a.513.513 0 0 1-.504.494l-2.355-.102a1.054 1.054 0 0 0-.992.705l-1.363 3.924c-.108.311.136.63.457.63h.004c.16 0 .31-.076.406-.206l2.154-2.87a.75.75 0 0 1 1.077-.093l3.25 2.87c.241.213.62.15.807-.135a.75.75 0 0 0-.135-1.077l-2.625-2.32a.528.528 0 0 1-.08-.734l.756-1.134a.75.75 0 0 0-.608-1.168l-2.882-.125a1.504 1.504 0 0 1-1.285-1.134l-.563-1.826a.75.75 0 0 0-.616-.284Z" clip-rule="evenodd"/>
    </svg>
    `,
    success: `
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
      <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd"/>
    </svg>
    `,
    close: `
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
      <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/>
    </svg>
    `
};

// Funcion para crear notificacion
const handleClose = async () => {
    const target = notificationRef.value;
    if (target) {
        await animateMini(target, {
            opacity: [1, 0],
            scale: [1, 0.9],
            x: [0, -20],
        }, {
            duration: 0.3,
            easing: 'ease-in-out',
        });
    }

    isVisible.value = false;
    props.onClose?.();
}

// Timer automatico
let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;

// Funciones de animaciones con Motion usando stagger
const playEntranceAnimation = async () => {
    const el = notificationRef.value
    if (!el) return

    const children = Array.from(el.querySelectorAll('.animate-item')) as HTMLElement[]

    await animateMini(
        el,
        {
            opacity: [0, 1],
            y: [-50, 0],
            scale: [0.9, 1],
        },
        {
            duration: 0.6,
            easing: 'spring(1, 80, 10, 0)',
        }
    )

    if (children.length > 0) {
        await animateMini(
            children,
            {
                opacity: [0, 1],
                y: [20, 0],
            },
            {
                duration: 0.4,
                delay: stagger(0.08),
                easing: 'easeOut',
            }
        )
    }
}

onMounted(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    await playEntranceAnimation()

    if (props.duration > 0) {
        autoCloseTimer = setTimeout(handleClose, props.duration)
    }
})

onUnmounted(() => {
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer)
    }
})

watch(isVisible, async (newVal) => {
    if (!newVal) return

    await new Promise((resolve) => setTimeout(resolve, 100))
    await playEntranceAnimation()

    if (props.duration > 0) {
        autoCloseTimer = setTimeout(handleClose, props.duration)
    }
})


defineExpose({
    handleClose,
});

</script>

<template>
    <transition name="fade">
        <div v-if="isVisible"
            ref="notificationRef"
            class="error-notification relative w-full max-w-md mx-auto p-0 rounded-2xl overflow-hidden shadow-lg"
            :class="[themeConfig.bg, themeConfig.border]" role="alert" aria-live="assertive">
            <!-- Barra decorativa lateral (inspirada en BookStore) -->
            <div class="absolute left-0 top-0 bottom-0 w-1" :style="{ backgroundColor: themeConfig.accentColor }" />

            <div class="flex items-start gap-3 p-4 pl-5">
                <!-- Ícono opcional -->
                <div v-if="showIcon" class="flex-shrink-0 animate-item mt-0.5" :class="[themeConfig.iconBg]"
                    style="border-radius: 8px;" v-html="icons[type]" />

                <!-- Contenido principal -->
                <div class="flex-1 min-w-0 animate-item">
                    <!-- Titulo -->
                    <h3 class="font-semibold text-base leading-tight" :class="themeConfig.textPrimary">
                        {{ title }}
                    </h3>

                    <!-- Mensaje descriptivo -->
                    <p v-if="message" class="mt-1.5 text-sm leading-relaxed" :class="themeConfig.textSecondary">
                        {{ message }}
                    </p>
                </div>

                <!-- Botón de cierre -->

                <button @click="handleClose"
                    class="flex-shrink-0 p-1 rounded-lg transition-colors duration-200 animate-item focus:outline-none focus:ring-2 focus:ring-offset-1"
                    :class="[themeConfig.textSecondary, `focus:ring-${type}-500`]" :aria-label="'Cerrar notificación'">
                    <div v-html="icons.close" />
                </button>
            </div>

            <!-- Barra de progreso temporal (si hay auto-close) -->

            <div v-if="duration > 0" class="absolute bottom-0 left-0 right-0 h-0.5 animate-item"
                :class="themeConfig.bg">
                <div class="h-full transition-all ease-linear" :class="themeConfig.buttonBg"
                    :style="{ width: isVisible ? '100%' : '0%', transitionDuration: `${duration}ms` }" />
            </div>
        </div>
    </transition>
</template>


<style scoped>
/* Fade transition suave */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Clases utilitarias para elementos con stagger */
.animate-item {
    /* Estas clases serán animadas por Motion con delay escalonado */
}
</style>