import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createApplication, getApplication, listApplications } from './api'

// Centralized query keys — the source of truth for cache invalidation.
export const applicationKeys = {
  all: ['applications'] as const,
  detail: (id: string) => ['applications', id] as const,
}

export function useApplications() {
  return useQuery({
    queryKey: applicationKeys.all,
    queryFn: listApplications,
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => getApplication(id),
    enabled: Boolean(id),
  })
}

export function useCreateApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      // Invalidate the list so the new application appears without a manual refetch.
      queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
  })
}
