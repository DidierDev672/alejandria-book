<script setup lang="ts">
import type { Component } from "vue";
import { computed, ref } from "vue";

// Contrato de propiedades estricto (SOLID - ISP)
interface Props {
    label: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color' | 'file' | 'hidden' | 'range' | 'textarea';
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    icon?: Component;
    showClear?: boolean;
    helperText?: string;
    success?: string;
    maxLength?: number;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    placeholder: '',
    error: '',
    required: false,
    disabled: false,
    showClear: true,
});

// defineModel automatiza el v-model bidireccional en Vue 3.4+
const modelValue = defineModel<string>({ default: '' });
const isFocused = ref(false);
const showPassword = ref(false);

const handleFocus = () => (isFocused.value = true);
const handleBlur = () => (isFocused.value = false);

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    modelValue.value = target.value;
};

const togglePassword = () => {
    showPassword.value = !showPassword.value;
};

const clearInput = () => {
    modelValue.value = '';
};

const inputType = computed(() => {
    if (props.type === 'password') {
        return showPassword.value ? 'text' : 'password';
    }
    return props.type;
});

// Estado computado para estilos dinámicos
const state = computed(() => {
    if (props.error) {
        return {
            class: 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/30',
            color: '#e11d48' // rose-600
        };
    }
    if (props.success) {
        return {
            class: 'border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-green-50/30',
            color: '#16a34a' // green-600
        };
    }
    return {
        class: isFocused.value
            ? 'border-amber-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white'
            : 'border-gray-200 hover:border-gray-300 bg-gray-50/50',
        color: isFocused.value ? '#d97706' : '#9ca3af' // amber-600 : gray-400
    };
});
</script>


<template>
    <div class="w-full flex flex-col font-sans">
        <!-- Label Flotante Animado -->
        <div class="relative">
            <!-- Label con animación -->
            <label :style="{ color: state.color }"
                class="absolute left-5 top-4 pointer-events-none origin-left text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-200 z-10"
                :class="{
                    '-translate-y-7 scale-90': isFocused || modelValue,
                    'translate-y-0 scale-100': !isFocused && !modelValue
                }">
                {{ label }}
                <span v-if="required" class="text-rose-500 ml-1">*</span>
            </label>

            <!-- Input Field Principal -->
            <div class="relative flex items-center group">
                <!-- Icono izquierdo (opcional) -->
                <div v-if="icon" :class="[
                    'absolute left-4 pointer-events-none flex items-center justify-center',
                    'transition-all duration-300',
                    isFocused ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'
                ]">
                    <component :is="icon" class="w-5 h-5" />
                </div>

                <!-- Input -->
                <input v-model="modelValue" :type="inputType" :disabled="disabled"
                    :placeholder="isFocused ? placeholder : ''" :class="[
                        'w-full px-5 py-3.5 sm:py-4 text-sm sm:text-base rounded-xl',
                        'font-sans font-medium transition-all duration-300',
                        'focus:outline-none appearance-none',
                        'placeholder:text-gray-400 placeholder:font-normal',
                        // Icon offset
                        icon ? 'pl-12' : 'pl-5',
                        showClear && modelValue && !disabled ? 'pr-12' : 'pr-5',
                        // States
                        state.class
                    ]" @focus="handleFocus" @blur="handleBlur" @input="handleInput" />

                <!-- Toggle Password (para tipo password) -->
                <button v-if="type === 'password'" type="button" @click="togglePassword" :class="[
                    'absolute right-4 pointer-events-auto flex items-center justify-center',
                    'text-gray-400 hover:text-gray-600 transition-colors duration-300',
                    'focus:outline-none'
                ]" aria-label="Mostrar/ocultar contraseña">
                    <svg v-if="showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>

                <!-- Clear Button (cuando hay valor) -->
                <button v-if="modelValue && showClear && !disabled" type="button" @click="clearInput" :class="[
                    'absolute right-4 pointer-events-auto flex items-center justify-center',
                    'text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1',
                    'transition-all duration-300',
                    'focus:outline-none',
                    type === 'password' ? 'right-12' : 'right-4'
                ]" aria-label="Limpiar">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>

            <!-- Barra animada debajo del input -->
            <div class="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-transparent transition-all duration-300"
                :style="{ width: isFocused ? '100%' : '0%' }"></div>
        </div>

        <!-- Información y Validación -->
        <div class="mt-2 min-h-6 px-1">
            <!-- Mensaje de Error -->
            <transition enter-active-class="transition ease-out duration-300"
                enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-1">
                <div v-if="error" class="flex items-center gap-2 text-xs sm:text-sm text-rose-600 font-medium">
                    <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clip-rule="evenodd" />
                    </svg>
                    <span>{{ error }}</span>
                </div>
            </transition>

            <!-- Mensaje de Éxito -->
            <transition enter-active-class="transition ease-out duration-300"
                enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-1">
                <div v-if="success && !error"
                    class="flex items-center gap-2 text-xs sm:text-sm text-green-600 font-medium">
                    <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd" />
                    </svg>
                    <span>{{ success }}</span>
                </div>
            </transition>

            <!-- Helper Text -->
            <transition enter-active-class="transition ease-out duration-300"
                enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-1">
                <p v-if="helperText && !error && !success" class="text-xs text-gray-500 font-normal mt-1">
                    {{ helperText }}
                </p>
            </transition>

            <!-- Contador de caracteres -->
            <div v-if="maxLength" class="text-right text-xs text-gray-400 font-normal mt-1">
                {{ modelValue.length }} / {{ maxLength }}
            </div>
        </div>
    </div>
</template>