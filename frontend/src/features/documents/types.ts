export type DocumentStatus = 'pending' | 'uploaded' | 'extracting' | 'extracted' | 'failed'

export interface Document {
  id: string
  application: string
  filename: string
  content_type: string
  size_bytes: number | null
  checksum: string
  version: number
  status: DocumentStatus
  created_at: string
  updated_at: string
}

export interface PresignResponse {
  document: Document
  upload_url: string
  expires_in: number
}

// Client-side per-file upload state — never sent to the server.
export type UploadPhase = 'queued' | 'presigning' | 'uploading' | 'completing' | 'done' | 'error'

export interface UploadItem {
  id: string          // local uuid, not the server's
  file: File
  phase: UploadPhase
  progress: number    // 0–100, meaningful during 'uploading'
  error?: string
}
