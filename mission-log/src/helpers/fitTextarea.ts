export function fitTextarea(el: EventTarget | null) {
  if (!(el instanceof HTMLTextAreaElement)) return
  if (el.scrollHeight <= el.clientHeight) return

  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

export function sizeTextarea(el: EventTarget | null) {
  if (!(el instanceof HTMLTextAreaElement)) return

  const style = getComputedStyle(el)
  const fontSize = parseFloat(style.fontSize) || 16
  const parsedLine = parseFloat(style.lineHeight)
  const line = Number.isNaN(parsedLine) ? fontSize * 1.25 : parsedLine
  const pad = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)
  const border = (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0)
  const min = Math.ceil(line * 3 + pad + border)

  el.style.height = '0px'
  el.style.height = `${Math.max(el.scrollHeight + border, min)}px`
}

export function collapseTextarea(el: EventTarget | null) {
  if (!(el instanceof HTMLTextAreaElement)) return

  el.style.height = ''
}

export function syncTextareas(root: ParentNode | null, expanded: boolean) {
  if (!root) return

  for (const el of root.querySelectorAll('textarea')) {
    if (expanded) fitTextarea(el)
    else collapseTextarea(el)
  }

  if (expanded) return

  const active = document.activeElement
  if (active instanceof HTMLTextAreaElement && root.contains(active)) {
    fitTextarea(active)
  }
}
