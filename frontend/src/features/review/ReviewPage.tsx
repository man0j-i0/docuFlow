import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert, Box, Button, CircularProgress, Divider, LinearProgress, Paper, Stack, Typography,
} from '@mui/material'
import { useFields, usePatchField, useSubmitReview } from './hooks'
import { FieldRow } from './FieldRow'
import { useDocument } from '@/features/documents/hooks'
import { useApplication } from '@/features/applications/hooks'

export function ReviewPage() {
  const { documentId = '' } = useParams()
  const navigate = useNavigate()

  const { data: doc } = useDocument(documentId)
  const applicationId = doc?.application ?? ''
  const { data: application } = useApplication(applicationId)
  const { data: fields, isPending } = useFields(documentId)
  const patch = usePatchField(documentId)
  const submit = useSubmitReview(applicationId)

  const reviewed = useMemo(
    () => (fields ?? []).filter((f) => f.status !== 'unreviewed').length,
    [fields],
  )
  const total = fields?.length ?? 0
  // Submitting is only valid while the application is in 'review'. Once it moves
  // to pending_approval the server rejects a resubmit with 409 — reflect that.
  const inReview = application?.status === 'review'
  const allReviewed = total > 0 && reviewed === total
  const canSubmit = inReview && allReviewed

  if (isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }
  if (!fields || fields.length === 0) {
    return <Alert severity="info">No extracted fields to review.</Alert>
  }

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Review fields</Typography>
        <Button
          variant="contained"
          disabled={!canSubmit || submit.isPending}
          onClick={() =>
            submit.mutate(undefined, {
              onSuccess: () => navigate(`/applications/${applicationId}`),
            })
          }
        >
          {submit.isPending ? 'Submitting…' : 'Submit review'}
        </Button>
      </Stack>

      {application && !inReview && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This application is <strong>{application.status.replace('_', ' ')}</strong> — the
          review has already been submitted.
        </Alert>
      )}

      {submit.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Could not submit — the application may no longer be in review.
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {reviewed} of {total} reviewed
      </Typography>
      <LinearProgress
        variant="determinate"
        value={total ? (reviewed / total) * 100 : 0}
        sx={{ mb: 3 }}
      />

      <Paper variant="outlined">
        <Stack divider={<Divider />}>
          {fields.map((f) => (
            <FieldRow
              key={f.id}
              field={f}
              saving={patch.isPending}
              onPatch={(p) => patch.mutate({ id: f.id, patch: p })}
            />
          ))}
        </Stack>
      </Paper>
    </Box>
  )
}
