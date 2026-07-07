// ============================================================
// DOMAIN REPOSITORY INTERFACE - Member Repository (Port)
// ============================================================

import type { Member, CreateMemberDTO, UpdateMemberDTO } from '../entities/Member.types'

export interface MemberRepository {
  /**
   * Retrieve all members with optional filtering
   */
  findAll(filters?: MemberFilters): Promise<Member[]>
  
  /**
   * Find a specific member by ID
   */
  findById(id: string): Promise<Member | null>
  
  /**
   * Create a new member
   */
  create(memberData: CreateMemberDTO): Promise<Member>
  
  /**
   * Update an existing member
   */
  update(id: string, memberData: UpdateMemberDTO): Promise<Member>
  
  /**
   * Delete a member by ID
   */
  delete(id: string): Promise<void>
  
  /**
   * Check if a document number is already registered
   */
  existsByDocument(typeDocument: string, numberDocument: string): Promise<boolean>
}

// ============================================================
// Filter Types
// ============================================================

export interface MemberFilters {
  search?: string
  gender?: string
  ageRange?: {
    min: number
    max: number
  }
  bmiRange?: {
    min: number
    max: number
  }
  hasActiveGoals?: boolean
  hasHealthConditions?: boolean
}