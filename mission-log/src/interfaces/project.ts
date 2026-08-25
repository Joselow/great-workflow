export interface Project {
  id: string
  userId: number
  name: string
  description?: string | null
  color: string
  createdAt: string
  updatedAt: string
}

export interface NewProject {
  name: string
  description?: string | null
  color?: string
}

export type PartialProject = Omit<Partial<Project>, 'id'> & {
  id?: string | null
}


export interface ActiveProject {
  id: string
  name: string
  color: string
}