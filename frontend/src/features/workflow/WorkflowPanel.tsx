import {
  Alert, Box, Button, Divider, Stack, Typography,
} from '@mui/material'
import { useTransitions, useApplicationAction } from './hooks'
import { useAuth } from '@/features/auth/useAuth'
import type { ApplicationStatus } from '@/features/applications/types'

function relTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString()
}

export function WorkflowPanel({
  applicationId,
  status,
}: {
  applicationId: string
  status: ApplicationStatus
}) {
  const { user } = useAuth()
  const { data: transitions } = useTransitions(applicationId)
  const act = useApplicationAction(applicationId)

  const isReviewer = user?.role === 'reviewer' || user?.role === 'admin'
  const isAdmin = user?.role === 'admin'

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Workflow</Typography>

      {/* actions available from the current state */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        {status === 'review' && isReviewer && (
          <Button variant="contained" disabled={act.isPending}
            onClick={() => act.mutate('submit_review')}>
            Submit for approval
          </Button>
        )}
        {status === 'pending_approval' && isAdmin && (
          <>
            <Button variant="contained" color="success" disabled={act.isPending}
              onClick={() => act.mutate('approve')}>Approve</Button>
            <Button variant="outlined" color="error" disabled={act.isPending}
              onClick={() => act.mutate('reject')}>Reject</Button>
            <Button variant="text" disabled={act.isPending}
              onClick={() => act.mutate('send_back')}>Send back</Button>
          </>
        )}
        {act.isError && <Alert severity="error">Action failed — the state may have changed.</Alert>}
      </Stack>

      {/* timeline */}
      {transitions && transitions.length > 0 ? (
        <Stack sx={{ position: 'relative', pl: 1 }}>
          {transitions.map((t, i) => (
            <Stack key={t.id} direction="row" spacing={2} sx={{ pb: i < transitions.length - 1 ? 2 : 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.5 }} />
                {i < transitions.length - 1 && <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 0.5 }} />}
              </Box>
              <Box sx={{ pb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t.from_state.replace('_', ' ')} → {t.to_state.replace('_', ' ')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.actor_email ?? 'system'} · {relTime(t.created_at)}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : (
        <>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">No transitions yet.</Typography>
        </>
      )}
    </Box>
  )
}
