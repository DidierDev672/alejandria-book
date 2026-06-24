# Grabify - Sistema de Registro de Visitas

## 📍 Componente UrlTracker.vue

Este componente implementa un sistema de rastreo de visitas con recopilación de datos del visitante y redirección automática.

---

## 🚀 Cómo usar

### 1. Configurar la ruta en Vue Router

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import UrlTracker from '@/features/tracking/presentation/components/UrlTracker.vue'

const routes = [
  {
    path: '/go',  // O cualquier path que prefieras
    name: 'UrlTracker',
    component: UrlTracker,
    // Opcional: pasar URL de destino como query param
    // /go?to=https://ejemplo.com/destino
  },
  // ... otras rutas
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
```

### 2. Personalizar la configuración

Edita estas constantes en `UrlTracker.vue`:

```typescript
// URL donde se redirigirá al usuario
const REDIRECT_URL = 'https://www.google.com'

// Endpoint que recibirá los datos (tu backend o webhook)
const TRACKING_ENDPOINT = 'https://httpbin.org/post'

// Servicio para obtener IP (puedes cambiarlo)
const IP_API_URL = 'https://ipapi.co/json/'
```

---

## 📊 Datos que se recopilan

### Datos de red (vía ipapi.co)
- IP pública
- Ciudad
- Región/Estado
- País
- Zona horaria
- ISP/Organización

### Datos del dispositivo
- User Agent (navegador, sistema operativo)
- Resolución de pantalla
- Idioma
- Plataforma
- Cookies habilitadas

### Datos de la visita
- URL completa (incluyendo query params)
- Path de la ruta
- Parámetros de consulta
- Referrer (página anterior)
- Timestamp ISO
- ID único de visita

---

## 🔒 Ejemplos de Endpoints

### Webhook de Discord
```typescript
const TRACKING_ENDPOINT = 'https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN'

// Modifica sendTrackingData para formato Discord:
async function sendTrackingData(data: TrackingData): Promise<void> {
  const discordPayload = {
    embeds: [{
      title: '📍 Nueva Visita Registrada',
      color: 0x667eea,
      fields: [
        { name: 'IP', value: data.ip, inline: true },
        { name: 'Ubicación', value: `${data.city}, ${data.country}`, inline: true },
        { name: 'Navegador', value: data.userAgent.split(' ')[0], inline: true },
        { name: 'URL', value: data.fullUrl },
        { name: 'Pantalla', value: data.screenResolution, inline: true },
        { name: 'Fecha', value: data.timestamp, inline: true },
      ],
      timestamp: new Date().toISOString(),
    }]
  }

  await fetch(TRACKING_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(discordPayload),
  })
}
```

### Backend personalizado (ejemplo con fetch)
```typescript
const TRACKING_ENDPOINT = 'https://mi-api.com/api/v1/visits'

async function sendTrackingData(data: TrackingData): Promise<void> {
  await fetch(TRACKING_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer TU_API_KEY', // Si requiere auth
    },
    body: JSON.stringify(data),
  })
}
```

### Firebase / Firestore
```typescript
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

async function sendTrackingData(data: TrackingData): Promise<void> {
  await addDoc(collection(db, 'visits'), data)
}
```

---

## ⚙️ Características de seguridad

1. **Siempre redirige**: Incluso si falla el rastreo, el usuario será redirigido
2. **Try/Catch completo**: Todos los errores son capturados
3. **Timeouts implícitos**: Las APIs de IP tienen sus propios timeouts
4. **Datos seguros**: No se almacenan cookies ni datos sensibles

---

## 🎨 Personalización visual

El componente incluye estilos SCoped con:
- Gradientes modernos
- Animaciones de pulso y progreso
- Diseño responsive
- Estados de error visuales

Para cambiar colores, modifica las variables CSS en `<style>`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

---

## 📱 Uso con URLs dinámicas

Para pasar la URL de destino dinámicamente:

```typescript
// En el componente, reemplaza REDIRECT_URL con:
const route = useRoute()
const REDIRECT_URL = computed(() => {
  // Desde query param: /go?to=https://destino.com
  return (route.query.to as string) || 'https://default.com'
})
```

```vue
<!-- O usa props -->
<script setup>
const props = defineProps<{
  destinationUrl: string
}>()
const REDIRECT_URL = props.destinationUrl
</script>
```

```typescript
// En el router
{
  path: '/go/:url',
  component: UrlTracker,
  props: route => ({ destinationUrl: decodeURIComponent(route.params.url) })
}
```

---

## 🧪 Testing

Para probar el componente sin redirección real:
```typescript
// Comenta redirectToDestination() temporalmente
// y muestra los datos en consola:
console.log('Datos recopilados:', trackingData)
```
