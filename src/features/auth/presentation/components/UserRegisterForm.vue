<script setup lang="ts">
import { computed, reactive, ref } from "vue";

/**
 * UserRegisterForm - Formulario de Registro de Usuarios
 *
 * Componente Vue 3 con Composition API (script setup)
 * Diseño moderno con Tailwind CSS v4.0
 * Validación de contraseñas, estados focus/error, responsive
 *
 * Patrones utilizados:
 * - reactive() para estado del formulario
 * - computed() para validación en tiempo real
 * - v-model para binding bidireccional
 * - Estado de carga y errores
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS Y ENUMERACIONES
// ═══════════════════════════════════════════════════════════════

type UserRole = "admin" | "editor" | "user";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

interface FormErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

// ═══════════════════════════════════════════════════════════════
// ESTADO REACTIVO
// ═══════════════════════════════════════════════════════════════

// Estado del formulario usando reactive (mejor para objetos con múltiples propiedades)
const form = reactive<FormData>({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "user",
});

// Estado de errores de validación
const errors = reactive<FormErrors>({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
});

// Estados de UI
const isSubmitting = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const registrationSuccess = ref(false);

// Opciones del selector de roles
const roleOptions: { value: UserRole; label: string; description: string }[] = [
  {
    value: "admin",
    label: "Administrador",
    description: "Acceso completo al sistema",
  },
  {
    value: "editor",
    label: "Editor",
    description: "Puede crear y editar contenido",
  },
  {
    value: "user",
    label: "Usuario",
    description: "Acceso básico de lectura",
  },
];

// ═══════════════════════════════════════════════════════════════
// VALIDACIÓN COMPUTADA
// ═══════════════════════════════════════════════════════════════

// Verificar si el formulario es válido (para habilitar/deshabilitar botón)
const isFormValid = computed(() => {
  return (
    form.name.trim().length >= 2 &&
    isValidEmail(form.email) &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword &&
    form.role !== null
  );
});

// Computed para verificar si las contraseñas coinciden (feedback visual)
const passwordsMatch = computed(() => {
  if (!form.confirmPassword) return true; // No mostrar error si está vacío
  return form.password === form.confirmPassword;
});

// Fuerza de la contraseña (0-4)
const passwordStrength = computed(() => {
  const pwd = form.password;
  if (!pwd) return 0;

  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  return score;
});

// Texto descriptivo de la fuerza de contraseña
const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  const texts = ["Muy débil", "Débil", "Regular", "Fuerte", "Muy fuerte"];
  return texts[strength];
});

// Color de la barra de fuerza
const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value;
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];
  return colors[strength];
});

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar campo individual (blur event)
function validateField(field: keyof FormErrors): void {
  errors[field] = "";

  switch (field) {
    case "name":
      if (!form.name.trim()) {
        errors.name = "El nombre es obligatorio";
      } else if (form.name.trim().length < 2) {
        errors.name = "El nombre debe tener al menos 2 caracteres";
      }
      break;

    case "email":
      if (!form.email) {
        errors.email = "El correo electrónico es obligatorio";
      } else if (!isValidEmail(form.email)) {
        errors.email = "Ingresa un correo electrónico válido";
      }
      break;

    case "password":
      if (!form.password) {
        errors.password = "La contraseña es obligatoria";
      } else if (form.password.length < 8) {
        errors.password = "La contraseña debe tener al menos 8 caracteres";
      }
      break;

    case "confirmPassword":
      if (!form.confirmPassword) {
        errors.confirmPassword = "Confirma tu contraseña";
      } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden";
      }
      break;

    case "role":
      if (!form.role) {
        errors.role = "Selecciona un rol";
      }
      break;
  }
}

// Validar todo el formulario antes de enviar
function validateForm(): boolean {
  let isValid = true;

  (Object.keys(errors) as Array<keyof FormErrors>).forEach((key) => {
    validateField(key);
    if (errors[key]) isValid = false;
  });

  return isValid;
}

// ═══════════════════════════════════════════════════════════════
// MANEJADORES DE EVENTOS
// ═══════════════════════════════════════════════════════════════

async function handleSubmit(event: Event): Promise<void> {
  // Prevenir comportamiento por defecto del formulario
  event.preventDefault();

  // Validar formulario
  if (!validateForm()) {
    return;
  }

  // Verificar nuevamente que las contraseñas coincidan
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
    return;
  }

  // Iniciar estado de carga
  isSubmitting.value = true;
  registrationSuccess.value = false;

  try {
    // Simulación de envío a API (reemplazar con llamada real)
    await simulateApiCall();

    // Éxito
    console.log("✅ Usuario registrado exitosamente:", {
      name: form.name,
      email: form.email,
      role: form.role,
      password: "***", // Nunca loguear contraseñas reales
    });

    registrationSuccess.value = true;

    // Opcional: Resetear formulario después del éxito
    setTimeout(() => {
      resetForm();
    }, 3000);
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    errors.email = "Error al registrar. Intenta nuevamente.";
  } finally {
    isSubmitting.value = false;
  }
}

// Simulación de llamada API
function simulateApiCall(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 1500); // Simular 1.5s de delay de red
  });
}

function resetForm(): void {
  form.name = "";
  form.email = "";
  form.password = "";
  form.confirmPassword = "";
  form.role = "user";

  errors.name = "";
  errors.email = "";
  errors.password = "";
  errors.confirmPassword = "";
  errors.role = "";

  registrationSuccess.value = false;
}

function togglePasswordVisibility(): void {
  showPassword.value = !showPassword.value;
}

function toggleConfirmPasswordVisibility(): void {
  showConfirmPassword.value = !showConfirmPassword.value;
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50/20 to-orange-50/30 p-4 sm:p-6 lg:p-8">
    <!-- Decoración de fondo -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-20 -right-20 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-20 -left-20 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Card Principal -->
    <div
      class="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl shadow-stone-200/50 overflow-hidden border border-stone-100">
      <!-- Header con gradiente -->
      <div class="relative bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-8">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-4 right-4 w-24 h-24 border-2 border-white rounded-full"></div>
          <div class="absolute bottom-4 left-4 w-16 h-16 border-2 border-white rounded-full"></div>
        </div>

        <div class="relative z-10 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
            <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 class="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Crear Cuenta
          </h1>
          <p class="text-amber-100 text-sm mt-2 font-medium">
            Regístrate para comenzar tu viaje
          </p>
        </div>
      </div>

      <!-- Estado de éxito -->
      <div v-if="registrationSuccess"
        class="mx-6 mt-6 bg-green-50 border-l-4 border-green-500 rounded-r-xl p-4 animate-pulse">
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-semibold text-green-800">¡Registro exitoso!</h3>
            <p class="text-green-700 text-sm mt-1">Tu cuenta ha sido creada correctamente.</p>
          </div>
        </div>
      </div>

      <!-- Formulario -->
      <form @submit="handleSubmit" class="p-6 sm:p-8 space-y-5">
        <!-- Campo: Nombre -->
        <div class="space-y-1.5">
          <label for="name" class="block text-sm font-semibold text-stone-700">
            Nombre completo
            <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input id="name" v-model="form.name" type="text" placeholder="Ej: María González"
              @blur="validateField('name')" :class="[
                'w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-stone-50/50 text-stone-800 placeholder:text-stone-400',
                'transition-all duration-200 ease-out',
                'focus:outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/20',
                errors.name
                  ? 'border-red-300 focus:border-red-500 bg-red-50/30'
                  : 'border-stone-200 focus:border-amber-500 hover:border-stone-300'
              ]" />
          </div>
          <!-- Mensaje de error -->
          <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1">
            <p v-if="errors.name" class="text-sm text-red-600 flex items-center gap-1.5">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
              {{ errors.name }}
            </p>
          </Transition>
        </div>

        <!-- Campo: Correo Electrónico -->
        <div class="space-y-1.5">
          <label for="email" class="block text-sm font-semibold text-stone-700">
            Correo electrónico
            <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input id="email" v-model="form.email" type="email" placeholder="tu@email.com"
              @blur="validateField('email')" :class="[
                'w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-stone-50/50 text-stone-800 placeholder:text-stone-400',
                'transition-all duration-200 ease-out',
                'focus:outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/20',
                errors.email
                  ? 'border-red-300 focus:border-red-500 bg-red-50/30'
                  : 'border-stone-200 focus:border-amber-500 hover:border-stone-300'
              ]" />
          </div>
          <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1">
            <p v-if="errors.email" class="text-sm text-red-600 flex items-center gap-1.5">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
              {{ errors.email }}
            </p>
          </Transition>
        </div>

        <!-- Campo: Contraseña -->
        <div class="space-y-1.5">
          <label for="password" class="block text-sm font-semibold text-stone-700">
            Contraseña
            <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
              placeholder="Mínimo 8 caracteres" @blur="validateField('password')" :class="[
                'w-full pl-10 pr-12 py-3 rounded-xl border-2 bg-stone-50/50 text-stone-800 placeholder:text-stone-400',
                'transition-all duration-200 ease-out',
                'focus:outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/20',
                errors.password
                  ? 'border-red-300 focus:border-red-500 bg-red-50/30'
                  : 'border-stone-200 focus:border-amber-500 hover:border-stone-300'
              ]" />
            <!-- Botón mostrar/ocultar contraseña -->
            <button type="button" @click="togglePasswordVisibility"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors">
              <svg v-if="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>

          <!-- Indicador de fuerza de contraseña -->
          <div v-if="form.password" class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-stone-500">Fuerza:</span>
              <span :class="[
                'font-medium',
                passwordStrength === 0 ? 'text-red-500' :
                  passwordStrength === 1 ? 'text-orange-500' :
                    passwordStrength === 2 ? 'text-yellow-500' :
                      passwordStrength === 3 ? 'text-lime-500' : 'text-green-500'
              ]">{{ passwordStrengthText }}</span>
            </div>
            <div class="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
              <div :class="['h-full transition-all duration-500 ease-out', passwordStrengthColor]"
                :style="{ width: `${(passwordStrength + 1) * 20}%` }"></div>
            </div>
          </div>

          <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1">
            <p v-if="errors.password" class="text-sm text-red-600 flex items-center gap-1.5">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
              {{ errors.password }}
            </p>
          </Transition>
        </div>

        <!-- Campo: Confirmar Contraseña -->
        <div class="space-y-1.5">
          <label for="confirmPassword" class="block text-sm font-semibold text-stone-700">
            Confirmar contraseña
            <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <input id="confirmPassword" v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Repite tu contraseña" @blur="validateField('confirmPassword')" :class="[
                'w-full pl-10 pr-12 py-3 rounded-xl border-2 bg-stone-50/50 text-stone-800 placeholder:text-stone-400',
                'transition-all duration-200 ease-out',
                'focus:outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/20',
                errors.confirmPassword || (!passwordsMatch && form.confirmPassword)
                  ? 'border-red-300 focus:border-red-500 bg-red-50/30'
                  : form.confirmPassword && passwordsMatch
                    ? 'border-green-300 focus:border-green-500 bg-green-50/30'
                    : 'border-stone-200 focus:border-amber-500 hover:border-stone-300'
              ]" />
            <!-- Botón mostrar/ocultar -->
            <button type="button" @click="toggleConfirmPasswordVisibility"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors">
              <svg v-if="showConfirmPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>

          <!-- Icono de validación visual -->
          <div class="flex items-center gap-2">
            <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 scale-0"
              enter-to-class="opacity-100 scale-100">
              <svg v-if="form.confirmPassword && passwordsMatch" class="w-5 h-5 text-green-500" fill="currentColor"
                viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
            </Transition>
            <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 scale-0"
              enter-to-class="opacity-100 scale-100">
              <svg v-if="form.confirmPassword && !passwordsMatch" class="w-5 h-5 text-red-500" fill="currentColor"
                viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
            </Transition>
            <Transition enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1">
              <p v-if="errors.confirmPassword" class="text-sm text-red-600 flex items-center gap-1.5">
                {{ errors.confirmPassword }}
              </p>
            </Transition>
          </div>
        </div>

        <!-- Selector: Rol -->
        <div class="space-y-1.5">
          <label for="role" class="block text-sm font-semibold text-stone-700">
            Rol de usuario
            <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <select id="role" v-model="form.role" @blur="validateField('role')" :class="[
              'w-full pl-10 pr-10 py-3 rounded-xl border-2 bg-stone-50/50 text-stone-800',
              'transition-all duration-200 ease-out appearance-none',
              'focus:outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/20',
              errors.role
                ? 'border-red-300 focus:border-red-500 bg-red-50/30'
                : 'border-stone-200 focus:border-amber-500 hover:border-stone-300'
            ]">
              <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                {{ role.label }}
              </option>
            </select>
            <!-- Icono de flecha para select -->
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Descripción del rol seleccionado -->
          <p class="text-xs text-stone-500">
            {{roleOptions.find(r => r.value === form.role)?.description}}
          </p>

          <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1">
            <p v-if="errors.role" class="text-sm text-red-600 flex items-center gap-1.5">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
              {{ errors.role }}
            </p>
          </Transition>
        </div>

        <!-- Botón de Submit -->
        <div class="pt-4">
          <button type="submit" :disabled="isSubmitting" :class="[
            'w-full py-4 px-6 rounded-xl font-semibold text-white',
            'bg-gradient-to-r from-amber-600 to-orange-600',
            'hover:from-amber-700 hover:to-orange-700',
            'shadow-lg shadow-amber-600/30 hover:shadow-xl hover:shadow-amber-600/40',
            'transform hover:-translate-y-0.5 active:translate-y-0',
            'transition-all duration-200 ease-out',
            'focus:outline-none focus:ring-4 focus:ring-amber-500/30',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-lg',
            'flex items-center justify-center gap-2'
          ]">
            <!-- Spinner de carga -->
            <svg v-if="isSubmitting" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            <span v-if="isSubmitting">Creando cuenta...</span>
            <template v-else>
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Crear cuenta
            </template>
          </button>
        </div>

        <!-- Link a login -->
        <p class="text-center text-sm text-stone-500 pt-2">
          ¿Ya tienes una cuenta?
          <a href="/login" class="text-amber-600 hover:text-amber-700 font-semibold hover:underline transition-colors">
            Inicia sesión
          </a>
        </p>
      </form>
    </div>

    <!-- Footer -->
    <p class="absolute bottom-4 text-center text-xs text-stone-400 w-full">
      Al registrarte, aceptas nuestros Términos y Política de Privacidad
    </p>
  </div>
</template>
