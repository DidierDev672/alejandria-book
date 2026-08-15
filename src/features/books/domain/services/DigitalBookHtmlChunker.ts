export class DigitalBookHtmlChunker {
  static chunk(html: string, maxChars = 2800): string[] {
    const source = html.trim()
    if (!source) return []
    if (source.length <= maxChars) return [source]

    const pieces = source.split(/(?=<section\b)|(?<=<\/section>)|(?<=<\/p>)/i)
    const chunks: string[] = []
    let current = ''

    for (const piece of pieces) {
      if (!piece) continue
      if (current.length + piece.length > maxChars && current.trim()) {
        chunks.push(current)
        current = piece
      } else {
        current += piece
      }
    }

    if (current.trim()) chunks.push(current)

    return chunks.flatMap((chunk) => this.splitOversized(chunk, maxChars))
  }

  private static splitOversized(chunk: string, maxChars: number): string[] {
    if (chunk.length <= maxChars) return [chunk]
    const parts: string[] = []
    for (let i = 0; i < chunk.length; i += maxChars) {
      parts.push(chunk.slice(i, i + maxChars))
    }
    return parts
  }
}
