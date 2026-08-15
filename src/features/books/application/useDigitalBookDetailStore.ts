import { defineStore } from 'pinia'
import { nextTick, ref } from 'vue'
import type { DigitalBook } from '../domain/entities/DigitalBook.types'
import type { BookLanguage, TranslationPhase } from '../domain/entities/DigitalBookTranslation.types'
import { BOOK_LANGUAGE_LABEL } from '../domain/entities/DigitalBookTranslation.types'
import { DigitalBookLoadError } from '../domain/errors/DigitalBookLoadError'
import { OllamaUnavailableError } from '../domain/errors/OllamaUnavailableError'
import type { DigitalBookFeedbackCopy } from '../domain/services/DigitalBookFeedbackMessages'
import { DigitalBookFeedbackMessages } from '../domain/services/DigitalBookFeedbackMessages'
import { DigitalBookHtmlChunker } from '../domain/services/DigitalBookHtmlChunker'
import { DigitalBookHtmlContent } from '../domain/services/DigitalBookHtmlContent'
import { DigitalBookTranslationPrompt } from '../domain/services/DigitalBookTranslationPrompt'
import { PdfToHtmlExtractor } from '../infrastructure/content/PdfToHtmlExtractor'
import { HttpDigitalBookRepository } from '../infrastructure/repositories/HttpDigitalBookRepository'
import { OllamaLlama3Translator } from '../infrastructure/ai/OllamaLlama3Translator'
import { OllamaStatusClient } from '../infrastructure/ai/OllamaStatusClient'
import { ViteOllamaBootstrapper } from '../infrastructure/ai/ViteOllamaBootstrapper'

export type DigitalBookDetailKind = 'idle' | 'ok' | 'error'
export type DigitalBookContentKind = 'idle' | 'loading' | 'ok' | 'error'

const BOOT_ATTEMPTS = 8
const BOOT_DELAY_MS = 4_000

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function stripCodeFences(text: string): string {
  return text.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '').trim()
}

export const useDigitalBookDetailStore = defineStore('digitalBookDetail', () => {
  const repository = new HttpDigitalBookRepository()
  const ollamaStatus = new OllamaStatusClient()
  const ollamaBoot = new ViteOllamaBootstrapper()
  const translator = new OllamaLlama3Translator()

  const book = ref<DigitalBook | null>(null)
  const isLoading = ref(false)
  const kind = ref<DigitalBookDetailKind>('idle')
  const feedback = ref<DigitalBookFeedbackCopy | null>(null)

  const originalHtml = ref('')
  const contentHtml = ref('')
  const contentKind = ref<DigitalBookContentKind>('idle')
  const contentFeedback = ref<DigitalBookFeedbackCopy | null>(null)

  const translationPhase = ref<TranslationPhase>('idle')
  const translationLanguage = ref<BookLanguage | null>(null)
  const translationCopy = ref<DigitalBookFeedbackCopy | null>(null)
  const translationProgress = ref('')

  async function loadBookContent(filePDF: string): Promise<void> {
    contentHtml.value = ''
    originalHtml.value = ''
    contentKind.value = 'loading'
    contentFeedback.value = null
    translationLanguage.value = null

    try {
      const decoded = await DigitalBookHtmlContent.decode(filePDF)
      const html =
        decoded.kind === 'pdf'
          ? await PdfToHtmlExtractor.toHtml(decoded.bytes)
          : DigitalBookHtmlContent.toSafeHtml(decoded.text)
      originalHtml.value = html
      contentHtml.value = html
      contentKind.value = 'ok'
    } catch {
      contentKind.value = 'error'
      contentFeedback.value = DigitalBookFeedbackMessages.pdfContentError()
    }
  }

  async function fetchDigitalBook(id: string): Promise<void> {
    isLoading.value = true
    kind.value = 'idle'
    feedback.value = null
    book.value = null
    contentHtml.value = ''
    originalHtml.value = ''
    contentKind.value = 'idle'
    contentFeedback.value = null
    translationPhase.value = 'idle'
    translationCopy.value = null
    translationProgress.value = ''

    try {
      const item = await repository.getById(id)
      book.value = item
      kind.value = 'ok'
      await loadBookContent(item.filePDF)
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

  async function ensureOllamaReady(): Promise<void> {
    const running = await ollamaStatus.isRunning()
    const hasModel = running ? await ollamaStatus.hasLlama3() : false
    if (running && hasModel) return

    translationPhase.value = 'booting'
    translationCopy.value = DigitalBookFeedbackMessages.translationBooting()
    await ollamaBoot.boot()

    for (let attempt = 1; attempt <= BOOT_ATTEMPTS; attempt += 1) {
      await delay(BOOT_DELAY_MS)
      if ((await ollamaStatus.isRunning()) && (await ollamaStatus.hasLlama3())) {
        return
      }
    }

    throw new OllamaUnavailableError()
  }

  async function explainWithLlama3(error: unknown, language: BookLanguage): Promise<string> {
    const technical = error instanceof Error ? error.message : String(error)
    try {
      const explanation = await translator.complete(
        DigitalBookTranslationPrompt.explainFailure(technical, language),
      )
      return stripCodeFences(explanation)
    } catch {
      return DigitalBookFeedbackMessages.translationUnavailable().message
    }
  }

  async function translateTo(language: BookLanguage): Promise<void> {
    if (contentKind.value !== 'ok' || !originalHtml.value) return
    if (translationPhase.value !== 'idle' && translationPhase.value !== 'error') return
    if (translationLanguage.value === language) return

    const label = BOOK_LANGUAGE_LABEL[language]
    translationPhase.value = 'translating'
    translationProgress.value = ''
    translationCopy.value = DigitalBookFeedbackMessages.translationInProgress(label)

    try {
      await ensureOllamaReady()

      translationPhase.value = 'translating'
      translationCopy.value = DigitalBookFeedbackMessages.translationInProgress(label)

      const chunks = DigitalBookHtmlChunker.chunk(originalHtml.value)
      const translated: string[] = []

      for (let index = 0; index < chunks.length; index += 1) {
        translationProgress.value = `Tramo ${index + 1} de ${chunks.length}`
        const reply = stripCodeFences(
          await translator.complete(
            DigitalBookTranslationPrompt.translateChunk(
              chunks[index],
              language,
              index + 1,
              chunks.length,
            ),
          ),
        )

        if (/^ERROR:/i.test(reply)) {
          throw new Error(reply.replace(/^ERROR:\s*/i, ''))
        }

        translated.push(reply)
      }

      const safeHtml = DigitalBookHtmlContent.sanitize(translated.join(''))
      if (!safeHtml.trim()) {
        throw new Error('llama3 devolvió una traducción vacía.')
      }

      translationPhase.value = 'rendering'
      translationCopy.value = DigitalBookFeedbackMessages.translationRendering()
      translationProgress.value = ''

      await nextTick()
      contentHtml.value = safeHtml
      translationLanguage.value = language
      await nextTick()
      await delay(450)
      translationPhase.value = 'idle'
      translationCopy.value = null
    } catch (error: unknown) {
      translationPhase.value = 'error'
      translationProgress.value = ''

      if (error instanceof OllamaUnavailableError) {
        translationCopy.value = DigitalBookFeedbackMessages.translationUnavailable()
        return
      }

      const modelMessage = await explainWithLlama3(error, language)
      translationCopy.value = {
        title: 'llama3 no pudo terminar la traducción',
        message: modelMessage,
      }
    }
  }

  function closeTranslationModal(): void {
    if (translationPhase.value === 'error') {
      translationPhase.value = 'idle'
      translationCopy.value = null
    }
  }

  function reset(): void {
    book.value = null
    isLoading.value = false
    kind.value = 'idle'
    feedback.value = null
    contentHtml.value = ''
    originalHtml.value = ''
    contentKind.value = 'idle'
    contentFeedback.value = null
    translationPhase.value = 'idle'
    translationLanguage.value = null
    translationCopy.value = null
    translationProgress.value = ''
  }

  return {
    book,
    isLoading,
    kind,
    feedback,
    contentHtml,
    contentKind,
    contentFeedback,
    translationPhase,
    translationLanguage,
    translationCopy,
    translationProgress,
    fetchDigitalBook,
    translateTo,
    closeTranslationModal,
    reset,
  }
})
