<!-- components/RegisterForm.vue -->
<template>
    <div
        class="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div v-motion class="w-[95%] max-w-4xl bg-white shadow-2xl rounded-3xl p-8 space-y-8 border border-amber-200/50"
            :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6, ease: 'easeOut' }">
            <!-- Botón volver -->
            <router-link to="/login"
                class="inline-flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-800 transition-colors duration-200">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5m7 7l-7-7 7-7" />
                </svg>
                Volver
            </router-link>

            <!-- Header -->
            <div class="text-center">
                <h2 class="mt-2 text-3xl font-bold text-gray-800 tracking-tight">
                    Crear Cuenta
                </h2>
                <p class="mt-2 text-sm text-gray-500">
                    Únete a nuestra comunidad de lectores
                </p>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-5">
                <!-- Campo: Nombre Completo -->
                <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }" :transition="{ delay: 0.1 }">
                    <label class="block text-sm font-medium text-gray-700">Nombre completo</label>
                    <div class="mt-1 relative">
                        <input v-model="user.fullName" type="text"
                            class="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                            placeholder="Ej: Gabriel García Márquez" @input="clearFieldError('fullName')" />
                        <div v-if="errors.fullName" class="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <span class="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                            {{ errors.fullName }}
                        </div>
                    </div>
                </div>

                <!-- Campo: Teléfono -->
                <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
                    :transition="{ delay: 0.15 }">
                    <label class="block text-sm font-medium text-gray-700">Número de teléfono</label>
                    <div class="mt-1">
                        <input v-model="user.phone" type="tel"
                            class="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                            placeholder="Ej: 3123456789" @input="clearFieldError('phone')" />
                        <div v-if="errors.phone" class="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <span class="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                            {{ errors.phone }}
                        </div>
                    </div>
                </div>

                <!-- Campo: Identificación -->
                <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }" :transition="{ delay: 0.2 }">
                    <label class="block text-sm font-medium text-gray-700">Número de identificación</label>
                    <div class="mt-1">
                        <input v-model="user.idNumber" type="text"
                            class="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                            placeholder="Ej: 1234567890" @input="clearFieldError('idNumber')" />
                        <div v-if="errors.idNumber" class="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <span class="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                            {{ errors.idNumber }}
                        </div>
                    </div>
                </div>

                <!-- Campo: Fecha de Nacimiento -->
                <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
                    :transition="{ delay: 0.25 }">
                    <label class="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                    <div class="mt-1">
                        <input v-model="user.birthDate" type="date"
                            class="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                            @change="clearFieldError('birthDate')" />
                        <div v-if="errors.birthDate" class="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <span class="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                            {{ errors.birthDate }}
                        </div>
                    </div>
                </div>

                <!-- Campo: Correo -->
                <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }" :transition="{ delay: 0.3 }">
                    <label class="block text-sm font-medium text-gray-700">Correo electrónico</label>
                    <div class="mt-1">
                        <input v-model="user.email" type="email"
                            class="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                            placeholder="tú@ejemplo.com" @input="clearFieldError('email')" />
                        <div v-if="errors.email" class="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <span class="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                            {{ errors.email }}
                        </div>
                    </div>
                </div>

                <!-- Campo: Contraseña -->
                <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
                    :transition="{ delay: 0.35 }">
                    <label class="block text-sm font-medium text-gray-700">Contraseña</label>
                    <div class="mt-1 relative">
                        <input v-model="user.password" :type="showPassword ? 'text' : 'password'"
                            class="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 pr-12"
                            placeholder="••••••••" @input="clearFieldError('password')" />
                        <button type="button" @click="togglePasswordVisibility"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-amber-600 transition-colors duration-200"
                            aria-label="Mostrar u ocultar contraseña">
                            <span v-motion :initial="{ scale: 0.8 }" :enter="{ scale: 1 }" :transition="{ duration: 0.2 }">
                                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            </span>
                        </button>
                        <div v-if="errors.password" class="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <span class="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                            {{ errors.password }}
                        </div>
                    </div>
                </div>

                <!-- Botón de Envío -->
                <div v-motion class="pt-4" :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }"
                    :transition="{ delay: 0.4 }">
                    <button type="submit" :disabled="isLoading"
                        class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
                        <span v-motion v-if="!isLoading" :initial="{ scale: 1 }" :whileHover="{ scale: 1.02 }"
                            :whileTap="{ scale: 0.98 }">
                            Registrarse
                        </span>
                        <span v-else class="flex items-center gap-2">
                            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            Procesando...
                        </span>
                    </button>
                </div>

                <!-- Mensaje de éxito -->
                <div v-motion v-if="submitSuccess" :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1 }"
                    class="mt-4 p-3 bg-green-50 text-green-700 rounded-xl text-center text-sm border border-green-200">
                    ¡Registro exitoso! Te hemos enviado un correo de confirmación.
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRegisterForm } from '../../usesCases/useRegisterForm';

const {
    user,
    errors,
    showPassword,
    isLoading,
    submitSuccess,
    handleSubmit,
    togglePasswordVisibility,
    clearFieldError,
} = useRegisterForm();
</script>
