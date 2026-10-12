import { formatHours } from '@/utils/date'

import type { MeetingIssue } from '@/interfaces/meeting'

export interface MeetingSummaryInput {
  title: string
  projectName: string
  date: string
  estimatedDuration: number
  topicStatus: string
  objective: string
  issues: MeetingIssue[]
  participants: string
}

export const generateMeetingSummary = (meeting: MeetingSummaryInput) => {
  const title = meeting.title.trim()
  const project = meeting.projectName.trim()
  const when = meeting.date ? formatHours(meeting.date) : ''
  const duration = Number(meeting.estimatedDuration) || 0
  const heading = project
    ? `Reunión ${title} - ${project}  ${when} (${duration}min)`
    : `Reunión ${title}  ${when} (${duration}min)`

  const agenda = meeting.issues.length
    ? meeting.issues.map((item) => `- ${item.name.trim()}`).join('\n')
    : '-'

  return [
    heading,
    '',
    `Estado: ${meeting.topicStatus.trim()}`,
    '',
    `Objetivo: ${meeting.objective.trim()}`,
    '',
    'Agenda:',
    agenda,
    '',
    `*Participantes*: ${meeting.participants.trim()}`,
  ].join('\n')
}
