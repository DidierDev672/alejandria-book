import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Payment } from '../../domain/Pay'
import { HttpPayRepository, PayHttpError } from '../../infrastructure/http/HttpPayRepository'
import { PayService } from '../PayService'

// ============================================================
// APPLICATION · usePayListStore
// Estado y casos de uso para la lista de pagos.
// Consume GET /pays vía el puerto PaymentRepository y,
// por cada pago, enriquece miembro y plan (GET /members/{id},
// GET /memberships/{id}, GET /planes/{id}) tolerando errores 4xx.
// ============================================================

export type PayListKind = 'idle' | 'loading' | 'ok' | 'empty' | 'error'

export interface PayListFeedback {
  title: string
  description: string
}

// Fila enriquecida que la tabla renderiza. Los detalles pueden
// ser null cuando el backend responde 400 (o falla) al pedirlos.
export interface PayListRow {
  id: string
  member_id: string
  membership_id: string
  amount: number
  date_pay: string
  context: Payment['context']
  memberName: string | null
  memberMissing: boolean
  // Detalle completo del miembro para el modal (cascada).
  memberDetail: {
    name_full: string | null
    type_document: string | null
    number_document: string | null
    phone_number: string | null
  } | null
  planName: string | null
  planMissing: boolean
  // Detalle completo del plan para el modal (cascada).
  planDetail: {
    name: string | null
    type: string | null
    duration_days: number | null
    price: number | null
    price_per_class: number | null
    classes_included: number | null
    is_active: boolean | null
  } | null
}

export const usePayListStore = defineStore('payList', () => {
  const service = new PayService(new HttpPayRepository())

  const items = ref<Payment[]>([])
  const isLoading = ref(false)
  const kind = ref<PayListKind>('idle')
  const feedback = ref<PayListFeedback | null>(null)

  const totalItems = computed(() => items.value.length)

  const totalAmount = computed(() =>
    items.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
  )

  // El dashboard de filas aún vacío; se llena tras enriquecer.
  const rows = ref<PayListRow[]>([])

  function toRow(payment: Payment): PayListRow {
    return {
      id: payment.id,
      member_id: payment.member_id,
      membership_id: payment.membership_id,
      amount: payment.amount,
      date_pay: payment.date_pay,
      context: payment.context,
      memberName: null,
      memberMissing: false,
      memberDetail: null,
      planName: null,
      planMissing: false,
      planDetail: null,
    }
  }

  // Devuelve false si el detalle no se pudo obtener (p.ej. 400).
  async function enrichRow(row: PayListRow): Promise<void> {
    const [member, membershipId, planId] = await Promise.allSettled([
      service.findMemberById(row.member_id),
      service.findMembershipById(row.membership_id),
    ])

    if (member.status === 'fulfilled' && member.value?.name_full) {
      row.memberName = member.value.name_full
      row.memberDetail = {
        name_full: member.value.name_full ?? null,
        type_document: member.value.type_document ?? null,
        number_document: member.value.number_document ?? null,
        phone_number: member.value.phone_number ?? null,
      }
    } else {
      row.memberMissing = true
    }

    let membershipPlanId: string | null = null
    if (membershipId.status === 'fulfilled' && membershipId.value?.plan_id) {
      membershipPlanId = membershipId.value.plan_id
    }

    if (membershipPlanId) {
      const plan = await service.findPlanById(membershipPlanId).catch(() => null)
      if (plan?.name) {
        row.planName = plan.name
        row.planDetail = {
          name: plan.name ?? null,
          type: plan.type ?? null,
          duration_days: plan.duration_days ?? null,
          price: plan.price ?? null,
          price_per_class: plan.price_per_class ?? null,
          classes_included: plan.classes_included ?? null,
          is_active: plan.is_active ?? null,
        }
      } else {
        row.planMissing = true
      }
    } else {
      row.planMissing = true
    }
  }

  async function fetchPays(): Promise<void> {
    isLoading.value = true
    kind.value = 'loading'
    feedback.value = null
    rows.value = []

    try {
      const data = await service.list()
      items.value = data

      if (data.length === 0) {
        kind.value = 'empty'
        feedback.value = {
          title: 'Aún no hay pagos registrados',
          description:
            'La caja está tranquila por ahora. Cuando se registre el primer pago, aparecerá aquí, con su dueño y su historia.',
        }
        return
      }

      const prepared = data.map(toRow)
      await Promise.all(prepared.map(enrichRow))
      rows.value = prepared
      kind.value = 'ok'
    } catch (error: unknown) {
      items.value = []
      kind.value = 'error'
      feedback.value = buildErrorFeedback(error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    items,
    rows,
    isLoading,
    kind,
    feedback,
    totalItems,
    totalAmount,
    fetchPays,
  }
})

function buildErrorFeedback(error: unknown): PayListFeedback {
  if (error instanceof PayHttpError && error.status === 400) {
    return {
      title: 'Se presentó un error al obtener los pagos',
      description:
        'No fue culpa tuya: la información no llegó como esperábamos, así que preferimos no inventar nada. Respira, y cuando quieras lo intentamos otra vez.',
    }
  }

  return {
    title: 'No pudimos cargar los pagos',
    description:
      'Algo se interpuso entre el sistema y el histórico de la caja. Nada se perdió; por favor, inténtalo de nuevo en un momento.',
  }
}
