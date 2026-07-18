/**
 * useAuthorCrud — Composable para operaciones CRUD de autores.
 *
 * SRP: Única responsabilidad de gestionar la lista de autores y sus operaciones.
 * DIP: Depende de AuthorApi (abstracción).
 * ISP: Interfaz mínima necesaria para la page.
 */
import { ref } from 'vue'
import type { Author } from '../../domain/AuthorEntity'
import { AuthorApi } from '../../infrastructure/AuthorApi'

const api = new AuthorApi()

export function useAuthorCrud() {
  const authors = ref<Author[]>([])
  const loading = ref(true)
  const deleting = ref<string | null>(null)

  async function fetchAuthors() {
    try {
      authors.value = (await api.getAll()) ?? []
    } catch {
      authors.value = []
    } finally {
      loading.value = false
    }
  }

  async function removeAuthor(id: string): Promise<boolean> {
    if (deleting.value) return false
    deleting.value = id
    try {
      await api.remove(id)
      authors.value = authors.value.filter((a) => a.id !== id)
      return true
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Error al eliminar el autor')
      return false
    } finally {
      deleting.value = null
    }
  }

  return {
    authors,
    loading,
    deleting,
    fetchAuthors,
    removeAuthor,
  }
}
