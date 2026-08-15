import type { PencilColor, PencilSize } from '../entities/DigitalBookPencil.types'

export class DigitalBookHighlighter {
  static wrapSelection(
    root: HTMLElement,
    color: PencilColor,
    size: PencilSize,
  ): boolean {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return false
    }

    const range = selection.getRangeAt(0)
    if (!root.contains(range.commonAncestorContainer)) return false
    if (!range.toString().trim()) return false

    const mark = document.createElement('mark')
    mark.className = 'pencil-highlight'
    mark.dataset.size = size
    mark.dataset.highlightId = `hl-${crypto.randomUUID()}`
    mark.title = 'Doble clic para abrir las notas'
    mark.style.setProperty('--pencil-highlight', color)

    try {
      range.surroundContents(mark)
    } catch {
      const contents = range.extractContents()
      mark.appendChild(contents)
      range.insertNode(mark)
    }

    selection.removeAllRanges()
    return true
  }
}
