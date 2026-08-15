// ============================================================
// APPLICATION STORE - AI Routine Chat (Pinia)
// Composition root: inventario real (equipment active + exercises)
// antes de cada respuesta de Ollama.
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SendCoachMessageUseCase, type CoachReply } from '../use-cases/SendCoachMessageUseCase'
import { OllamaChatRepository } from '../../infrastructure/http/OllamaChatRepository'
import { HttpMembersContextProvider } from '../../infrastructure/http/HttpMembersContextProvider'
import { HttpGymInventoryContextProvider } from '../../infrastructure/http/HttpGymInventoryContextProvider'
import { HttpRoutineTemplatesContextProvider } from '../../infrastructure/http/HttpRoutineTemplatesContextProvider'
import { ViteOllamaBootstrapper } from '../../infrastructure/http/ViteOllamaBootstrapper'
import { OllamaUnavailableError } from '../../domain/entities/AiChat.errors'
import type { ChatMessage } from '../../domain/entities/AiChat.types'
import type { GymInventoryContextResult } from '../../domain/entities/GymInventoryContext.types'

const BOOT_RETRY_ATTEMPTS = 5
const BOOT_RETRY_DELAY_MS = 6_000

function createMessage(
  role: ChatMessage['role'],
  content: string,
  blockedByPolicy = false,
): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    blockedByPolicy,
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const useAiRoutineChatStore = defineStore('aiRoutineChat', () => {
  const messages = ref<ChatMessage[]>([])
  const thinking = ref(false)
  const booting = ref(false)
  const error = ref<string | null>(null)
  const contextLoading = ref(false)
  const contextError = ref<string | null>(null)

  const gymInventoryProvider = new HttpGymInventoryContextProvider()

  const sendCoachMessage = new SendCoachMessageUseCase(
    new OllamaChatRepository(),
    new HttpMembersContextProvider(),
    gymInventoryProvider,
    new HttpRoutineTemplatesContextProvider(),
  )
  const bootstrapper = new ViteOllamaBootstrapper()

  const isThinking = computed(() => thinking.value)
  const isBooting = computed(() => booting.value)
  const hasMessages = computed(() => messages.value.length > 0)
  const hasError = computed(() => error.value !== null)

  /** Precarga inventario en mount (cache); cada send vuelve a pedir datos frescos */
  async function preloadInventoryContext(): Promise<GymInventoryContextResult> {
    contextLoading.value = true
    contextError.value = null
    try {
      const inventory = await gymInventoryProvider.buildInventoryContext()
      sendCoachMessage.setCachedInventory(inventory)

      if (inventory.equipmentFetchFailed) {
        contextError.value =
          'No se pudo confirmar el equipamiento activo. Las rutinas serán genéricas hasta que el API responda.'
      } else if (inventory.emptyActiveEquipment) {
        contextError.value = 'No hay equipos activos en el gym. No se inventarán máquinas ni ejercicios.'
      } else {
        contextError.value = null
      }

      return inventory
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Error al cargar el inventario del gym.'
      contextError.value = message
      const fallback: GymInventoryContextResult = {
        blocks: [],
        equipmentFetchFailed: true,
        emptyActiveEquipment: false,
      }
      sendCoachMessage.setCachedInventory(fallback)
      return fallback
    } finally {
      contextLoading.value = false
    }
  }

  async function recoverAndRetry(
    history: ChatMessage[],
    prompt: string,
  ): Promise<CoachReply> {
    booting.value = true

    try {
      await bootstrapper.boot()

      let lastError: unknown = null
      for (let attempt = 1; attempt <= BOOT_RETRY_ATTEMPTS; attempt++) {
        await delay(BOOT_RETRY_DELAY_MS)
        try {
          return await sendCoachMessage.execute(history, prompt)
        } catch (e) {
          lastError = e
          if (!(e instanceof OllamaUnavailableError)) throw e
        }
      }

      console.error('[AiRoutineChatStore] Ollama no respondió tras el arranque:', lastError)
      throw new Error(
        'Estoy iniciando el modelo (ollama run llama3). Si es la primera vez puede tardar varios minutos en descargarse: vuelve a enviar tu mensaje en un momento.',
      )
    } finally {
      booting.value = false
    }
  }

  async function sendPrompt(rawPrompt: string): Promise<void> {
    const prompt = rawPrompt.trim()
    if (!prompt || thinking.value) return

    error.value = null
    const history = [...messages.value]
    messages.value = [...messages.value, createMessage('user', prompt)]
    thinking.value = true

    try {
      // execute() refresca inventario en cada request (GET /equipment + exercises)
      let reply: CoachReply
      try {
        reply = await sendCoachMessage.execute(history, prompt)
      } catch (e) {
        if (!(e instanceof OllamaUnavailableError)) throw e
        reply = await recoverAndRetry(history, prompt)
      }

      messages.value = [
        ...messages.value,
        createMessage('assistant', reply.content, reply.kind === 'refusal'),
      ]
    } catch (e: any) {
      const message = e?.message || 'No pude generar la rutina en este momento. Intenta de nuevo.'
      error.value = message
      messages.value = [
        ...messages.value,
        createMessage(
          'assistant',
          'No pude generar la rutina en este momento. Intenta de nuevo.',
        ),
      ]
      console.error('[AiRoutineChatStore] Error sending prompt:', e)
    } finally {
      thinking.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  function resetConversation(): void {
    messages.value = []
    thinking.value = false
    booting.value = false
    error.value = null
  }

  return {
    messages,
    thinking,
    booting,
    error,
    contextLoading,
    contextError,
    isThinking,
    isBooting,
    hasMessages,
    hasError,
    preloadInventoryContext,
    sendPrompt,
    clearError,
    resetConversation,
  }
})
