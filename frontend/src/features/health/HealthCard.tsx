import {
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import { useHealth } from './useHealth'
import type { HealthCheck } from './types'

function CheckRow({ label, check }: { label: string; check: HealthCheck }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Chip
        size="small"
        color={check.ok ? 'success' : 'error'}
        icon={check.ok ? <CheckCircleIcon /> : <ErrorIcon />}
        label={check.ok ? 'reachable' : check.detail}
      />
    </Stack>
  )
}

export function HealthCard() {
  const { data, isPending, isError, error } = useHealth()

  return (
    <Card variant="outlined" sx={{ maxWidth: 460, width: '100%' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          Backend status
        </Typography>

        {isPending && (
          <Stack direction="row" spacing={1.5} sx={{ mt: 1, alignItems: 'center' }}>
            <CircularProgress size={18} />
            <Typography variant="body2">Checking…</Typography>
          </Stack>
        )}

        {isError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            API unreachable — is Django running on :8000?
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
              {error instanceof Error ? error.message : 'Unknown error'}
            </Typography>
          </Alert>
        )}

        {data && (
          <>
            <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2, alignItems: 'center' }}>
              {data.status === 'ok' ? (
                <CheckCircleIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
              <Typography variant="h6">
                {data.status === 'ok' ? 'All systems operational' : 'Degraded'}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <CheckRow label="PostgreSQL" check={data.checks.database} />
              <CheckRow label="Redis" check={data.checks.redis} />
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  )
}
