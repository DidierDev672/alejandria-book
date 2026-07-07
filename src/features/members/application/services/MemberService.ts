// ============================================================
// APPLICATION SERVICE - Member Use Cases
// ============================================================

import type { 
  Member, 
  CreateMemberDTO, 
  UpdateMemberDTO 
} from '../../domain/entities/Member.types'
import type { 
  MemberRepository, 
  MemberFilters 
} from '../../domain/repositories/MemberRepository'
import { MemberDomainService } from '../../domain/services/MemberDomainService'

export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}
  
  /**
   * Get all members with optional filtering
   */
  async getMembers(filters?: MemberFilters): Promise<Member[]> {
    return await this.memberRepository.findAll(filters)
  }
  
  /**
   * Get a member by ID
   */
  async getMemberById(id: string): Promise<Member> {
    const member = await this.memberRepository.findById(id)
    
    if (!member) {
      throw new Error('Miembro no encontrado')
    }
    
    return member
  }
  
  /**
   * Create a new member
   */
  async createMember(memberData: CreateMemberDTO): Promise<Member> {
    // Validate age
    if (!MemberDomainService.isValidAge(memberData.date_of_birth)) {
      throw new Error('La edad debe estar entre 12 y 120 años')
    }
    
    // Check if document already exists
    const documentExists = await this.memberRepository.existsByDocument(
      memberData.type_document,
      memberData.number_document
    )
    
    if (documentExists) {
      throw new Error('Ya existe un miembro registrado con este documento')
    }
    
    // Validate BMI calculation
    try {
      MemberDomainService.calculateBMI(memberData.weight_kg, memberData.height_cm)
    } catch {
      throw new Error('El peso y la altura deben ser valores positivos')
    }
    
    return await this.memberRepository.create(memberData)
  }
  
  /**
   * Update an existing member
   */
  async updateMember(id: string, memberData: UpdateMemberDTO): Promise<Member> {
    // Validate age if birth date is being updated
    if (memberData.date_of_birth && !MemberDomainService.isValidAge(memberData.date_of_birth)) {
      throw new Error('La edad debe estar entre 12 y 120 años')
    }
    
    // Check document uniqueness if document is being updated
    if (memberData.type_document && memberData.number_document) {
      const documentExists = await this.memberRepository.existsByDocument(
        memberData.type_document,
        memberData.number_document
      )
      
      if (documentExists) {
        // Check if it belongs to a different member
        const existingMember = await this.memberRepository.findById(id)
        if (existingMember && 
            (existingMember.type_document !== memberData.type_document || 
             existingMember.number_document !== memberData.number_document)) {
          throw new Error('Ya existe otro miembro registrado con este documento')
        }
      }
    }
    
    return await this.memberRepository.update(id, memberData)
  }
  
  /**
   * Delete a member
   */
  async deleteMember(id: string): Promise<void> {
    await this.memberRepository.delete(id)
  }
  
  /**
   * Search members by name or document
   */
  async searchMembers(query: string): Promise<Member[]> {
    return await this.memberRepository.findAll({
      search: query
    })
  }
  
  /**
   * Get members statistics
   */
  async getMembersStatistics(): Promise<{
    total: number
    averageAge: number
    averageBMI: number
    genderDistribution: Record<string, number>
    goalDistribution: Record<string, number>
  }> {
    const members = await this.memberRepository.findAll()
    
    if (members.length === 0) {
      return {
        total: 0,
        averageAge: 0,
        averageBMI: 0,
        genderDistribution: {},
        goalDistribution: {}
      }
    }
    
    const ages = members.map(member => MemberDomainService.calculateAge(member.date_of_birth))
    const bmis = members.filter(member => member.bmi).map(member => member.bmi!)
    
    const genderDistribution: Record<string, number> = {}
    const goalDistribution: Record<string, number> = {}
    
    members.forEach(member => {
      // Gender distribution
      const gender = MemberDomainService.getGenderLabel(member.gender)
      genderDistribution[gender] = (genderDistribution[gender] || 0) + 1
      
      // Goal distribution
      ;(member.goals ?? []).forEach(goal => {
        const goalType = MemberDomainService.getGoalTypeLabel(goal.goal_type)
        goalDistribution[goalType] = (goalDistribution[goalType] || 0) + 1
      })
    })
    
    return {
      total: members.length,
      averageAge: Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length),
      averageBMI: bmis.length > 0 
        ? Math.round((bmis.reduce((sum, bmi) => sum + bmi, 0) / bmis.length) * 10) / 10 
        : 0,
      genderDistribution,
      goalDistribution
    }
  }
}