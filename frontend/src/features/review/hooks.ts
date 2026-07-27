import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listFields, patchField, submitReview } from './api'
import { applicationKeys } from '@/features/applications/hooks'
import type { FieldPatch } from './types'

export const fieldKeys = {
  forDocument: (documentId: string) => ['fields', documentId] as const,
}

export function useFields(documentId: string) {
  return useQuery({
    queryKey: fieldKeys.forDocument(documentId),
    queryFn: () => listFields(documentId),
    enabled: Boolean(documentId),
  })
}

export function usePatchField(documentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: FieldPatch }) => patchField(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fieldKeys.forDocument(documentId) })
    },
  })
}

export function useSubmitReview(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => submitReview(applicationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: applicationKeys.detail(applicationId) })
    },
  })
}
