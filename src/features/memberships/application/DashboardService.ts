import type { DashboardCounts, DashboardRepository } from '../domain/entities/DashboardMetric.types'

// ============================================================
// APPLICATION · DashboardService
// Orquesta el caso de uso de obtener los conteos del panel.
// Depende del puerto, no del adaptador concreto.
// ============================================================

export class DashboardService {
  private repository: DashboardRepository

  constructor(repository: DashboardRepository) {
    this.repository = repository
  }

  async fetchCounts(): Promise<DashboardCounts> {
    const [planes, memberships, attendance, pays] = await Promise.all([
      this.repository.getPlanes(),
      this.repository.getMemberships(),
      this.repository.getAttendance(),
      this.repository.getPays(),
    ])

    return {
      planes: planes.length,
      memberships: memberships.length,
      assistance: attendance.length,
      payments: pays.length,
    }
  }
}