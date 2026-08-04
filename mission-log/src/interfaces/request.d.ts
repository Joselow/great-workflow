export interface ResponseComposables <T> {
    success: boolean
    data?: T
}


type FieldErrors = Record<string, string[]>;

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiResponseError {
  message: string
  success: number,
  errors: FieldErrors | string
}
