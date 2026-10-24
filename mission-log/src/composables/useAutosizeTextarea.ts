import { nextTick, watch, type Ref } from 'vue'

import { sizeTextarea } from '@/helpers/fitTextarea'

export function useAutosizeTextarea(source: Ref<string>) {
  let field: HTMLTextAreaElement | null = null

  const fit = () => {
    sizeTextarea(field)
  }

  const bind = (el: unknown) => {
    field = el instanceof HTMLTextAreaElement ? el : null
    void nextTick(fit)
  }

  const onInput = (event: Event) => {
    if (event.target instanceof HTMLTextAreaElement) field = event.target
    fit()
  }

  watch(source, () => {
    void nextTick(fit)
  })

  return { bind, onInput }
}
