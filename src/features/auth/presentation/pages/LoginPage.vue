<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const loginError = ref('')
const showPassword = ref(false)

function validate(): boolean {
  let valid = true
  errors.email = ''
  errors.password = ''
  loginError.value = ''

  if (!form.email.trim()) {
    errors.email = 'El correo es obligatorio'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Correo inválido'
    valid = false
  }
  if (!form.password.trim()) {
    errors.password = 'La contraseña es obligatoria'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Mínimo 6 caracteres'
    valid = false
  }
  return valid
}

async function handleSubmit(): Promise<void> {
  if (!validate()) return
  const ok = await authStore.login({ email: form.email, password: form.password })
  if (ok) {
    router.push('/dashboard')
  } else {
    loginError.value = authStore.error || 'Credenciales inválidas'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <!-- Fondo decorativo con temática de biblioteca -->
    <div class="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <!-- Patrón de libros decorativo en el fondo -->
      <div class="absolute top-0 left-0 w-full h-full opacity-5">
        <div class="absolute top-10 left-10 transform -rotate-12">
          <svg class="w-32 h-32 text-amber-900" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 1h10v2H7V6zm0 4h10v2H7v-2zm0 4h10v2H7v-2z" />
          </svg>
        </div>
        <div class="absolute bottom-20 right-20 transform rotate-12">
          <svg class="w-40 h-40 text-orange-900" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 1h10v2H7V6zm0 4h10v2H7v-2zm0 4h10v2H7v-2z" />
          </svg>
        </div>
        <div class="absolute top-1/2 right-10 transform rotate-45">
          <svg class="w-24 h-24 text-yellow-900" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 1h10v2H7V6zm0 4h10v2H7v-2zm0 4h10v2H7v-2z" />
          </svg>
        </div>
      </div>

      <!-- Elementos decorativos de líneas (estantes) -->
      <div class="absolute inset-0 pointer-events-none">
        <div
          class="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-40">
        </div>
        <div
          class="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-40">
        </div>
        <div
          class="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-40">
        </div>
      </div>
    </div>

    <!-- Contenedor principal -->
    <div class="px-4 w-full max-w-6xl relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Sección izquierda - Contenido visual (solo en desktop) -->
        <div v-motion :initial="{ opacity: 0, x: -48 }"
          :enter="{ opacity: 1, x: 0, transition: { duration: 600, ease: 'easeOut' } }"
          class="hidden lg:flex flex-col justify-center">
          <div class="relative mb-8">
            <!-- Ilustración de libros -->
            <div class="relative w-full h-80">
              <svg class="w-full h-full" viewBox="0 0 300 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Libros apilados base -->
                <g id="books-stack">
                  <!-- Libro 1 (rojo) -->
                  <rect x="30" y="200" width="60" height="90" fill="#C41E3A" rx="2" />
                  <rect x="30" y="200" width="60" height="8" fill="#8B1428" rx="1" />
                  <line x1="35" y1="210" x2="85" y2="210" stroke="#A01430" stroke-width="1" />
                  <line x1="35" y1="220" x2="85" y2="220" stroke="#A01430" stroke-width="1" />

                  <!-- Libro 2 (azul) -->
                  <rect x="95" y="180" width="60" height="110" fill="#1E40AF" rx="2" />
                  <rect x="95" y="180" width="60" height="8" fill="#0F2962" rx="1" />
                  <line x1="100" y1="195" x2="150" y2="195" stroke="#1E3A8A" stroke-width="1" />
                  <line x1="100" y1="210" x2="150" y2="210" stroke="#1E3A8A" stroke-width="1" />

                  <!-- Libro 3 (dorado/amarillo) -->
                  <rect x="160" y="190" width="60" height="100" fill="#D97706" rx="2" />
                  <rect x="160" y="190" width="60" height="8" fill="#B45309" rx="1" />
                  <line x1="165" y1="205" x2="215" y2="205" stroke="#B8860B" stroke-width="1" />
                  <line x1="165" y1="220" x2="215" y2="220" stroke="#B8860B" stroke-width="1" />

                  <!-- Libro 4 (verde) -->
                  <rect x="225" y="210" width="55" height="80" fill="#15803D" rx="2" />
                  <rect x="225" y="210" width="55" height="8" fill="#0D3F1F" rx="1" />
                  <line x1="230" y1="223" x2="275" y2="223" stroke="#166534" stroke-width="1" />
                </g>

                <!-- Decoración: marcapáginas -->
                <line x1="50" y1="150" x2="50" y2="200" stroke="#E8B4B8" stroke-width="4" stroke-linecap="round" />
                <line x1="120" y1="140" x2="120" y2="180" stroke="#FFD700" stroke-width="4" stroke-linecap="round" />
                <line x1="190" y1="155" x2="190" y2="190" stroke="#B0C4DE" stroke-width="4" stroke-linecap="round" />

                <!-- Elementos decorativos: estrellas -->
                <circle cx="60" cy="80" r="3" fill="#F59E0B" opacity="0.6" />
                <circle cx="140" cy="60" r="2" fill="#F59E0B" opacity="0.4" />
                <circle cx="220" cy="90" r="3" fill="#F59E0B" opacity="0.6" />
                <circle cx="280" cy="70" r="2" fill="#F59E0B" opacity="0.4" />
              </svg>
            </div>
          </div>

          <!-- Texto motivacional -->
          <div class="space-y-4">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Bienvenido a tu
              <span class="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Biblioteca Digital
              </span>
            </h2>
            <p class="text-lg text-gray-600">
              Descubre miles de historias, accede a tu colección personal y sumérgete en mundos infinitos. Tu viaje
              literario comienza aquí.
            </p>

            <!-- Características -->
            <div class="space-y-3 pt-4">
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0 w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
                <span class="text-gray-700">Acceso a millones de libros</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0 w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
                <span class="text-gray-700">Sincronización entre dispositivos</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0 w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
                <span class="text-gray-700">Recomendaciones personalizadas</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección derecha - Formulario de login -->
        <div v-motion :initial="{ opacity: 0, scale: 0.92, y: 24 }"
          :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 500, ease: 'easeOut' } }"
          class="w-full max-w-md mx-auto lg:mx-0 rounded-3xl border border-amber-200/60 bg-white/95 backdrop-blur-sm p-8 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
          <!-- Header del formulario -->
          <div class="mb-8 text-center">
            <div v-motion :initial="{ opacity: 0, y: -12 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 150, duration: 400 } }"
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 shadow-lg shadow-amber-200">
              <!-- Icono de libro abierto -->
              <svg class="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm3 6h6v6H7v-6zm8 0h2v2h-2v-2z" />
              </svg>
            </div>
            <h1
              class="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-900 to-orange-700 bg-clip-text text-transparent">
              Alajandria Book
            </h1>
            <p class="mt-2 text-sm text-amber-700 font-medium">Tu biblioteca digital personal</p>
          </div>

          <!-- Error global -->
          <div v-if="loginError" v-motion :initial="{ opacity: 0, x: -12 }"
            :enter="{ opacity: 1, x: 0, transition: { duration: 300 } }"
            class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
            <div class="flex items-center gap-3">
              <svg class="h-5 w-5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-red-700 font-medium">{{ loginError }}</span>
            </div>
          </div>

          <!-- Formulario -->
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <!-- Campo Email -->
            <div>
              <label for="email" class="mb-2 block text-sm font-semibold text-gray-800">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Correo electrónico
                </span>
              </label>
              <input id="email" v-model="form.email" type="email" autocomplete="email"
                placeholder="tu.correo@ejemplo.com"
                class="w-full rounded-xl border-2 bg-amber-50/50 px-4 py-3 text-sm outline-none transition-all duration-200 focus:bg-white placeholder:text-gray-400"
                :class="errors.email ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200' : 'border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'"
                @input="errors.email = ''" />
              <p v-if="errors.email" v-motion :initial="{ opacity: 0, y: -4 }"
                :enter="{ opacity: 1, y: 0, transition: { duration: 250 } }"
                class="mt-2 text-xs font-medium text-red-600">
                {{ errors.email }}
              </p>
            </div>

            <!-- Campo Contraseña -->
            <div>
              <label for="password" class="mb-2 block text-sm font-semibold text-gray-800">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Contraseña
                </span>
              </label>
              <div class="relative">
                <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password" placeholder="••••••••"
                  class="w-full rounded-xl border-2 bg-amber-50/50 px-4 py-3 pr-12 text-sm outline-none transition-all duration-200 focus:bg-white placeholder:text-gray-400"
                  :class="errors.password ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200' : 'border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'"
                  @input="errors.password = ''" />
                <button type="button" v-motion :initial="{ opacity: 0.6, scale: 0.9 }"
                  :enter="{ opacity: 1, scale: 1, transition: { duration: 200 } }"
                  :while-hover="{ scale: 1.1, transition: { duration: 150 } }" :while-tap="{ scale: 0.9 }"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 transition hover:text-amber-700"
                  @click="showPassword = !showPassword" tabindex="-1">
                  <svg v-if="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              <p v-if="errors.password" v-motion :initial="{ opacity: 0, y: -4 }"
                :enter="{ opacity: 1, y: 0, transition: { duration: 250 } }"
                class="mt-2 text-xs font-medium text-red-600">
                {{ errors.password }}
              </p>
            </div>

            <!-- Recordarme -->
            <div class="flex items-center justify-between pt-2">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox"
                  class="w-4 h-4 text-amber-600 border-amber-300 rounded cursor-pointer accent-amber-600" />
                <span class="text-sm text-gray-600 group-hover:text-gray-800 transition">Recuerda mi cuenta</span>
              </label>
              <a href="#" class="text-xs text-amber-600 hover:text-amber-700 font-medium transition">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <!-- Botón de ingreso -->
            <button type="submit" :disabled="authStore.isLoading"
              class="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:from-amber-700 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-lg mt-2">
              <svg v-if="authStore.isLoading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{{ authStore.isLoading ? 'Ingresando...' : 'Ingresar a mi biblioteca' }}</span>
            </button>
          </form>

          <!-- Separador -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-amber-200"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="px-2 bg-white text-gray-600">¿No tienes cuenta?</span>
            </div>
          </div>

          <!-- Link de registro -->
          <router-link to="/register"
            class="block w-full rounded-xl border-2 border-amber-200 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors duration-200 text-center">
            Crear una nueva cuenta
          </router-link>

          <!-- Footer -->
          <p class="mt-8 text-center text-xs text-gray-500">
            <span class="text-amber-600 font-semibold">Alajandria Book</span> — Tu espacio literario infinito
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*  Animaciones adicionales */

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}


.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Efecto de enfoque mejorado */
:deep(.focus-within\:ring-amber-100:focus-within) {
  --tw-ring-color: rgb(251 191 36 / 0.2);
}

/* Sombra mejorada para el formulario */
.shadow-3xl {
  box-shadow: 0 20px 50px -10px rgb(0 0 0 / 0.1);
}
</style>