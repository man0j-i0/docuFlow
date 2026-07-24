import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField,
} from '@mui/material'
import { useCreateApplication } from './hooks'

export function CreateApplicationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateApplication()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const app = await create.mutateAsync({ title, description })
    setTitle('')
    setDescription('')
    onClose()
    navigate(`/applications/${app.id}`)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>New application</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus fullWidth />
            <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
