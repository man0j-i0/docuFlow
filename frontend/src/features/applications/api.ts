import { api } from '@/lib/api'
import type { Application, CreateApplicationRequest, Paginated } from './types'

export async function listApplications(): Promise<Paginated<Application>> {
  const { data } = await api.get<Paginated<Application>>('/applications')
  return data
}

export async function getApplication(id: string): Promise<Application> {
  const { data } = await api.get<Application>(`/applications/${id}`)
  return data
}

export async function createApplication(
  payload: CreateApplicationRequest,
): Promise<Application> {
  const { data } = await api.post<Application>('/applications', payload)
  return data
}
