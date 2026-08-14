import { useState } from 'react'
import {
  Box, Chip, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead,
  TableRow, TextField, Typography,
} from '@mui/material'
import { useAudit } from '@/features/workflow/hooks'

const ENTITY_TYPES = ['', 'Application', 'ExtractedField']

export function AuditPage() {
  const [entityType, setEntityType] = useState('')
  const { data, isPending } = useAudit(entityType ? { entity_type: entityType } : {})

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Audit log</Typography>
        <TextField
          select size="small" label="Entity" value={entityType}
          onChange={(e) => setEntityType(e.target.value)} sx={{ minWidth: 180 }}
        >
          {ENTITY_TYPES.map((t) => (
            <MenuItem key={t} value={t}>{t || 'All'}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>When</TableCell>
              <TableCell>Actor</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Change</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isPending ? (
              <TableRow><TableCell colSpan={5}>Loading…</TableCell></TableRow>
            ) : data && data.results.length > 0 ? (
              data.results.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>{new Date(e.created_at).toLocaleString()}</TableCell>
                  <TableCell>{e.actor_email ?? 'system'}</TableCell>
                  <TableCell><Chip size="small" label={e.action} /></TableCell>
                  <TableCell>{e.entity_type}</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {JSON.stringify(e.old_value)} → {JSON.stringify(e.new_value)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5}>No audit entries.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}
