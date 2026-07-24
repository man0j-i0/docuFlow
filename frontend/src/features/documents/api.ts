import axios from 'axios'
import { api } from '@/lib/api'
import type { Document, PresignResponse } from './types'

export async function listDocuments(applicationId: string): Promise<Document[]> {
  const { data } = await api.get('/documents', { params: { application: applicationId } })
  // DRF pagination envelope
  return data.results as Document[]
}

export async function presignUpload(
  applicationId: string,
  filename: string,
  contentType: string,
): Promise<PresignResponse> {
  const { data } = await api.post<PresignResponse>(
    `/applications/${applicationId}/documents`,
    { filename, content_type: contentType },
  )
  return data
}

export async function uploadToStorage(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  // Bare axios: no Authorization header, no /api/v1 baseURL. The presigned URL
  // is the credential, and the Content-Type MUST match what was signed.
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (e) => {
      if (e.total) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
}

export async function completeUpload(documentId: string): Promise<Document> {
  const { data } = await api.post<Document>(`/documents/${documentId}/complete`, {})
  return data
}
