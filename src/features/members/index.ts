// ============================================================
// MEMBERS FEATURE - Public API Exports
// ============================================================

// Domain
export type * from './domain/entities/Member.types'
export type { MemberRepository, MemberFilters } from './domain/repositories/MemberRepository'
export { MemberDomainService } from './domain/services/MemberDomainService'

// Application
export { MemberService } from './application/services/MemberService'
export { 
  useMemberStore,
  DOCUMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  GOAL_TYPE_OPTIONS,
  MOOD_OPTIONS,
  SEVERITY_OPTIONS
} from './application/stores/useMemberStore'

// Infrastructure
export { HttpMemberRepository } from './infrastructure/http/HttpMemberRepository'

// Presentation - Components (Atomic Design)
export { default as MemberFieldLabel } from './presentation/components/atoms/MemberFieldLabel.vue'
export { default as MemberInput } from './presentation/components/atoms/MemberInput.vue'
export { default as MemberSelect } from './presentation/components/atoms/MemberSelect.vue'
export { default as MemberTextarea } from './presentation/components/atoms/MemberTextarea.vue'
export { default as BMIIndicator } from './presentation/components/atoms/BMIIndicator.vue'

export { default as MemberFormField } from './presentation/components/molecules/MemberFormField.vue'
export { default as HealthConditionCard } from './presentation/components/molecules/HealthConditionCard.vue'
export { default as MemberGoalCard } from './presentation/components/molecules/MemberGoalCard.vue'

export { default as MemberBasicInfoForm } from './presentation/components/organisms/MemberBasicInfoForm.vue'
export { default as MemberHealthForm } from './presentation/components/organisms/MemberHealthForm.vue'

// Presentation - Pages
export { default as MemberCreatePage } from './presentation/pages/MemberCreatePage.vue'