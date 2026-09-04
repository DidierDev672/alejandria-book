// ============================================================
// DOMAIN · DashboardMetric
// Tipos de datos paginables que alimentan los conteos del
// dashboard de membresías (planes, membresías, asistencias y
// pagos). Contratos puros, sin dependencias externas.
// ============================================================

export interface MembershipPlan {
  id: string
  name: string
  type: string
  duration_days: number
  price: number
  price_per_class: number
  classes_included: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MembershipRecord {
  id: string
  member_id: string
  plan_id: string
  date_start: string
  date_end: string
  status: string
  automatic_renewal: boolean
  created_at: string
  updated_at: string
}

export interface AttendanceRecord {
  member_id: string
  membership_id: string
  date: string
}

export interface PaymentRecord {
  id: string
  member_id: string
  membership_id: string
  amount: number
  date_pay: string
  method_pay: string
  context: string
  created_at: string
  updated_at: string
}

export interface DashboardCounts {
  planes: number
  memberships: number
  assistance: number
  payments: number
}

// ── Puerto: contrato que la infraestructura debe implementar ─
export interface DashboardRepository {
  getPlanes(): Promise<MembershipPlan[]>
  getMemberships(): Promise<MembershipRecord[]>
  getAttendance(): Promise<AttendanceRecord[]>
  getPays(): Promise<PaymentRecord[]>
}