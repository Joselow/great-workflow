export interface Log {
    id: string
    userId: number
    meetingId?: string | null
    typeMeetingLink?: number | null

    description: string
    responsible: string
    tags: string

    completed?: boolean | null
    comment?: string | null
    createdAt: string
    updatedAt: string
}

export interface NewLog {
    description: string
    responsible: string
    tags: string
    
    completed?: boolean | null
    comment?: string | null
}