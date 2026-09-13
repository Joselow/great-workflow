export function fitTextarea(el: EventTarget | null) {
  if (!(el instanceof HTMLTextAreaElement)) return

  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}
