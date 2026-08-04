export interface User {
    id: number
    name?: string
    phone?: string
    email: string
    createdAt: string
    updatedAt: string
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterCredentials {
    name: string
    email: string
    phone?: string
    password: string
}

export interface LoginResponse {
    success: boolean,
    message: string,
    user: User
    token: string
}