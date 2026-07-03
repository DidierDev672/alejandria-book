/**
 * Cliente Supabase compartido para toda la aplicación.
 *
 * Usa VITE_SUPABASE_SERVICE_KEY (si existe) para entornos de desarrollo local,
 * ya que el proyecto utiliza su propio sistema de auth (no Supabase Auth)
 * y el Service Key omite las políticas RLS.
 *
 * En producción, reemplaza por VITE_SUPABASE_ANON_KEY y configura RLS
 * apropiadamente con tu proveedor de auth.
 */
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = (
  import.meta.env.VITE_SUPABASE_SERVICE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY
) as string

if (!url || !key) {
  throw new Error(
    '[Supabase] Faltan variables de entorno: VITE_SUPABASE_URL y ' +
    'VITE_SUPABASE_ANON_KEY (o VITE_SUPABASE_SERVICE_KEY).',
  )
}

export const supabase = createClient(url, key)
