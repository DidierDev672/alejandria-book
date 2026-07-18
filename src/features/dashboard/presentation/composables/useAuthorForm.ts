/**
 * useAuthorForm — Composable para gestionar el formulario de autores.
 *
 * SRP: Única responsabilidad de manejar estado del formulario, validación y guardado.
 * DIP: Depende de AuthorApi (abstracción), no de implementación directa.
 * OCP: Abierto para extensión (nuevos campos) sin modificar la page.
 */
import { reactive, ref, computed } from 'vue'
import type { Author, CreateAuthorPayload } from '../../domain/AuthorEntity'
import { AuthorApi } from '../../infrastructure/AuthorApi'

const api = new AuthorApi()

export function useAuthorForm() {
  // ─── Estado del formulario ────────────────────────────────────────
  const form = reactive<CreateAuthorPayload>({
    name: '',
    country: '',
    genres: [],
    birthDay: '',
  })

  const genreInput = ref('')
  const submitting = ref(false)
  const apiError = ref('')

  // ─── Validación derivada ──────────────────────────────────────────
  const canSubmit = computed(
    () =>
      !submitting.value &&
      form.name.trim() !== '' &&
      form.country.trim() !== '' &&
      form.genres.length > 0 &&
      form.birthDay.trim() !== '',
  )

  // ─── Gestión de géneros (SRP) ────────────────────────────────────
  function addGenre() {
    const val = genreInput.value.trim()
    if (val && !form.genres.includes(val)) {
      form.genres.push(val)
    }
    genreInput.value = ''
  }

  function removeGenre(idx: number) {
    form.genres.splice(idx, 1)
  }

  // ─── Reset / Populate (OCP) ─────────────────────────────────────
  function resetForm() {
    form.name = ''
    form.country = ''
    form.genres = []
    form.birthDay = ''
    genreInput.value = ''
    apiError.value = ''
  }

  function populateForm(author: Author) {
    form.name = author.name
    form.country = author.country
    form.genres = [...author.genres]
    form.birthDay = author.birthDay
    genreInput.value = ''
    apiError.value = ''
  }

  // ─── Guardar (create o update) ───────────────────────────────────
  async function saveAuthor(editingId?: string | null): Promise<Author | null> {
    if (!canSubmit.value) return null
    submitting.value = true
    apiError.value = ''
    try {
      if (editingId) {
        return await api.update(editingId, { ...form })
      }
      return await api.create({ ...form })
    } catch (err: any) {
      apiError.value = err?.response?.data?.error || err.message || 'Error al guardar el autor'
      return null
    } finally {
      submitting.value = false
    }
  }

  return {
    form,
    genreInput,
    submitting,
    apiError,
    canSubmit,
    addGenre,
    removeGenre,
    resetForm,
    populateForm,
    saveAuthor,
  }
}
