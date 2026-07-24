import {
  Alert, Box, Chip, IconButton, LinearProgress, List, ListItem,
  ListItemText, Paper, Typography,
} from '@mui/material'
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
  const { items, addFiles, retry } = useUploadManager(applicationId)
  const { data: documents, isPending } = useDocuments(applicationId)

  const canUpload = user?.role === 'admin' || user?.role === 'reviewer'
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
                  secondaryAction={<Chip size="small" label={doc.status} />}
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
