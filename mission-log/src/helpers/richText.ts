type Span = { inner: string; end: number; open: '*_' | '_*' | '*' | '_' }

const FORMS: { open: Span['open']; close: string }[] = [
  { open: '*_', close: '_*' },
  { open: '_*', close: '*_' },
  { open: '*', close: '*' },
  { open: '_', close: '_' },
]

const CLOSE: Record<Span['open'], string> = {
  '*_': '_*',
  '_*': '*_',
  '*': '*',
  _: '_',
}

const spanAt = (line: string, index: number): Span | null => {
  for (const form of FORMS) {
    if (!line.startsWith(form.open, index)) continue

    const innerStart = index + form.open.length
    let searchFrom = innerStart

    while (searchFrom < line.length) {
      const closeAt = line.indexOf(form.close, searchFrom)
      if (closeAt === -1) break
      if (closeAt > innerStart) {
        return {
          inner: line.slice(innerStart, closeAt),
          end: closeAt + form.close.length,
          open: form.open,
        }
      }

      searchFrom = closeAt + 1
    }
  }

  return null
}

const collapseDuplicates = (value: string) => {
  let current = value
  let previous = ''

  while (current !== previous) {
    previous = current
    current = current
      .replace(/_{2,}([^_\n]+?)_{2,}/g, '_$1_')
      .replace(/\*{2,}([^*\n]+?)\*{2,}/g, '*$1*')
  }

  return current
}

const edgeSpace = (value: string) => {
  if (!value.trim()) return { lead: value, core: '', trail: '' }

  const lead = value.match(/^\s*/)?.[0] ?? ''
  const trail = value.match(/\s*$/)?.[0] ?? ''
  return {
    lead,
    core: value.slice(lead.length, value.length - trail.length),
    trail,
  }
}

const normalizeLine = (line: string) => {
  let out = ''
  let index = 0

  while (index < line.length) {
    const span = spanAt(line, index)
    if (!span) {
      out += line[index] ?? ''
      index += 1
      continue
    }

    const { lead, core, trail } = edgeSpace(span.inner)
    if (!core) {
      out += span.inner
      index = span.end
      continue
    }

    out += `${lead}${span.open}${normalizeLine(core)}${CLOSE[span.open]}${trail}`
    index = span.end
  }

  return out
}

export const normalizeMarkers = (value: string) =>
  collapseDuplicates(value)
    .split(/\r?\n/)
    .map(normalizeLine)
    .join('\n')

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const wrapInner = (open: Span['open'], inner: string) => {
  const text = escapeHtml(inner)
  if (open === '*_') return `<strong><em>${text}</em></strong>`
  if (open === '_*') return `<em><strong>${text}</strong></em>`
  if (open === '*') return `<strong>${text}</strong>`
  return `<em>${text}</em>`
}

const renderLine = (line: string) => {
  let html = ''
  let index = 0

  while (index < line.length) {
    const span = spanAt(line, index)
    if (!span) {
      html += escapeHtml(line[index] ?? '')
      index += 1
      continue
    }

    const { lead, core, trail } = edgeSpace(span.inner)
    if (!core) {
      html += escapeHtml(span.inner)
      index = span.end
      continue
    }

    html += `${escapeHtml(lead)}${wrapInner(span.open, core)}${escapeHtml(trail)}`
    index = span.end
  }

  return html
}

export const markersToHtml = (value: string, multiline: boolean) => {
  const normalized = normalizeMarkers(value)
  const lines = multiline ? normalized.split(/\r?\n/) : [normalized.replace(/\r?\n/g, ' ')]
  return lines.map(renderLine).join('<br>')
}

type Style = { bold: boolean; italic: boolean }

const NONE: Style = { bold: false, italic: false }

const sameStyle = (left: Style, right: Style) =>
  left.bold === right.bold && left.italic === right.italic

const openOf = (style: Style) =>
  style.bold && style.italic ? '*_' : style.bold ? '*' : style.italic ? '_' : ''

const closeOf = (style: Style) =>
  style.bold && style.italic ? '_*' : style.bold ? '*' : style.italic ? '_' : ''

const ownStyle = (element: HTMLElement): Style => {
  const tag = element.tagName
  const weight = element.style.fontWeight
  const bold = tag === 'B' || tag === 'STRONG' || weight === 'bold' || Number(weight) >= 600
  const italic = tag === 'I' || tag === 'EM' || element.style.fontStyle === 'italic'
  return { bold, italic }
}

export const htmlToMarkers = (root: HTMLElement, multiline: boolean) => {
  const parts: string[] = []
  let current: Style = { ...NONE }

  const setStyle = (next: Style) => {
    if (sameStyle(current, next)) return
    const close = closeOf(current)
    const open = openOf(next)
    if (close) parts.push(close)
    if (open) parts.push(open)
    current = next
  }

  const emitText = (text: string, style: Style) => {
    const value = text.replace(/\u00a0/g, ' ')
    if (!value) return

    if ((!style.bold && !style.italic) || !value.trim()) {
      setStyle(NONE)
      parts.push(value)
      return
    }

    const { lead, core, trail } = edgeSpace(value)
    if (lead) {
      setStyle(NONE)
      parts.push(lead)
    }
    setStyle(style)
    parts.push(core)
    if (trail) {
      setStyle(NONE)
      parts.push(trail)
    }
  }

  const walk = (node: Node, style: Style) => {
    if (node.nodeType === Node.TEXT_NODE) {
      emitText(node.textContent ?? '', style)
      return
    }

    if (!(node instanceof HTMLElement)) return

    const tag = node.tagName
    if (tag === 'BR') {
      setStyle(NONE)
      if (multiline) parts.push('\n')
      return
    }

    if ((tag === 'DIV' || tag === 'P') && node !== root) {
      if (multiline && parts.length > 0 && parts[parts.length - 1] !== '\n') {
        setStyle(NONE)
        parts.push('\n')
      }
    }

    const own = ownStyle(node)
    const next = { bold: style.bold || own.bold, italic: style.italic || own.italic }
    node.childNodes.forEach((child) => walk(child, next))
  }

  root.childNodes.forEach((child) => walk(child, NONE))
  setStyle(NONE)

  const text = parts.join('')
  return /^\n+$/.test(text) ? '' : normalizeMarkers(text)
}
