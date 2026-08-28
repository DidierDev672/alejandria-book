import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { CatalogMember } from '../../domain/entities/MemberUserAssignment.types'
import type { MemberCatalogRepository } from '../../domain/repositories/MemberCatalogRepository'
import { unwrapCollection } from '../../domain/services/CollectionUnwrap'
import { MemberUserAssignmentDomainService } from '../../domain/services/MemberUserAssignmentDomainService'

interface RawMember {
  id?: string
  name_full?: string
  type_document?: string
  number_document?: string
  date_of_birth?: string
  genre?: string
  phone_number?: string
  address?: string
}

export class HttpMemberCatalogRepository implements MemberCatalogRepository {
  async findAll(): Promise<CatalogMember[]> {
    const response = await axiosInstance.get('/members')
    if (response.status !== 200) {
      throw new Error(MemberUserAssignmentDomainService.catalogErrorMessage())
    }

    return unwrapCollection<RawMember>(response.data).map((member) => ({
      id: String(member.id ?? ''),
      name_full: String(member.name_full ?? ''),
      type_document: String(member.type_document ?? ''),
      number_document: String(member.number_document ?? ''),
      date_of_birth: String(member.date_of_birth ?? ''),
      genre: String(member.genre ?? ''),
      phone_number: String(member.phone_number ?? ''),
      address: String(member.address ?? ''),
    }))
  }
}
