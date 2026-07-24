import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert, Box, Button, CircularProgress, Paper, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useApplications } from './hooks'
import { StatusChip } from './StatusChip'
import { CreateApplicationDialog } from './CreateApplicationDialog'
import { useAuth } from '@/features/auth/useAuth'

export function ApplicationsList() {
  const { data, isPending, isError } = useApplications()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)

  const canCreate = user?.role === 'admin' || user?.role === 'reviewer'

  if (isPending) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  }
  if (isError) {
    return <Alert severity="error">Failed to load applications.</Alert>
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Applications</Typography>
        {canCreate && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            New application
          </Button>
        )}
      </Stack>

      {data.results.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No applications yet.{canCreate ? ' Create one to get started.' : ''}
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.results.map((app) => (
                <TableRow
                  key={app.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/applications/${app.id}`)}
                >
                  <TableCell>{app.title}</TableCell>
                  <TableCell><StatusChip status={app.status} /></TableCell>
                  <TableCell>{app.owner.email}</TableCell>
                  <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <CreateApplicationDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  )
}
