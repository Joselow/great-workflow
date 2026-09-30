import type { Ref } from 'vue'

import { collapseTextarea, fitTextarea, syncTextareas } from '@/helpers/fitTextarea'

export function useTextareaFit(expanded: Ref<boolean>) {
  const onFocus = (event: FocusEvent) => {
    if (expanded.value) return
    fitTextarea(event.target)
  }

  const onBlur = (event: FocusEvent) => {
    if (expanded.value) return
    collapseTextarea(event.target)
  }

  const onInput = (event: Event) => {
    fitTextarea(event.target)
  }

  const sync = (root: ParentNode | null) => {
    syncTextareas(root, expanded.value)
  }

  return { onFocus, onBlur, onInput, sync }
}
