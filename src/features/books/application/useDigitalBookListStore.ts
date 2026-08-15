import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { DigitalBook } from '../domain/entities/DigitalBook.types'
import { EmptyDigitalLibraryError } from '../domain/errors/EmptyDigitalLibraryError'
import type { DigitalBookFeedbackCopy } from '../domain/services/DigitalBookFeedbackMessages'
import { DigitalBookFeedbackMessages } from '../domain/services/DigitalBookFeedbackMessages'
import { HttpDigitalBookRepository } from '../infrastructure/repositories/HttpDigitalBookRepository'

export type DigitalBookListKind = 'idle' | 'ok' | 'empty' | 'error'

export const useDigitalBookListStore = defineStore('digitalBookList', () => {
  const repository = new HttpDigitalBookRepository()

  const books = ref<DigitalBook[]>([])
  const isLoading = ref(false)
  const kind = ref<DigitalBookListKind>('idle')
  const feedback = ref<DigitalBookFeedbackCopy | null>(null)

  const hasBooks = computed(() => books.value.length > 0)
  const totalBooks = computed(() => books.value.length)

  async function fetchDigitalBooks(): Promise<void> {
    isLoading.value = true
    feedback.value = null

    try {
      const items = await repository.list()
      books.value = items

      if (!items.length) {
        kind.value = 'empty'
        feedback.value = DigitalBookFeedbackMessages.emptyLibrary()
        return
      }

      kind.value = 'ok'
    } catch (error: unknown) {
      const status = (error as Error & { status?: number })?.status
      const message = error instanceof Error ? error.message : undefined

      if (error instanceof EmptyDigitalLibraryError || status === 400) {
        books.value = []
        kind.value = 'empty'
        feedback.value = DigitalBookFeedbackMessages.emptyLibrary()
        return
      }

      books.value = []
      kind.value = 'error'
      feedback.value = DigitalBookFeedbackMessages.fromListHttpError(status, message)
    } finally {
      isLoading.value = false
    }
  }

  return {
    books,
    isLoading,
    kind,
    feedback,
    hasBooks,
    totalBooks,
    fetchDigitalBooks,
  }
})
