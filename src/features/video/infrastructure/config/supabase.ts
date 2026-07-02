/**
 * Configuración de Supabase para el feature de Video
 * Lee variables de entorno para inicializar el cliente
 */

import type { SupabaseConfig } from "../repositories/SupabaseVideoRepository";

/**
 * Obtiene la configuración de Supabase desde variables de entorno
 * Las variables deben estar definidas en .env:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY (para operaciones de cliente)
 * - VITE_SUPABASE_SERVICE_KEY (opcional, para bypass RLS - SOLO SERVIDOR)
 * - VITE_SUPABASE_VIDEO_BUCKET (default: 'gallary')
 *
 * NOTA: La Service Key tiene privilegios totales. NUNCA la expongas en el frontend.
 * Solo úsala en entornos controlados o durante desarrollo.
 */
export function getSupabaseVideoConfig(): SupabaseConfig {
  const url = import.meta.env.VITE_SUPABASE_URL;

  // Usar Service Key si está disponible (bypass RLS), de lo contrario usar Anon Key
  const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const apiKey = serviceKey || anonKey;

  // Usar 'gallary' como bucket por defecto (según configuración del proyecto)
  const bucketName = import.meta.env.VITE_SUPABASE_VIDEO_BUCKET || "gallary";

  if (!url) {
    throw new Error(
      "Falta VITE_SUPABASE_URL en las variables de entorno. " +
        "Asegúrate de definirlo en tu archivo .env",
    );
  }

  if (!apiKey) {
    throw new Error(
      "Falta API Key de Supabase. " +
        "Define VITE_SUPABASE_ANON_KEY o VITE_SUPABASE_SERVICE_KEY en tu archivo .env",
    );
  }

  // Log de advertencia si se usa Service Key en frontend
  if (serviceKey && typeof window !== "undefined") {
    console.warn(
      "[SupabaseVideo] ⚠️ Usando SERVICE_KEY en entorno de navegador. " +
        "Esto es INSEGURO para producción. " +
        "Configura políticas RLS adecuadas y usa VITE_SUPABASE_ANON_KEY",
    );
  }

  return {
    url,
    anonKey: apiKey,
    bucketName,
  };
}

/**
 * SQL para configurar el bucket 'gallary' en Supabase Storage
 * Ejecutar en Supabase Dashboard → SQL Editor:

-- 1. Crear bucket 'gallary' (si no existe)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallary', 'gallary', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar políticas RLS en el bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Política: Permitir lectura pública (todos pueden ver los videos)
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallary');

-- 4. Política: Permitir subida ANÓNIMA (para desarrollo/testing)
-- ⚠️ QUITAR EN PRODUCCIÓN - Solo usar con Service Key
CREATE POLICY "Anonymous Upload" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'gallary');

-- 5. Política: Permitir subida a usuarios autenticados (producción)
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallary');

-- 6. Política: Permitir eliminación del propietario
CREATE POLICY "Owner Delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'gallary' AND owner = auth.uid()::text);

-- Para DESARROLLO rápido (deshabilitar RLS temporalmente):
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Para PRODUCCIÓN segura (requiere autenticación):
-- Asegúrate de que los usuarios estén autenticados antes de subir
-- o usa la Service Role Key desde el backend

*/

/**
 * SQL para crear la tabla de videos en Supabase (opcional)
 * Solo si necesitas tracking de videos en BD:

```sql
-- Crear tabla de videos (OPCIONAL - solo si necesitas metadata en BD)
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  duration_seconds INTEGER,
  thumbnail_url TEXT,
  created_by TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_videos_created_by ON videos(created_by);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Políticas RLS para tabla videos (si la usas)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own videos" ON videos
  FOR SELECT USING (auth.uid()::text = created_by);

CREATE POLICY "Users can insert own videos" ON videos
  FOR INSERT WITH CHECK (auth.uid()::text = created_by);
```
*/
