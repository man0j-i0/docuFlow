import { api } from '@/lib/api'
import { tokenStore } from '@/lib/tokens'
import type { LoginRequest, LoginResponse, User } from './types'

export async function login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', payload)
    return data
}

export async function fetchMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me')
    return data
}

export async function logout(): Promise<void> {
    const refresh = tokenStore.getRefresh()
    if (!refresh) return
    await api.post('/auth/logout', { refresh }).catch(() => undefined)
}

