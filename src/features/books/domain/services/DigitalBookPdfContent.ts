import { FileToBase64Converter } from './FileToBase64Converter'
import { PdfContentDecodeError } from '../errors/PdfContentDecodeError'

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]

export class DigitalBookPdfContent {
  static async toObjectUrl(filePDF: string): Promise<string> {
    const value = filePDF.trim()
    if (!value) {
      throw new PdfContentDecodeError(
        'Este libro todavía no tiene un archivo que podamos abrir.',
      )
    }

    if (value.startsWith('blob:')) return value
    if (/^https?:\/\//i.test(value) || value.startsWith('/')) {
      return value
    }

    try {
      const base64 = FileToBase64Converter.extractBase64(value).replace(/\s/g, '')
      const bytes = this.decodeBase64(base64)
      if (!this.looksLikePdf(bytes)) {
        throw new PdfContentDecodeError()
      }
      return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
    } catch (error) {
      if (error instanceof PdfContentDecodeError) throw error
      throw new PdfContentDecodeError()
    }
  }

  static revoke(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }

  private static decodeBase64(base64: string): Uint8Array {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  private static looksLikePdf(bytes: Uint8Array): boolean {
    if (bytes.length < PDF_MAGIC.length) return false
    return PDF_MAGIC.every((code, index) => bytes[index] === code)
  }
}
