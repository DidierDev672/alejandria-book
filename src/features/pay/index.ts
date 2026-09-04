// ============================================================
// PAY FEATURE - Public API Exports
// ============================================================

// Domain
export type {
  Payment,
  PaymentMethod,
  PayContext,
  PayMembership,
  PaymentDraft,
  PaymentValidationErrors,
  PaySelectionContext,
  PaySubmitOutcome,
  RegisterPaymentPayload,
  PaymentRepository,
} from './domain/Pay'
export { PaymentDomainService, PAYMENT_METHODS, PAY_CONTEXTS } from './domain/Pay'

// Application
export { PayService } from './application/PayService'
export { usePayRegisterStore, isPaySuccess } from './application/stores/usePayRegisterStore'
export { usePayListStore } from './application/stores/usePayListStore'

// Infrastructure
export { HttpPayRepository, PayHttpError } from './infrastructure/http/HttpPayRepository'

// Presentation - Components (Atomic Design)
export { default as MembershipPillBadge } from './presentation/components/atoms/MembershipPillBadge.vue'
export { default as PayAmountInput } from './presentation/components/atoms/PayAmountInput.vue'
export { default as PayDateField } from './presentation/components/atoms/PayDateField.vue'
export { default as PayContextTextarea } from './presentation/components/atoms/PayContextTextarea.vue'
export { default as PayMethodIcon } from './presentation/components/atoms/PayMethodIcon.vue'
export { default as PayMethodBadge } from './presentation/components/atoms/PayMethodBadge.vue'
export { default as PlanStatusBadge } from './presentation/components/atoms/PlanStatusBadge.vue'
export { default as Badge } from './presentation/components/atoms/Badge.vue'
export { default as MemberSelectCard } from './presentation/components/molecules/MemberSelectCard.vue'
export { default as MembershipPlanCard } from './presentation/components/molecules/MembershipPlanCard.vue'
export { default as PaymentMethodDropdown } from './presentation/components/molecules/PaymentMethodDropdown.vue'
export { default as PayContextDropdown } from './presentation/components/molecules/PayContextDropdown.vue'
export { default as PaymentMethodPicker } from './presentation/components/molecules/PaymentMethodPicker.vue'
export { default as PaymentSummaryCard } from './presentation/components/molecules/PaymentSummaryCard.vue'
export { default as MemberSelectModal } from './presentation/components/organisms/MemberSelectModal.vue'

// Presentation - Pages
export { default as PaymentRegisterPage } from './presentation/pages/PaymentRegisterPage.vue'
export { default as PaymentListPage } from './presentation/pages/PaymentListPage.vue'
