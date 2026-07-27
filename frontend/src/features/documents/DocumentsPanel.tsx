import {
  Alert, Box, Button, Chip, CircularProgress, IconButton, LinearProgress, List, ListItem,
  ListItemText, Paper, Stack, Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import type { DocumentStatus } from './types'
import ReplayIcon from '@mui/icons-material/Replay'
import { UploadDropzone } from './UploadDropzone'
import { useUploadManager } from './useUploadManager'
import { useDocuments } from './hooks'
import type { UploadItem } from './types'
import { useAuth } from '@/features/auth/useAuth'

function formatSize(bytes: number | null) {
  if (!bytes) return '—'
  const kb = bytes / 1024
  return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`
}

function DocStatusChip({ status }: { status: DocumentStatus }) {
  // In-flight states show a spinner; the polling hook refetches until they settle.
  if (status === 'extracting' || status === 'pending') {
    return <Chip size="small" icon={<CircularProgress size={12} />} label={status} />
  }
  const color = status === 'extracted' ? 'success' : status === 'failed' ? 'error' : 'default'
  return <Chip size="small" label={status} color={color} />
}

function UploadRow({ item, onRetry }: { item: UploadItem; onRetry: (id: string) => void }) {
  return (
    <ListItem
      secondaryAction={
        item.phase === 'error' ? (
          <IconButton edge="end" onClick={() => onRetry(item.id)} title="Retry">
            <ReplayIcon />
          </IconButton>
        ) : null
      }
    >
      <ListItemText
        primary={item.file.name}
        secondary={
          item.phase === 'uploading' ? (
            <LinearProgress variant="determinate" value={item.progress} sx={{ mt: 0.5 }} />
          ) : item.phase === 'error' ? (
            <Typography variant="caption" color="error">{item.error}</Typography>
          ) : (
            item.phase
          )
        }
      />
    </ListItem>
  )
}

export function DocumentsPanel({ applicationId }: { applicationId: string }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items, addFiles, retry } = useUploadManager(applicationId)
  const { data: documents, isPending } = useDocuments(applicationId)

  const canReview = user?.role === 'admin' || user?.role === 'reviewer'
  const canUpload = canReview
  const activeUploads = items.filter((it) => it.phase !== 'done')

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Documents</Typography>

      {canUpload && <UploadDropzone onFiles={addFiles} />}

      {activeUploads.length > 0 && (
        <Paper variant="outlined" sx={{ mt: 2 }}>
          <List dense>
            {activeUploads.map((it) => <UploadRow key={it.id} item={it} onRetry={retry} />)}
          </List>
        </Paper>
      )}

      <Box sx={{ mt: 2 }}>
        {isPending ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : !documents || documents.length === 0 ? (
          <Alert severity="info">No documents uploaded yet.</Alert>
        ) : (
          <Paper variant="outlined">
            <List>
              {documents.map((doc) => (
                <ListItem
                  key={doc.id}
                  secondaryAction={
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      {canReview && doc.status === 'extracted' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/documents/${doc.id}/review`)}
                        >
                          Review
                        </Button>
                      )}
                      <DocStatusChip status={doc.status} />
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={`${doc.filename} (v${doc.version})`}
                    secondary={formatSize(doc.size_bytes)}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </Box>
  )
}
