import { Chip } from '@mui/material'
import type { ApplicationStatus } from './types'

const COLORS: Record<ApplicationStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  draft: 'default',
  uploaded: 'info',
  extracting: 'info',
  review: 'warning',
  pending_approval: 'warning',
  approved: 'success',
  rejected: 'error',
  archived: 'default',
}

export function StatusChip({ status }: { status: ApplicationStatus }) {
  return <Chip size="small" label={status.replace('_', ' ')} color={COLORS[status]} />
}
