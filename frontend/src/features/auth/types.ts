export type Role = 'admin' | 'reviewer' | 'auditor'

export interface User {
    id: string,
    email: string,
    full_name: string,
    role: Role,
    is_active: boolean,
    created_at: string
}

export interface LoginRequest {
    email: string,
    password: string
}

export interface LoginResponse {
    access: string,
    refresh: string,
    user: User
}