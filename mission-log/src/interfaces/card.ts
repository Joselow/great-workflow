export interface CardSection {
  title: string
  description: string
}

export interface CardProjectSummary {
  name: string
  color: string
}

export interface Card {
  id: string
  userId: number
  projectId: string | null
  meetingId: string | null
  name: string
  description: string
  color: string
  isPrompt: boolean
  flMeeting: boolean
  sections: CardSection[]
  createdAt: string
  updatedAt: string
}

export interface PublicCard {
  id: string
  name: string
  description: string
  color: string
  isPrompt: boolean
  flMeeting: boolean
  sections: CardSection[]
  project: CardProjectSummary | null
}

export interface CardWritePayload {
  name: string
  description: string
  color: string
  isPrompt: boolean
  flMeeting: boolean
  projectId: string | null
  sections: CardSection[]
}

export interface CardDraft extends CardWritePayload {
  id?: string
}

export interface CardListItem {
  id: string
  name: string
  description: string
  color: string
  isPrompt: boolean
  flMeeting: boolean
  projectId: string | null
  project: CardProjectSummary | null
}

export interface CardListResponse {
  items: CardListItem[]
  page: number
  limit: number
  total: number
}

export interface CardListFilters {
  q?: string
  projectId?: string
  isPrompt?: boolean
  flMeeting?: boolean
  page?: number
  limit?: number
}

export type CardListProjectFilter = 'all' | 'null' | string
