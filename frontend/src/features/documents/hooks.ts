import { useQuery } from '@tanstack/react-query'
import { getDocument, listDocuments } from './api'

export const documentKeys = {
  forApplication: (applicationId: string) => ['documents', applicationId] as const,
  detail: (documentId: string) => ['document', documentId] as const,
}

export function useDocument(documentId: string) {
  return useQuery({
    queryKey: documentKeys.detail(documentId),
    queryFn: () => getDocument(documentId),
    enabled: Boolean(documentId),
  })
}

export function useDocuments(applicationId: string) {
  return useQuery({
    queryKey: documentKeys.forApplication(applicationId),
    queryFn: () => listDocuments(applicationId),
    enabled: Boolean(applicationId),
    // Poll every 2s while any document is still processing; stop once all
    // documents have reached a terminal state. This is what makes the UI
    // update itself after an async extraction finishes — no manual refresh.
    refetchInterval: (query) => {
      const docs = query.state.data
      if (!docs) return false
      const stillWorking = docs.some(
        (d) => d.status === 'extracting' || d.status === 'pending',
      )
      return stillWorking ? 2000 : false
    },
  })
}
