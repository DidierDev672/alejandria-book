import type { BookLanguage } from '../entities/DigitalBookTranslation.types'
import { BOOK_LANGUAGE_LABEL } from '../entities/DigitalBookTranslation.types'

export class DigitalBookTranslationPrompt {
  static translateChunk(html: string, language: BookLanguage, part: number, total: number): string {
    const target = language === 'es' ? 'Spanish' : 'English'
    return [
      `You are llama3 translating a digital book for the Alejandría library.`,
      `Translate the following HTML into ${target}.`,
      `Keep every HTML tag, attribute and structure. Translate only human-readable text.`,
      `Return ONLY the translated HTML. No markdown fences, no commentary.`,
      `This is chunk ${part} of ${total}.`,
      `If you cannot translate, start the reply with ERROR: and explain the reason in ${target}.`,
      '',
      html,
    ].join('\n')
  }

  static explainFailure(technicalError: string, language: BookLanguage): string {
    const target = BOOK_LANGUAGE_LABEL[language]
    return [
      'You are llama3 speaking to a reader of Alejandría.',
      `The translation could not finish. Technical detail: ${technicalError}`,
      `In one short, warm paragraph in ${target}, explain what happened without blaming the reader.`,
      'Say what they can do next (wait a moment and try again). Do not use jargon.',
    ].join('\n')
  }
}
