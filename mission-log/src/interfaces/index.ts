export interface User {
  id: number
  email: string
  name?: string
  createdAt: string
  updatedAt: string
}

export type NoteTypeName = 'text' | 'audio'

export type NoteCategory =
  | 'task'
  | 'frase'
  | 'por_estudiar'
  | 'aprendizaje'
  | 'apunte'

export interface Note {
  id: string
  user_id: number
  type: string
  content: string
  category: string
  is_completed: boolean
  origin: string
  createdAt: string
  updatedAt: string
}

export interface CreateNoteBody {
  type: NoteTypeName
  content: string
  category?: NoteCategory
  is_completed?: boolean
  origin?: string
}

export interface UpdateNoteBody {
  content?: string
  is_completed?: boolean
  category?: NoteCategory
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean,
  message: string,
  user: User
  token: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  status: number
}
