import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DigitalBook } from '../domain/entities/DigitalBook.types'
import { DigitalBookLoadError } from '../domain/errors/DigitalBookLoadError'
import type { DigitalBookFeedbackCopy } from '../domain/services/DigitalBookFeedbackMessages'
import { DigitalBookFeedbackMessages } from '../domain/services/DigitalBookFeedbackMessages'
import { DigitalBookPdfContent } from '../domain/services/DigitalBookPdfContent'
import { HttpDigitalBookRepository } from '../infrastructure/repositories/HttpDigitalBookRepository'

export type DigitalBookDetailKind = 'idle' | 'ok' | 'error'
export type DigitalBookPdfKind = 'idle' | 'loading' | 'ok' | 'error'

export const useDigitalBookDetailStore = defineStore('digitalBookDetail', () => {
  const repository = new HttpDigitalBookRepository()

  const book = ref<DigitalBook | null>(null)
  const isLoading = ref(false)
  const kind = ref<DigitalBookDetailKind>('idle')
  const feedback = ref<DigitalBookFeedbackCopy | null>(null)

  const pdfUrl = ref('')
  const pdfKind = ref<DigitalBookPdfKind>('idle')
  const pdfFeedback = ref<DigitalBookFeedbackCopy | null>(null)

  function revokePdfUrl() {
    if (pdfUrl.value) {
      DigitalBookPdfContent.revoke(pdfUrl.value)
      pdfUrl.value = ''
    }
  }

  async function loadPdfContent(filePDF: string): Promise<void> {
    revokePdfUrl()
    pdfKind.value = 'loading'
    pdfFeedback.value = null

    try {
      pdfUrl.value = await DigitalBookPdfContent.toObjectUrl(filePDF)
      pdfKind.value = 'ok'
    } catch {
      pdfKind.value = 'error'
      pdfFeedback.value = DigitalBookFeedbackMessages.pdfContentError()
    }
  }

  async function fetchDigitalBook(id: string): Promise<void> {
    isLoading.value = true
    kind.value = 'idle'
    feedback.value = null
    book.value = null
    pdfKind.value = 'idle'
    pdfFeedback.value = null
    revokePdfUrl()

    try {
      const item = await repository.getById(id)
      book.value = item
      kind.value = 'ok'
      await loadPdfContent(item.filePDF)
    } catch (error: unknown) {
      const status = (error as Error & { status?: number })?.status
      if (error instanceof DigitalBookLoadError || status === 400) {
        kind.value = 'error'
        feedback.value = DigitalBookFeedbackMessages.loadDetailError()
        return
      }
      kind.value = 'error'
      feedback.value = DigitalBookFeedbackMessages.fromListHttpError(
        status,
        error instanceof Error ? error.message : undefined,
      )
    } finally {
      isLoading.value = false
    }
  }

  function reset(): void {
    revokePdfUrl()
    book.value = null
    isLoading.value = false
    kind.value = 'idle'
    feedback.value = null
    pdfKind.value = 'idle'
    pdfFeedback.value = null
  }

  return {
    book,
    isLoading,
    kind,
    feedback,
    pdfUrl,
    pdfKind,
    pdfFeedback,
    fetchDigitalBook,
    reset,
  }
})
