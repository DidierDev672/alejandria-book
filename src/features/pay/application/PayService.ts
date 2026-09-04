import type {
  PayMemberBrief,
  PayMembership,
  PayPlanBrief,
  Payment,
  PaymentDraft,
  PaymentRepository,
  PaySelectionContext,
  PaySubmitOutcome,
} from '../domain/Pay'
import { PaymentDomainService } from '../domain/Pay'

// ============================================================
// APPLICATION · PayService
// Capa 2 — Casos de uso: reglas de negocio que coordinan
// acciones sin conocer la infraestructura concreta.
// Depende del puerto (PaymentRepository), no de un adaptador.
// ============================================================

export class PayService {
  constructor(private readonly repository: PaymentRepository) {}

  async list(): Promise<Payment[]> {
    return this.repository.list()
  }

  async findMemberById(id: string): Promise<PayMemberBrief> {
    return this.repository.findMemberById(id)
  }

  async findMembershipById(id: string): Promise<PayMembership> {
    return this.repository.findMembershipById(id)
  }

  async findPlanById(id: string): Promise<PayPlanBrief> {
    return this.repository.findPlanById(id)
  }

  async listMembershipsByMember(memberId: string): Promise<PayMembership[]> {
    return this.repository.listMembershipsByMember(memberId)
  }

  async register(draft: PaymentDraft, selection: PaySelectionContext): Promise<PaySubmitOutcome> {
    if (PaymentDomainService.hasErrors(PaymentDomainService.validateSelection(selection))) {
      return 'error'
    }

    if (PaymentDomainService.hasErrors(PaymentDomainService.validate(draft))) {
      return 'error'
    }

    try {
      const payload = PaymentDomainService.toApiPayload(draft, selection)
      await this.repository.register(payload)
      return 'success'
    } catch (error) {
      console.error('[PayService] register error:', error)
      return 'error'
    }
  }
}