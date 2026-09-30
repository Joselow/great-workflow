export function fitTextarea(el: EventTarget | null) {
  if (!(el instanceof HTMLTextAreaElement)) return

  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
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
