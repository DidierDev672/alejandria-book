// ============================================================
// COMPOSABLE - AI routine chat system prompt builder
// Precarga / reconstruye el system prompt con inventario real.
// ============================================================

import { ref } from 'vue'
import { useEquipmentContext } from './useEquipmentContext'
import type { GymInventoryContextResult } from '../domain/entities/GymInventoryContext.types'
import { GymInventoryContextFormatter } from '../domain/services/GymInventoryContextFormatter'
import { AI_COACH_SYSTEM_PROMPT } from '../domain/services/AiCoachPolicy'
import { EndpointSpanishGlossary } from '../domain/services/EndpointSpanishGlossary'

export function useAiRoutineChat() {
  const { buildEquipmentContext, loading, error, inventory } = useEquipmentContext()
  const cachedSystemPrompt = ref<string | null>(null)
  const cachedInventory = ref<GymInventoryContextResult | null>(null)

  /**
   * Builds the full system prompt including real equipment data.
   * Called on mount (cache) and refreshed on each routine generation.
   */
  async function buildSystemPrompt(options?: { forceRefresh?: boolean }): Promise<string> {
    if (!options?.forceRefresh && cachedSystemPrompt.value) {
      return cachedSystemPrompt.value
    }

    const blocks = await buildEquipmentContext()
    const result: GymInventoryContextResult = inventory.value ?? {
      blocks,
      equipmentFetchFailed: blocks.length === 0 && Boolean(error.value),
      emptyActiveEquipment: blocks.length === 0 && !error.value,
    }

    cachedInventory.value = result

    const prompt = (
      AI_COACH_SYSTEM_PROMPT +
      EndpointSpanishGlossary.toSystemContext() +
      GymInventoryContextFormatter.toSystemContext(result)
    ).trim()

    cachedSystemPrompt.value = prompt
    return prompt
  }

  function getCachedInventory(): GymInventoryContextResult | null {
    return cachedInventory.value
  }

  function clearPromptCache(): void {
    cachedSystemPrompt.value = null
    cachedInventory.value = null
  }

  return {
    loading,
    error,
    cachedSystemPrompt,
    buildSystemPrompt,
    getCachedInventory,
    clearPromptCache,
  }
}
