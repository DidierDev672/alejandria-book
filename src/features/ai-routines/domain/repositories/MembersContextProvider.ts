// ============================================================
// DOMAIN REPOSITORY - Members Context Provider (Port)
// Proporciona el catálogo de miembros (contrato GET /members)
// para enriquecer el contexto del Coach AI.
// DIP: la capa de aplicación depende de esta abstracción.
// ============================================================

import type { MemberCoachProfile } from '../entities/MemberCoachProfile.types'

export interface MembersContextProvider {
  /** Devuelve los miembros registrados con la estructura completa del API */
  getMembers(): Promise<MemberCoachProfile[]>
}
