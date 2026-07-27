import { api } from '@/lib/api'
import type { ExtractedField, FieldPatch } from './types'

export async function listFields(documentId: string): Promise<ExtractedField[]> {
  const { data } = await api.get('/fields', { params: { document: documentId } })
  return data.results as ExtractedField[]
}

export async function patchField(id: string, patch: FieldPatch): Promise<ExtractedField> {
  const { data } = await api.patch<ExtractedField>(`/fields/${id}`, patch)
  return data
}

export async function submitReview(applicationId: string) {
  const { data } = await api.post(`/applications/${applicationId}/submit_review`, {})
  return data
}
