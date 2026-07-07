// ============================================================
// DOMAIN SERVICE - Member Business Rules
// ============================================================

import type { CreateMemberDTO, MemberFormState } from '../entities/Member.types'

export class MemberDomainService {
  /**
   * Calculate BMI based on weight and height
   */
  static calculateBMI(weightKg: number, heightCm: number): number {
    if (weightKg <= 0 || heightCm <= 0) {
      throw new Error('Weight and height must be positive numbers')
    }
    
    const heightM = heightCm / 100
    const bmi = weightKg / (heightM * heightM)
    return Math.round(bmi * 10) / 10 // Round to 1 decimal
  }
  
  /**
   * Get BMI category description
   */
  static getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Bajo peso'
    if (bmi < 25) return 'Peso normal'
    if (bmi < 30) return 'Sobrepeso'
    return 'Obesidad'
  }
  
  /**
   * Calculate age from birth date
   */
  static calculateAge(dateOfBirth: string): number {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }
  
  /**
   * Validate age is within acceptable range (12-120 years)
   */
  static isValidAge(dateOfBirth: string): boolean {
    const age = this.calculateAge(dateOfBirth)
    return age >= 12 && age <= 120
  }
  
  /**
   * Transform form state to DTO
   */
  static formStateToDTO(formState: MemberFormState): CreateMemberDTO {
    return {
      // Basic info
      name_full: formState.basicInfo.name_full.trim(),
      type_document: formState.basicInfo.type_document as any,
      number_document: formState.basicInfo.number_document.trim(),
      date_of_birth: formState.basicInfo.date_of_birth,
      gender: formState.basicInfo.gender as any,
      phone_number: formState.basicInfo.phone_number.trim(),
      address: formState.basicInfo.address.trim(),
      
      // Body metrics (required)
      weight_kg: Number(formState.bodyMetrics.weight_kg),
      height_cm: Number(formState.bodyMetrics.height_cm),
      
      // Body metrics (optional)
      body_fat_percentage: formState.bodyMetrics.body_fat_percentage 
        ? Number(formState.bodyMetrics.body_fat_percentage) 
        : undefined,
      muscle_mass_kg: formState.bodyMetrics.muscle_mass_kg 
        ? Number(formState.bodyMetrics.muscle_mass_kg) 
        : undefined,
      chest_cm: formState.bodyMetrics.chest_cm 
        ? Number(formState.bodyMetrics.chest_cm) 
        : undefined,
      waist_cm: formState.bodyMetrics.waist_cm 
        ? Number(formState.bodyMetrics.waist_cm) 
        : undefined,
      hip_cm: formState.bodyMetrics.hip_cm 
        ? Number(formState.bodyMetrics.hip_cm) 
        : undefined,
      arm_cm: formState.bodyMetrics.arm_cm 
        ? Number(formState.bodyMetrics.arm_cm) 
        : undefined,
      leg_cm: formState.bodyMetrics.leg_cm 
        ? Number(formState.bodyMetrics.leg_cm) 
        : undefined,
      
      // Health conditions
      health_conditions: formState.healthConditions.filter(condition => 
        condition.condition_name.trim() !== ''
      ),
      
      // Mental health
      mental_health: {
        stress_level: formState.mentalHealth.stress_level,
        mood: formState.mentalHealth.mood as any,
        sleep_hours: Number(formState.mentalHealth.sleep_hours),
        notes: formState.mentalHealth.notes.trim() || undefined
      },
      
      // Goals
      goals: formState.goals.filter(goal => 
        goal.target_value.trim() !== ''
      )
    }
  }
  
  /**
   * Get document type display name
   */
  static getDocumentTypeLabel(type: string): string {
    const labels = {
      'CC': 'Cédula de Ciudadanía',
      'TI': 'Tarjeta de Identidad',
      'TARJETA_EXTRANJERO': 'Tarjeta de Extranjero'
    }
    return labels[type as keyof typeof labels] || type
  }
  
  /**
   * Get gender display name
   */
  static getGenderLabel(gender: string): string {
    const labels = {
      'MASCULINO': 'Masculino',
      'FEMENINO': 'Femenino',
      'OTRO': 'Otro'
    }
    return labels[gender as keyof typeof labels] || gender
  }
  
  /**
   * Get goal type display name
   */
  static getGoalTypeLabel(goalType: string): string {
    const labels = {
      'PERDIDA_PESO': 'Pérdida de peso',
      'GANANCIA_MUSCULAR': 'Ganancia muscular',
      'RESISTENCIA': 'Resistencia',
      'MANTENIMIENTO': 'Mantenimiento',
      'REHABILITACION': 'Rehabilitación'
    }
    return labels[goalType as keyof typeof labels] || goalType
  }
}