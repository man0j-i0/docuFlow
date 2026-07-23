import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth, useLogout } from '@/features/auth/useAuth'
import type { Role } from '@/features/auth/types'

const NAV: Array<{ label: string; to: string; roles: Role[] }> = [
  { label: 'Dashboard', to: '/', roles: ['admin', 'reviewer', 'auditor'] },
  { label: 'Admin', to: '/admin', roles: ['admin'] },
  { label: 'Review', to: '/review', roles: ['admin', 'reviewer'] },
  { label: 'Audit', to: '/audit', roles: ['admin', 'auditor'] },
]

export function AppLayout() {
  const { user } = useAuth()
  const logout = useLogout()
  const location = useLocation()

  const visible = NAV.filter((item) => user && item.roles.includes(user.role))

  return (
    <Box>
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700, mr: 4 }}>
            DocuFlow
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
            {visible.map((item) => (
              <Button
                key={item.to}
                component={RouterLink}
                to={item.to}
                color={location.pathname === item.to ? 'primary' : 'inherit'}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Chip size="small" label={user?.role} color="primary" variant="outlined" />
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <Button onClick={logout} size="small">
              Log out
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
