import dayjs from 'dayjs'

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
  nextSteps: { description: string }[]
}

const summaryWhen = (value: string) => {
  const date = dayjs(value)
  if (!date.isValid()) return ''

  const meridiem = date.hour() < 12 ? 'a. m.' : 'p. m.'
  return `${date.format('DD/MM/YYYY')} | ${date.format('h:mm')} ${meridiem}`
}

const textBlock = (value: string) => value.trim() || '-'

const bulletBlock = (lines: string[]) => {
  const items = lines.map((line) => line.trim()).filter(Boolean)
  if (!items.length) return '-'

  return items
    .map((line) => (line.startsWith('-') ? line : `- ${line}`))
    .join('\n')
}

export const generateMeetingSummary = (meeting: MeetingSummaryInput) => {
  const title = meeting.title.trim()
  const project = meeting.projectName.trim()
  const headingName = project ? `Reunión ${title} - ${project}` : `Reunión ${title}`
  const duration = Number(meeting.estimatedDuration) || 0
  const when = meeting.date ? summaryWhen(meeting.date) : ''
  const meta = [when, `${duration} min`].filter(Boolean).join(' | ')

  const section = (label: string, body: string) => [`*${label}:*`, body]

  const sectionLine = (label: string, body: string) => [`*${label}:* ${body}`]

  const nextSteps = meeting.nextSteps
    .map((step) => step.description.trim())
    .filter(Boolean)

  return [
    `*_${headingName}_*`,
    meta,
    '',
    ...section('Estado', textBlock(meeting.topicStatus)),
    '',
    ...section('Objetivo', textBlock(meeting.objective)),
    '',
    ...section('Agenda', bulletBlock(meeting.issues.map((item) => item.name))),
    '',
    ...sectionLine('Participantes', textBlock(meeting.participants)),
    ...(nextSteps.length
      ? ['', ...section('Siguientes pasos', bulletBlock(nextSteps))]
      : []),
  ].join('\n')
}
