// ============================================================
// APPLICATION STORE - Digital books (Pinia)
// Orquesta base64 + POST /digital-books
// ============================================================

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DigitalBookFormInput } from '../domain/entities/DigitalBook.types'
import {
  Base64ConversionError,
  FileToBase64Converter,
} from '../domain/services/FileToBase64Converter'
import { DigitalBookFeedbackMessages } from '../domain/services/DigitalBookFeedbackMessages'
import type { DigitalBookFeedbackCopy } from '../domain/services/DigitalBookFeedbackMessages'
import { HttpDigitalBookRepository } from '../infrastructure/repositories/HttpDigitalBookRepository'

export type RegisterDigitalBookResult =
  | { ok: true; feedback: DigitalBookFeedbackCopy }
  | { ok: false; kind: 'base64' | 'http'; feedback: DigitalBookFeedbackCopy }

export const useDigitalBookStore = defineStore('digitalBooks', () => {
  const isSubmitting = ref(false)
  const repository = new HttpDigitalBookRepository()

  async function registerDigitalBook(
    input: DigitalBookFormInput,
  ): Promise<RegisterDigitalBookResult> {
    isSubmitting.value = true

    try {
      let photosBase64: string[]
      let filePDF: string

      try {
        photosBase64 = await FileToBase64Converter.fromFiles(input.photoFiles)
        filePDF = await FileToBase64Converter.fromFile(input.pdfFile)
      } catch (error) {
        const message =
          error instanceof Base64ConversionError
            ? error.message
            : undefined
        return {
          ok: false,
          kind: 'base64',
          feedback: DigitalBookFeedbackMessages.fromBase64Error(message),
        }
      }

      const payload = {
        name: input.title.trim(),
        author: input.author.trim(),
        genres: input.genres,
        photos: photosBase64,
        filePDF,
      }

      try {
        await repository.create(payload)
        return {
          ok: true,
          feedback: DigitalBookFeedbackMessages.success(payload.name),
        }
      } catch (error: unknown) {
        const status = (error as Error & { status?: number })?.status
        const message = error instanceof Error ? error.message : undefined
        return {
          ok: false,
          kind: 'http',
          feedback: DigitalBookFeedbackMessages.fromHttpError(status, message),
        }
      }
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    registerDigitalBook,
  }
})
