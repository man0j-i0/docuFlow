import { Chip } from '@mui/material'

export function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = value >= 0.85 ? 'success' : value >= 0.6 ? 'warning' : 'error'
  return <Chip size="small" color={color} label={`${pct}%`} variant="outlined" />
}
