import { Alert, Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import type { Role } from '@/features/auth/types'


export function RoleRoute({ allow }: { allow: Role[] }) {
  const { user } = useAuth()

  if (!user || !allow.includes(user.role)) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          You don’t have permission to view this page.
        </Alert>
      </Box>
    )
  }

  return <Outlet />
}
