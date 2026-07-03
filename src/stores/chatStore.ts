/**
 * chatStore — Historial de chat con IA persistido en Supabase.
 *
 * Esquema SQL requerido (ejecutar en Supabase SQL Editor):
 *
 * create table if not exists chat_messages (
 *   id         uuid primary key default gen_random_uuid(),
 *   user_id    text not null,
 *   role       text not null check (role in ('user', 'assistant')),
 *   content    text not null,
 *   created_at timestamptz default now()
 * );
 *
 * create index if not exists chat_messages_user_created
 *   on chat_messages (user_id, created_at asc);
 *
 * Nota: El proyecto usa su propio sistema de auth (no Supabase Auth).
 * user_id se toma del objeto almacenado en localStorage bajo 'auth_user'.
 * El cliente Supabase usa SERVICE_KEY para omitir RLS en desarrollo.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

// ============================================================
// TYPES
// ============================================================

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface AiConfig {
  provider: 'ollama' | 'openai-compat'
  baseUrl: string
  model: string
  apiKey: string
}

// ============================================================
// CONSTANTS
// ============================================================

const MAX_MESSAGES = 100

// ============================================================
// STORE
// ============================================================

export const useChatStore = defineStore('chat', () => {
  // ── State ──────────────────────────────────────────────────
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)  // IA está generando respuesta
  const saving = ref(false)   // Escritura en Supabase en curso
  const error = ref<string | null>(null)

  // ── Helpers ────────────────────────────────────────────────

  /** Obtiene el ID del usuario del sistema de auth propio de la app. */
  function getUserId(): string | null {
    try {
      const raw = localStorage.getItem('auth_user')
      if (raw) {
        const user = JSON.parse(raw)
        return user?.id ?? null
      }
    } catch {
      /* ignorar errores de parseo */
    }
    return null
  }

  /**
   * Crea un mensaje local (sin Supabase) para casos donde no hay sesión
   * o cuando la escritura en Supabase falla.
   */
  function makeLocalMessage(
    role: 'user' | 'assistant',
    content: string,
  ): ChatMessage {
    return {
      id: crypto.randomUUID(),
      role,
      content,
      created_at: new Date().toISOString(),
    }
  }

  // ── Actions ────────────────────────────────────────────────

  /**
   * Carga los últimos MAX_MESSAGES mensajes del usuario desde Supabase.
   * Silencia el error si falla — el chat igual funciona en modo local.
   */
  async function loadFromCloud(): Promise<void> {
    const userId = getUserId()
    if (!userId) return

    const { data, error: err } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(MAX_MESSAGES)

    if (err) {
      console.error('[chatStore] Error al cargar historial:', err.message)
      return
    }

    messages.value = (data ?? []) as ChatMessage[]
  }

  /**
   * Persiste un mensaje en Supabase y lo agrega al array local.
   * Si no hay sesión o falla Supabase, lo agrega igual en modo local.
   */
  async function saveMessage(
    role: 'user' | 'assistant',
    content: string,
  ): Promise<ChatMessage | null> {
    const userId = getUserId()

    // Sin sesión → modo local
    if (!userId) {
      const local = makeLocalMessage(role, content)
      messages.value.push(local)
      return local
    }

    saving.value = true

    const { data, error: err } = await supabase
      .from('chat_messages')
      .insert({ role, content, user_id: userId })
      .select('id, role, content, created_at')
      .single()

    saving.value = false

    if (err) {
      console.error('[chatStore] Error al guardar mensaje:', err.message)
      // Fallback local: el mensaje igual aparece en el chat
      const local = makeLocalMessage(role, content)
      messages.value.push(local)
      return local
    }

    messages.value.push(data as ChatMessage)
    return data as ChatMessage
  }

  /**
   * Flujo completo:
   * 1. Guarda el mensaje del usuario en Supabase de inmediato.
   * 2. Llama a la API de IA con el historial completo + system prompt.
   * 3. Guarda la respuesta del asistente en Supabase.
   */
  async function sendMessage(
    userText: string,
    context: { systemPrompt: string; aiConfig: AiConfig },
  ): Promise<void> {
    if (!userText.trim() || loading.value) return

    error.value = null

    // 1. Persistir y mostrar el mensaje del usuario de inmediato
    await saveMessage('user', userText)

    loading.value = true

    try {
      // 2. Construir contexto: system prompt + historial completo
      const history = [
        { role: 'system', content: context.systemPrompt },
        ...messages.value.map((m) => ({ role: m.role, content: m.content })),
      ]

      const reply = await callAiApi(history, context.aiConfig)

      // 3. Persistir y mostrar la respuesta del asistente
      await saveMessage('assistant', reply)
    } catch (e: any) {
      error.value =
        e?.message ?? 'No se pudo conectar con el modelo. Verifica que esté activo.'
      console.error('[chatStore] Error al llamar a la IA:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Llama al endpoint de IA (Ollama o API OpenAI-compatible).
   * Retorna el contenido de la respuesta del asistente.
   */
  async function callAiApi(
    msgs: { role: string; content: string }[],
    cfg: AiConfig,
  ): Promise<string> {
    if (cfg.provider === 'ollama') {
      const res = await fetch(`${cfg.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: cfg.model, messages: msgs, stream: false }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Ollama error ${res.status}: ${body}`)
      }
      const data = await res.json()
      return data.message?.content ?? data.response ?? ''
    } else {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (cfg.apiKey) headers['Authorization'] = `Bearer ${cfg.apiKey}`

      const res = await fetch(`${cfg.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ model: cfg.model, messages: msgs }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`API error ${res.status}: ${body}`)
      }
      const data = await res.json()
      return data.choices?.[0]?.message?.content ?? ''
    }
  }

  /**
   * Elimina todos los mensajes del usuario en Supabase y limpia el array local.
   * Si no hay sesión, solo limpia el estado local.
   */
  async function clearHistory(): Promise<void> {
    const userId = getUserId()

    if (userId) {
      const { error: err } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId)

      if (err) {
        console.error('[chatStore] Error al limpiar historial:', err.message)
        return
      }
    }

    messages.value = []
  }

  // ── Public API ─────────────────────────────────────────────

  return {
    messages,
    loading,
    saving,
    error,
    loadFromCloud,
    sendMessage,
    clearHistory,
  }
})
