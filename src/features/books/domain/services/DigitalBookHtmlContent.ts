import { FileToBase64Converter } from './FileToBase64Converter'
import { PdfContentDecodeError } from '../errors/PdfContentDecodeError'

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]
const DANGEROUS_TAGS = /<(script|style|iframe|object|embed|link|meta|form)[\s\S]*?>[\s\S]*?<\/\1>/gi
const DANGEROUS_VOID = /<(script|iframe|object|embed|link|meta|form)[^>]*\/?>/gi
const EVENT_ATTRS = /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi
const JS_HREF = /\s(href|src)\s*=\s*("|')\s*javascript:[\s\S]*?\2/gi

export type DecodedBookFile =
  | { kind: 'pdf'; bytes: Uint8Array }
  | { kind: 'html' | 'text'; text: string }

export class DigitalBookHtmlContent {
  static async decode(filePDF: string): Promise<DecodedBookFile> {
    const value = filePDF.trim()
    if (!value) {
      throw new PdfContentDecodeError(
        'Este libro todavía no tiene un archivo que podamos abrir.',
      )
    }

    if (/^https?:\/\//i.test(value) || value.startsWith('/')) {
      const bytes = await this.fetchBytes(value)
      return this.fromBytes(bytes)
    }

    try {
      const base64 = FileToBase64Converter.extractBase64(value).replace(/\s/g, '')
      return this.fromBytes(this.decodeBase64(base64))
    } catch (error) {
      if (error instanceof PdfContentDecodeError) throw error
      throw new PdfContentDecodeError()
    }
  }

  static toSafeHtml(text: string): string {
    const trimmed = text.trim()
    if (!trimmed) {
      throw new PdfContentDecodeError()
    }
    if (this.looksLikeHtml(trimmed)) {
      const sanitized = this.sanitize(trimmed)
      if (!sanitized) throw new PdfContentDecodeError()
      return sanitized
    }
    return this.textToHtml(trimmed)
  }

  static wrapPages(pages: string[]): string {
    const sections = pages
      .map((html, index) => {
        const body = html.trim()
        if (!body) return ''
        return `<section class="book-page" data-page="${index + 1}">${body}</section>`
      })
      .filter(Boolean)
    if (!sections.length) {
      throw new PdfContentDecodeError()
    }
    return sections.join('')
  }

  static sanitize(html: string): string {
    return html
      .replace(DANGEROUS_TAGS, '')
      .replace(DANGEROUS_VOID, '')
      .replace(EVENT_ATTRS, '')
      .replace(JS_HREF, '')
  }

  static escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  static textToHtml(text: string): string {
    const blocks = text
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => `<p>${this.escape(block).replace(/\n/g, '<br>')}</p>`)
    if (!blocks.length) {
      throw new PdfContentDecodeError()
    }
    return blocks.join('')
  }

  private static fromBytes(bytes: Uint8Array): DecodedBookFile {
    if (this.looksLikePdf(bytes)) {
      return { kind: 'pdf', bytes }
    }
    const text = this.decodeUtf8(bytes)
    if (this.looksLikeHtml(text)) {
      return { kind: 'html', text }
    }
    return { kind: 'text', text }
  }

  private static async fetchBytes(url: string): Promise<Uint8Array> {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new PdfContentDecodeError()
      return new Uint8Array(await response.arrayBuffer())
    } catch (error) {
      if (error instanceof PdfContentDecodeError) throw error
      throw new PdfContentDecodeError()
    }
  }

  private static looksLikeHtml(text: string): boolean {
    const sample = text.slice(0, 200).trim().toLowerCase()
    return (
      sample.startsWith('<!doctype') ||
      sample.startsWith('<html') ||
      sample.startsWith('<body') ||
      sample.startsWith('<article') ||
      sample.startsWith('<section') ||
      sample.startsWith('<p')
    )
  }

  private static looksLikePdf(bytes: Uint8Array): boolean {
    if (bytes.length < PDF_MAGIC.length) return false
    return PDF_MAGIC.every((code, index) => bytes[index] === code)
  }

  private static decodeBase64(base64: string): Uint8Array {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  private static decodeUtf8(bytes: Uint8Array): string {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  }
}
