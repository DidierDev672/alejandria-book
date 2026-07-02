# Feature: Video

Módulo completo para la gestión de videos en Alejandría, utilizando Supabase para almacenamiento y base de datos.

## Características

- ✅ Subida de archivos grandes con soporte resumible
- ✅ Nombres de archivo únicos con UUID
- ✅ Tracking de progreso en tiempo real
- ✅ Validación de tipos MIME y tamaños máximos
- ✅ Registro automático en base de datos
- ✅ Manejo de errores con rollback automático
- ✅ Drag & drop interface
- ✅ Clean Architecture

## Instalación

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_SUPABASE_VIDEO_BUCKET=gallary
```

> **Nota:** El bucket por defecto es `gallary`. Asegúrate de crear este bucket en tu proyecto de Supabase.

### 2. Configuración de Supabase

Ejecuta el SQL en el archivo `src/features/video/infrastructure/config/supabase.ts` para:

1. Crear la tabla `videos`
2. Configurar políticas RLS
3. Crear el bucket de storage

## Estructura del Módulo

```
video/
├── domain/
│   ├── entities/
│   │   └── VideoEntity.ts          # Entidades y validadores
│   └── repositories/
│       └── VideoRepository.ts      # Interfaz del repositorio
├── application/
│   └── VideoService.ts             # Lógica de negocio
├── infrastructure/
│   ├── config/
│   │   └── supabase.ts             # Configuración de Supabase
│   └── repositories/
│       └── SupabaseVideoRepository.ts  # Implementación con Supabase
└── presentation/
    ├── composables/
    │   └── useVideoUpload.ts       # Composable Vue 3
    └── components/
        └── VideoUploadForm.vue     # Componente de ejemplo
```

## Uso Básico

### Composable (Composition API)

```vue
<script setup lang="ts">
import { useVideoUpload, SupabaseVideoRepository, getSupabaseVideoConfig } from '@/features/video'

const repository = new SupabaseVideoRepository(getSupabaseVideoConfig())

const { state, uploadVideo, resetState, formatProgress } = useVideoUpload({
  repository,
  currentUserId: 'user-id-aqui'
})

async function handleSubmit() {
  const video = await uploadVideo({
    title: 'Mi Video',
    description: 'Descripción opcional',
    file: archivoSeleccionado
  })

  if (video) {
    console.log('Video subido:', video.id)
  }
}
</script>
```

### Componente Pre-construido

```vue
<script setup lang="ts">
import { VideoUploadForm } from '@/features/video'

function handleSuccess(videoId: string) {
  console.log('Video subido:', videoId)
}

function handleError(message: string) {
  console.error('Error:', message)
}
</script>

<template>
  <VideoUploadForm
    user-id="user-id-aqui"
    @success="handleSuccess"
    @error="handleError"
  />
</template>
```

## API del Composable `useVideoUpload`

### Parámetros

| Opción | Tipo | Descripción |
|--------|------|-------------|
| `repository` | `VideoRepository` | Implementación del repositorio |
| `currentUserId` | `string` | ID del usuario actual |
| `useGlobalState` | `boolean` | Opcional: usar estado global compartido |

### Retorno

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `state` | `VideoUploadState` | Estado reactivo de la subida (readonly) |
| `uploadVideo` | `Function` | Función para iniciar la subida |
| `resetState` | `Function` | Resetea el estado inicial |
| `cancelUpload` | `Function` | Cancela la subida en progreso |
| `formatProgress` | `Function` | Formatea el progreso para mostrar |
| `isComplete` | `Function` | Verifica si la subida está completa |
| `hasError` | `Function` | Verifica si hay error |

### Estado Reactivo

```typescript
interface VideoUploadState {
  isUploading: boolean      // Indica si está subiendo
  isProcessing: boolean      // Indica si está procesando
  progress: {
    loaded: number           // Bytes cargados
    total: number            // Bytes totales
    percentage: number       // Porcentaje 0-100
  }
  error: string | null      // Mensaje de error si falla
  video: Video | null       // Video subido exitosamente
}
```

## Validaciones

El sistema valida automáticamente:

- **Formatos soportados**: MP4, WebM, OGG, QuickTime, AVI, MKV
- **Tamaño máximo**: 2 GB
- **Título requerido**: máximo 200 caracteres
- **Descripción opcional**: máximo 2000 caracteres
- **Archivo no vacío**

## Arquitectura

El módulo sigue **Clean Architecture** con capas bien definidas:

```
┌─────────────────────────────────────┐
│  Presentation (Vue Components)      │  ← VideoUploadForm.vue
│  Composables (useVideoUpload)       │  ← Lógica reactiva Vue
├─────────────────────────────────────┤
│  Application (VideoService)         │  ← Orquesta casos de uso
├─────────────────────────────────────┤
│  Domain (Entities, Repository I/F)   │  ← Reglas de negocio puras
├─────────────────────────────────────┤
│  Infrastructure (SupabaseRepo)      │  ← Implementación con Supabase
└─────────────────────────────────────┘
```

## Troubleshooting

### Error: `403 Invalid Compact JWS` o `JWSError (CompactDecodeError)`

Este error indica que Supabase rechazó la autenticación. El token JWT es inválido o no tienes permisos.

#### Soluciones rápidas:

**OPCIÓN 1: Desarrollo (rápido pero inseguro)**
```env
# En .env, usa la Service Role Key (tiene privilegios totales)
VITE_SUPABASE_SERVICE_KEY=eyJhbG...your-service-key
```
⚠️ Solo para desarrollo local. NUNCA uses Service Key en producción frontend.

**OPCIÓN 2: Configurar RLS en Supabase (recomendado)**
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Tu proyecto → Storage → Buckets → `gallary`
3. Policies → New Policy
4. Selecciona "For full customization, create a policy from scratch"
5. Configura:
   - **Name**: `Allow uploads`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `anon` (para desarrollo) o `authenticated` (para producción)
   - **Policy definition**: `bucket_id = 'gallary'`

**OPCIÓN 3: Deshabilitar RLS temporalmente**
```sql
-- En SQL Editor de Supabase
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### Configuración completa del bucket 'gallary'

Ejecuta este SQL en Supabase Dashboard → SQL Editor:

```sql
-- 1. Crear bucket (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallary', 'gallary', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir lectura pública (todos pueden ver videos)
CREATE POLICY "Public Read" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallary');

-- 3. Permitir subida ANÓNIMA (para desarrollo)
-- Cambia TO anon por TO authenticated en producción
CREATE POLICY "Anonymous Upload" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'gallary');

-- 4. Permitir eliminación del propietario
CREATE POLICY "Owner Delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'gallary');
```

## Extensiones Futuras Sugeridas

- [ ] Generación de thumbnails automática
- [ ] Compresión de video antes de subir
- [ ] Cola de subidas múltiples
- [ ] Reanudación de subidas interrumpidas
- [ ] Procesamiento en segundo plano con workers
