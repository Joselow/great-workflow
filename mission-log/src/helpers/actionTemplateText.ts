import { cardToCopyText } from '@/helpers/cardCopyText'

import type { ActionTemplate, ActionTemplateModule } from '@/interfaces/actionTemplate'

type SurfaceModule = Exclude<ActionTemplateModule, 'all'>

export const templatesForModule = (templates: ActionTemplate[], module: SurfaceModule) =>
  templates.filter((template) => template.isActive && (template.module === module || template.module === 'all'))

export const actionTitle = (template: Pick<ActionTemplate, 'action'>) => {
  const text = template.action?.trim()
  return text || undefined
}

export const templateBody = (template: Pick<ActionTemplate, 'template' | 'card'>) => {
  if (template.card) {
    return cardToCopyText({
      name: template.card.name,
      description: template.card.description,
      isPrompt: true,
      sections: [],
    })
  }

  return template.template.trim()
}

export const composeActionText = (body: string, entity: string) => {
  const hasBody = body.trim().length > 0
  const hasEntity = entity.trim().length > 0
  if (hasBody && hasEntity) return `${body}\n\n${entity}`
  if (hasBody) return body
  if (hasEntity) return entity

  return ''
}
