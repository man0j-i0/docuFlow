import { Box, Container, Link, Stack, Typography } from '@mui/material'
import { HealthCard } from '@/features/health/HealthCard'

export function HomePage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          DocuFlow
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
          AI-assisted document workflow — upload, extract, review, approve, audit.
        </Typography>

        <Stack spacing={2}>
          <HealthCard />
          <Typography variant="body2" color="text.secondary">
            API docs:{' '}
            <Link href="http://localhost:8000/api/docs" target="_blank" rel="noreferrer">
              /api/docs
            </Link>
          </Typography>
        </Stack>
      </Box>
    </Container>
  )
}
