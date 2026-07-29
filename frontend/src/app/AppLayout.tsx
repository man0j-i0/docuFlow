import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import { LogoMark } from './Logo'
import { useAuth, useLogout } from '@/features/auth/useAuth'
import type { Role } from '@/features/auth/types'

const NAV: Array<{ label: string; to: string; roles: Role[] }> = [
  { label: 'Dashboard', to: '/', roles: ['admin', 'reviewer', 'auditor'] },
  { label: 'Admin', to: '/admin', roles: ['admin'] },
  { label: 'Audit', to: '/audit', roles: ['admin', 'auditor'] },
]

const ROLE_COLOR: Record<Role, 'primary' | 'secondary' | 'default'> = {
  admin: 'primary',
  reviewer: 'secondary',
  auditor: 'default',
}

export function AppLayout() {
  const { user } = useAuth()
  const logout = useLogout()
  const location = useLocation()

  const visible = NAV.filter((item) => user && item.roles.includes(user.role))
  const initial = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mr: 3 }}>
            <LogoMark />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>DocuFlow</Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1 }}>
            {visible.map((item) => {
              const active = location.pathname === item.to
              return (
                <Button
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  size="small"
                  sx={{
                    color: active ? 'primary.main' : 'text.secondary',
                    bgcolor: active ? 'action.hover' : 'transparent',
                    fontWeight: active ? 700 : 600,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  {item.label}
                </Button>
              )
            })}
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Chip
              size="small"
              label={user?.role}
              color={user ? ROLE_COLOR[user.role] : 'default'}
              variant="outlined"
            />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ width: 30, height: 30, fontSize: 14, bgcolor: 'primary.main' }}>
                {initial}
              </Avatar>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user?.email}
              </Typography>
            </Stack>
            <Button onClick={logout} size="small" color="inherit" startIcon={<LogoutOutlinedIcon />}>
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
