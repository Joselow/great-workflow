import type { CardListItem, CardProjectSummary } from '@/interfaces/card'

export type LogMeetingSource = 'log' | 'meeting'

export interface MeetingIssue {
  id?: number
  name: string
  color: string
}

export interface MeetingLogLink {
  id: string
  description: string
  source: LogMeetingSource
}

export interface MeetingWriteLogLink {
  logId: string
  source: LogMeetingSource
}

export interface MeetingNextStep {
  logId?: string
  description: string
}

export interface Meeting {
  id: string
  userId: number
  projectId: string | null
  title: string
  date: string
  estimatedDuration: number
  topicStatus: string
  objective: string
  participants: string
  color: string
  issues: MeetingIssue[]
  summary: string | null
  lessons: string | null
  executed: boolean
  objectiveAchieved: boolean | null
  additionalInfo: string | null
  platform: string | null
  meetingUrl: string | null
  accessDetails: string | null
  duration: number | null
  cards: CardListItem[]
  logs: MeetingLogLink[]
  createdAt: string
  updatedAt: string
}

export interface MeetingWritePayload {
  title: string
  date: string
  estimatedDuration: number
  topicStatus: string
  objective: string
  participants: string
  color: string
  projectId: string | null
  issues: MeetingIssue[]
  cardIds: string[]
  logLinks: MeetingWriteLogLink[]
  nextSteps: MeetingNextStep[]
  lessons: string | null
  summary: string | null
  executed: boolean
  objectiveAchieved: boolean | null
  additionalInfo: string | null
  platform: string | null
  meetingUrl: string | null
  accessDetails: string | null
}

export const MEETING_PLATFORM_OPTIONS = [
  { value: '', label: 'Sin plataforma' },
  { value: 'meet', label: 'Google Meet' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'teams', label: 'Teams' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'otro', label: 'Otro' },
] as const

export interface MeetingDraft extends MeetingWritePayload {
  id?: string
  cards: CardListItem[]
}

export interface MeetingListItem {
  id: string
  title: string
  date: string
  estimatedDuration: number
  participants: string
  color: string
  projectId: string | null
  project: CardProjectSummary | null
  executed: boolean
  objectiveAchieved: boolean | null
}

export interface MeetingQualificationPayload {
  objectiveAchieved: boolean
  summary: string | null
  lessons: string | null
}

export interface MeetingDateFilters {
  from: string
  to: string
}

export interface MeetingListResponse {
  items: MeetingListItem[]
  page: number
  limit: number
  total: number
}

export interface MeetingListFilters {
  projectId?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}
