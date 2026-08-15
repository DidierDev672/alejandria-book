// ============================================================
// APPLICATION USE CASE - Send Coach Message (SOLID)
// Antes de llamar a Ollama: inventario real (equipment active +
// exercises por equipment_id) + members + plantillas opcionales.
// ============================================================

import type { AiChatRepository } from '../../domain/repositories/AiChatRepository'
import type { MembersContextProvider } from '../../domain/repositories/MembersContextProvider'
import type { GymInventoryContextProvider } from '../../domain/repositories/GymInventoryContextProvider'
import type { RoutineTemplatesContextProvider } from '../../domain/repositories/RoutineTemplatesContextProvider'
import type { ChatMessage, OllamaMessage } from '../../domain/entities/AiChat.types'
import type { MemberCoachProfile } from '../../domain/entities/MemberCoachProfile.types'
import type { RoutineTemplateCoachItem } from '../../domain/entities/RoutineTemplateCoach.types'
import type { GymInventoryContextResult } from '../../domain/entities/GymInventoryContext.types'
import {
  AiCoachPolicy,
  AI_COACH_SYSTEM_PROMPT,
} from '../../domain/services/AiCoachPolicy'
import { MembersContextFormatter } from '../../domain/services/MembersContextFormatter'
import { GymInventoryContextFormatter } from '../../domain/services/GymInventoryContextFormatter'
import { RoutineTemplatesContextFormatter } from '../../domain/services/RoutineTemplatesContextFormatter'
import { ExerciseCatalogGuard } from '../../domain/services/ExerciseCatalogGuard'
import { EndpointSpanishGlossary } from '../../domain/services/EndpointSpanishGlossary'
import { CoachResponseSanitizer } from '../../domain/services/CoachResponseSanitizer'

export type CoachReply =
  | { kind: 'answer'; content: string }
  | { kind: 'refusal'; content: string }

function emptyInventory(): GymInventoryContextResult {
  return {
    blocks: [],
    equipmentFetchFailed: true,
    emptyActiveEquipment: false,
  }
}

export class SendCoachMessageUseCase {
  constructor(
    private readonly repository: AiChatRepository,
    private readonly membersProvider?: MembersContextProvider,
    private readonly gymInventoryProvider?: GymInventoryContextProvider,
    private readonly routineTemplatesProvider?: RoutineTemplatesContextProvider,
    /** Inventario precargado (cache de página); si falta, se vuelve a pedir */
    private cachedInventory: GymInventoryContextResult | null = null,
  ) {}

  setCachedInventory(inventory: GymInventoryContextResult | null): void {
    this.cachedInventory = inventory
  }

  async execute(history: ChatMessage[], prompt: string): Promise<CoachReply> {
    const verdict = AiCoachPolicy.evaluatePrompt(prompt)
    if (!verdict.allowed) {
      return { kind: 'refusal', content: verdict.refusalMessage! }
    }

    // Inventario: secuencia obligatoria en cada generación de rutina
    const [members, inventory, routineTemplates] = await Promise.all([
      this.membersProvider
        ? this.membersProvider.getMembers().catch((error) => {
            console.warn('[SendCoachMessageUseCase] No se pudo cargar miembros:', error)
            return [] as MemberCoachProfile[]
          })
        : Promise.resolve([] as MemberCoachProfile[]),
      this.gymInventoryProvider
        ? this.gymInventoryProvider.buildInventoryContext().catch((error) => {
            console.warn('[SendCoachMessageUseCase] Inventario falló:', error)
            return this.cachedInventory ?? emptyInventory()
          })
        : Promise.resolve(this.cachedInventory ?? emptyInventory()),
      this.routineTemplatesProvider
        ? this.routineTemplatesProvider.getRoutineTemplates().catch((error) => {
            console.warn('[SendCoachMessageUseCase] No se pudo cargar /api/routines:', error)
            return [] as RoutineTemplateCoachItem[]
          })
        : Promise.resolve([] as RoutineTemplateCoachItem[]),
    ])

    this.cachedInventory = inventory

    const exercisesCatalog = GymInventoryContextFormatter.toExercisesCatalog(inventory)
    const equipment = GymInventoryContextFormatter.toEquipmentList(inventory)

    const systemPrompt =
      AI_COACH_SYSTEM_PROMPT +
      EndpointSpanishGlossary.toSystemContext() +
      MembersContextFormatter.toSystemContext(members) +
      GymInventoryContextFormatter.toSystemContext(inventory) +
      RoutineTemplatesContextFormatter.toSystemContext(routineTemplates)

    const messages: OllamaMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history
        .filter((m) => !m.blockedByPolicy && (m.role === 'user' || m.role === 'assistant'))
        .map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: prompt },
    ]

    const rawContent = await this.repository.sendChat(messages)

    const { content: validated } = ExerciseCatalogGuard.validateResponse(
      rawContent,
      exercisesCatalog,
    )

    const content = CoachResponseSanitizer.toTrainerFriendly(
      validated,
      exercisesCatalog,
      members,
      equipment,
      routineTemplates.map((r) => r.id).filter((id): id is string => Boolean(id)),
    )

    return { kind: 'answer', content }
  }
}
