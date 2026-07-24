import type { User } from '@/features/auth/types'

export type ApplicationStatus =
  | 'draft'
  | 'uploaded'
  | 'extracting'
  | 'review'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'archived'

export interface Application {
    id: string
    title: string
    description: string
    status: ApplicationStatus
    owner: User
    created_at: string
    updated_at: string
}

export interface CreateApplicationRequest {
    title: string
    description?: string
}

export interface Paginated<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
}