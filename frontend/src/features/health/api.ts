import { rootApi } from '@/lib/api'
import type { HealthResponse } from './types'

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await rootApi.get<HealthResponse>('healthz')
  return data
}
