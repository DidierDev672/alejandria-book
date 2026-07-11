import type { CreateMemberProgressDTO, MemberProgressFormState } from '../entities/MemberProgress.types'

export class MemberProgressDomainService {
  static getCurrentMonthYear(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}-01`
  }

  static formStateToDTO(formState: MemberProgressFormState): CreateMemberProgressDTO {
    return {
      user_id: formState.user_id,
      month_year: formState.month_year || this.getCurrentMonthYear(),
      recorded_value: Number(formState.recorded_value),
      notes: formState.notes.trim() || undefined,
    }
  }

  static formatMonthYear(monthYear: string): string {
    if (!monthYear) return ''
    const [year, month] = monthYear.split('-')
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ]
    return `${months[parseInt(month, 10) - 1]} ${year}`
  }
}