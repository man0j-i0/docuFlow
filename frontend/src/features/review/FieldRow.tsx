import { useState } from 'react'
import {
  Box, Button, IconButton, Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import { ConfidenceBadge } from './ConfidenceBadge'
import type { ExtractedField, FieldPatch } from './types'

export function FieldRow({
  field,
  onPatch,
  saving,
}: {
  field: ExtractedField
  onPatch: (patch: FieldPatch) => void
  saving: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(field.corrected_value || field.value)

  const lowConfidence = field.confidence < 0.6
  const displayValue = field.status === 'edited' ? field.corrected_value : field.value

  const statusColor =
    field.status === 'accepted' ? 'success.main'
    : field.status === 'edited' ? 'info.main'
    : field.status === 'rejected' ? 'error.main'
    : 'transparent'

  return (
    <Box
      sx={{
        p: 2,
        borderLeft: 3,
        borderColor: statusColor,
        bgcolor:
          lowConfidence && field.status === 'unreviewed'
            ? 'rgba(211,47,47,0.06)'
            : 'transparent',
      }}
    >
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
          {field.key.replace('_', ' ')}
        </Typography>
        <ConfidenceBadge value={field.confidence} />
      </Stack>

      {editing ? (
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
          <Button
            size="small"
            variant="contained"
            disabled={saving}
            onClick={() => {
              onPatch({ status: 'edited', corrected_value: draft })
              setEditing(false)
            }}
          >
            Save
          </Button>
          <Button size="small" onClick={() => setEditing(false)}>Cancel</Button>
        </Stack>
      ) : (
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            sx={{ textDecoration: field.status === 'rejected' ? 'line-through' : 'none' }}
          >
            {displayValue || '—'}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Accept">
              <IconButton
                size="small"
                color="success"
                disabled={saving}
                onClick={() => onPatch({ status: 'accepted' })}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" color="info" disabled={saving} onClick={() => setEditing(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject">
              <IconButton
                size="small"
                color="error"
                disabled={saving}
                onClick={() => onPatch({ status: 'rejected' })}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      )}
    </Box>
  )
}
