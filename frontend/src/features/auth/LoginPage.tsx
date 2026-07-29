import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { LogoMark } from '@/app/Logo'
import { useAuth, useLogin } from './useAuth'

const FEATURES = [
  { icon: <BoltOutlinedIcon fontSize="small" />, text: 'Async AI extraction with confidence scoring' },
  { icon: <VerifiedUserOutlinedIcon fontSize="small" />, text: 'Human-in-the-loop review and approval' },
  { icon: <FactCheckOutlinedIcon fontSize="small" />, text: 'Role-based access, audited end to end' },
]

const PIPELINE = ['Upload', 'Extract', 'Review', 'Approve']

const DEMO = { email: 'reviewer@docuflow.local', password: 'devpass123' }

export function LoginPage() {
  const { isAuthenticated } = useAuth()
  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ email, password })
      const from = (location.state as { from?: string } | null)?.from ?? '/'
      navigate(from, { replace: true })
    } catch {
      setError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  function fillDemo() {
    setEmail(DEMO.email)
    setPassword(DEMO.password)
  }

  async function copyDemo() {
    await navigator.clipboard.writeText(`${DEMO.email} / ${DEMO.password}`).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Branded panel — hidden on small screens */}
      <Box
        sx={{
          flex: 1.1,
          position: 'relative',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          color: '#fff',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #4f46e5 0%, #6d28d9 55%, #0ea5e9 130%)',
          // faint document-grid texture over the gradient
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '38px 38px',
            maskImage: 'radial-gradient(120% 80% at 30% 20%, #000 40%, transparent 100%)',
          },
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', zIndex: 1 }}>
          <LogoMark light />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>DocuFlow</Typography>
        </Stack>

        <Box sx={{ zIndex: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 2 }}>
            Document workflows,
            <br />
            AI-assisted end to end.
          </Typography>
          <Typography sx={{ opacity: 0.85, mb: 4, maxWidth: 440 }}>
            Upload, extract, review, and approve — with confidence scores on every
            field and every action audited.
          </Typography>
          <Stack spacing={1.5}>
            {FEATURES.map((f) => (
              <Stack key={f.text} direction="row" spacing={1.5} sx={{ alignItems: 'center', opacity: 0.95 }}>
                {f.icon}
                <Typography variant="body2">{f.text}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* subtle animated pipeline */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', zIndex: 1 }}>
          {PIPELINE.map((step, i) => (
            <Stack key={step} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  px: 1.5, py: 0.5, borderRadius: 999, fontSize: 12, fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.3)',
                  animation: 'dfpulse 6s ease-in-out infinite',
                  animationDelay: `${i * 1.5}s`,
                  '@keyframes dfpulse': {
                    '0%, 100%': { background: 'transparent', opacity: 0.6 },
                    '20%, 30%': { background: 'rgba(255,255,255,0.18)', opacity: 1 },
                  },
                }}
              >
                {step}
              </Box>
              {i < PIPELINE.length - 1 && (
                <Box sx={{ opacity: 0.5, fontSize: 12 }}>→</Box>
              )}
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          {/* logo shows on mobile where the brand panel is hidden */}
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ alignItems: 'center', mb: 4, display: { xs: 'flex', md: 'none' } }}
          >
            <LogoMark />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>DocuFlow</Typography>
          </Stack>

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Sign in to DocuFlow
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Continue to your workspace
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{ py: 1.25 }}
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </form>

          {/* Demo account card */}
          <Box
            sx={{
              mt: 4, p: 2, borderRadius: 3,
              border: '1px dashed', borderColor: 'divider', bgcolor: 'background.default',
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="overline" color="text.secondary">Demo account · reviewer</Typography>
              <Tooltip title={copied ? 'Copied' : 'Copy credentials'}>
                <IconButton size="small" onClick={copyDemo}>
                  {copied ? <CheckOutlinedIcon fontSize="small" color="success" /> : <ContentCopyOutlinedIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{DEMO.email}</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary', mb: 1.5 }}>
              {DEMO.password}
            </Typography>
            <Button size="small" variant="outlined" onClick={fillDemo} fullWidth>
              Use demo account
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
