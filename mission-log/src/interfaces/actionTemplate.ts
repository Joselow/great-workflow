export type ActionTemplateModule = 'all' | 'log' | 'meeting' | 'requirement' | 'task'

export type ActionTemplateContentMode = 'text' | 'card'

export interface ActionTemplateCardSummary {
  id: string
  name: string
  color: string
  description: string
}

export interface ActionTemplate {
  id: number
  module: ActionTemplateModule
  name: string
  action: string | null
  template: string
  color: string
  isActive: boolean
  cardId: string | null
  card: ActionTemplateCardSummary | null
  createdAt: string
  updatedAt: string
}

export interface ActionTemplateWritePayload {
  module: ActionTemplateModule
  name: string
  action: string | null
  template: string
  color: string
  isActive: boolean
  cardId: string | null
}

export interface ActionTemplateDraft {
  id?: number
  module: ActionTemplateModule
  name: string
  action: string
  template: string
  color: string
  isActive: boolean
  contentMode: ActionTemplateContentMode
  card: ActionTemplateCardSummary | null
}
