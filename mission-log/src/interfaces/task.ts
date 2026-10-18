export interface Task {
  id: string
  userId: number
  projectId: string
  meetingId: string | null
  requirementId: string | null
  name: string
  description: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface TaskDraft {
  id?: string
  name: string
  description: string
  completed: boolean
  requirementId: string | null
}

export interface TaskCreateOrigin {
  projectId?: string
  meetingId?: string
}

export interface TaskListFilters {
  projectId: string
  meetingId?: string
  requirementId?: string | null
  completed?: boolean
}

export const emptyTaskDraft = (requirementId: string | null = null): TaskDraft => ({
  name: '',
  description: '',
  completed: false,
  requirementId,
})
