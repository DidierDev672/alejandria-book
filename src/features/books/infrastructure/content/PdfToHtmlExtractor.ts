import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PdfContentDecodeError } from '../../domain/errors/PdfContentDecodeError'
import { DigitalBookHtmlContent } from '../../domain/services/DigitalBookHtmlContent'

GlobalWorkerOptions.workerSrc = workerSrc

type PdfTextChunk = {
  str?: string
  transform?: number[]
}

export class PdfToHtmlExtractor {
  static async toHtml(bytes: Uint8Array): Promise<string> {
    try {
      const pdf = await getDocument({ data: bytes.slice() }).promise
      const pages: string[] = []

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber)
        const content = await page.getTextContent()
        const html = this.itemsToHtml(content.items)
        if (html) pages.push(html)
      }

      return DigitalBookHtmlContent.wrapPages(pages)
    } catch (error) {
      if (error instanceof PdfContentDecodeError) throw error
      throw new PdfContentDecodeError()
    }
  }

  private static itemsToHtml(items: unknown[]): string {
    const paragraphs: string[] = []
    let current = ''
    let lastY: number | null = null

    for (const item of items) {
      if (!item || typeof item !== 'object' || !('str' in item)) continue
      const textItem = item as PdfTextChunk
      const y = Array.isArray(textItem.transform) ? Number(textItem.transform[5]) : 0
      const chunk = textItem.str ?? ''

      if (lastY !== null && Math.abs(lastY - y) > 10) {
        if (current.trim()) {
          paragraphs.push(`<p>${DigitalBookHtmlContent.escape(current.trim())}</p>`)
        }
        current = chunk
      } else {
        const needsSpace = current.length > 0 && !current.endsWith(' ') && !chunk.startsWith(' ')
        current += `${needsSpace ? ' ' : ''}${chunk}`
      }
      lastY = y
    }

    if (current.trim()) {
      paragraphs.push(`<p>${DigitalBookHtmlContent.escape(current.trim())}</p>`)
    }

    return paragraphs.join('')
  }
}
