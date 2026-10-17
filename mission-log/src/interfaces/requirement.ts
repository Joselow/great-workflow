export interface Requirement {
  id: string
  userId: number
  projectId: string
  meetingId: string | null
  name: string
  createdAt: string
  updatedAt: string
}

export interface RequirementDraft {
  name: string
}

export interface RequirementCreatePayload {
  name: string
  projectId: string
  meetingId?: string
}
