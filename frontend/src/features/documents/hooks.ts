import { useQuery } from '@tanstack/react-query'
import { listDocuments } from './api'

export const documentKeys = {
  forApplication: (applicationId: string) => ['documents', applicationId] as const,
}

export function useDocuments(applicationId: string) {
  return useQuery({
    queryKey: documentKeys.forApplication(applicationId),
    queryFn: () => listDocuments(applicationId),
    enabled: Boolean(applicationId),
  })
}
