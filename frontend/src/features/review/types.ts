export type FieldStatus = 'unreviewed' | 'accepted' | 'edited' | 'rejected'

export interface ExtractedField {
  id: string
  document: string
  key: string
  value: string
  confidence: number
  bbox: { page: number; x: number; y: number; width: number; height: number } | null
  corrected_value: string
  status: FieldStatus
}

export interface FieldPatch {
  status: FieldStatus
  corrected_value?: string
}
