import { useParams } from 'react-router-dom'
import { Alert, Box, CircularProgress, Divider, Paper, Stack, Typography } from '@mui/material'
import { useApplication } from './hooks'
import { StatusChip } from './StatusChip'

export function ApplicationDetail() {
  const { id = '' } = useParams()
  const { data: app, isPending, isError } = useApplication(id)

  if (isPending) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  }
  if (isError || !app) {
    return <Alert severity="error">Application not found.</Alert>
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{app.title}</Typography>
        <StatusChip status={app.status} />
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="overline" color="text.secondary">Description</Typography>
            <Typography>{app.description || '—'}</Typography>
          </Box>
          <Divider />
          <Stack direction="row" spacing={4}>
            <Box>
              <Typography variant="overline" color="text.secondary">Owner</Typography>
              <Typography>{app.owner.email}</Typography>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary">Created</Typography>
              <Typography>{new Date(app.created_at).toLocaleString()}</Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {/* Documents panel + upload land here in PR 4. */}
    </Box>
  )
}
