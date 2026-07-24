import { useDropzone } from 'react-dropzone'
import { Box, Typography } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
}

export function UploadDropzone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT,          // matches the serializer's allow-list
    onDrop: onFiles,
  })

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        bgcolor: isDragActive ? 'action.hover' : 'transparent',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'border-color 120ms, background-color 120ms',
      }}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
      <Typography color="text.secondary">
        {isDragActive ? 'Drop the files…' : 'Drag files here, or click to browse'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        PDF, PNG, JPEG
      </Typography>
    </Box>
  )
}
