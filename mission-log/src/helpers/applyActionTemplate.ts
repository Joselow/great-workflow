import { errorToast, successToast } from '@/composables/useAlerts'
import { composeActionText, templateBody } from '@/helpers/actionTemplateText'
import { textDataStore } from '@/store/textDataStore'
import { copyText } from '@/utils/copyText'

import type { ActionTemplate } from '@/interfaces/actionTemplate'

export const applyActionTemplate = async (template: ActionTemplate, entity: string) => {
  const text = composeActionText(templateBody(template), entity)
  if (!text) return

  textDataStore.setTextData(text, 'markdown')

  const copied = await copyText(text)
  if (copied) {
    successToast('✓ Copiado')
    return
  }

  errorToast('No se pudo copiar el texto')
}
