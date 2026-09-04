// ============================================================
// MEMBERSHIPS FEATURE - Public API Exports
// ============================================================

// Domain
export type {
  MembershipType,
  MembershipDurationDays,
  MembershipPlanPayload,
  MembershipSubmitOutcome,
  MembershipDraft,
  MembershipValidationErrors,
  MembershipRegisterPayload,
} from './domain/entities/Membership.types'
export type {
  MembershipRegistration,
  MembershipRegistrationStatus,
} from './domain/entities/MembershipRegistration.types'
export { isMembershipActive } from './domain/entities/MembershipRegistration.types'
export type { MembershipRepository } from './domain/repositories/MembershipRepository'
export { MembershipDomainService, MEMBERSHIP_DURATION_OPTIONS } from './domain/services/MembershipDomainService'

// Application
export { useMembershipFormStore } from './application/stores/useMembershipFormStore'
export { useMembershipListStore } from './application/stores/useMembershipListStore'
export { useMembershipEnrollStore } from './application/stores/useMembershipEnrollStore'
export { useMembershipRegistrationsStore } from './application/stores/useMembershipRegistrationsStore'

// Infrastructure
export {
  HttpMembershipRepository,
  MembershipListHttpError,
  MembershipRegisterHttpError,
  MembershipLookupHttpError,
} from './infrastructure/http/HttpMembershipRepository'

// Presentation - Components (Atomic Design)
export { default as MemberPickerCard } from './presentation/components/molecules/MemberPickerCard.vue'
export { default as PlanPickerCard } from './presentation/components/molecules/PlanPickerCard.vue'
export { default as MembershipRegistrationCard } from './presentation/components/molecules/MembershipRegistrationCard.vue'
export { default as MemberPickerModal } from './presentation/components/organisms/MemberPickerModal.vue'
export { default as PlanPickerModal } from './presentation/components/organisms/PlanPickerModal.vue'
export { default as MembershipDetailModal } from './presentation/components/organisms/MembershipDetailModal.vue'

// Presentation - Pages
export { default as MembershipCreatePage } from './presentation/pages/MembershipCreatePage.vue'
export { default as MembershipListPage } from './presentation/pages/MembershipListPage.vue'
export { default as MembershipEnrollPage } from './presentation/pages/MembershipEnrollPage.vue'
export { default as MembershipRegistrationsPage } from './presentation/pages/MembershipRegistrationsPage.vue'
