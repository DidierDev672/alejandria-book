export type BookLanguage = 'es' | 'en'

export type TranslationPhase =
  | 'idle'
  | 'booting'
  | 'translating'
  | 'rendering'
  | 'error'

export const BOOK_LANGUAGE_LABEL: Record<BookLanguage, string> = {
  es: 'español',
  en: 'inglés',
}
