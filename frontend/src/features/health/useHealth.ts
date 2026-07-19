import { useQuery } from '@tanstack/react-query'
import { fetchHealth } from './api'

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 10_000,
    // A 503 is a meaningful answer, not a transient blip — don't hammer it.
    retry: 1,
  })
}
