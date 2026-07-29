import { createTheme } from '@mui/material/styles'

// A single, cohesive design system. Tuning these tokens restyles the whole app,
// since every screen uses MUI components that read from the theme.

const INK = '#0f172a' // slate-900
const MUTED = '#64748b' // slate-500
const LINE = '#e2e8f0' // slate-200
const PRIMARY = '#4f46e5' // indigo-600

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: PRIMARY, light: '#6366f1', dark: '#4338ca' },
    secondary: { main: '#0ea5e9' },
    success: { main: '#16a34a' },
    warning: { main: '#d97706' },
    error: { main: '#dc2626' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: INK, secondary: MUTED },
    divider: LINE,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600 },
    overline: { fontWeight: 600, letterSpacing: '0.08em' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          paddingInline: 16,
          transition: 'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
          '&.MuiButton-containedPrimary': {
            boxShadow: '0 1px 2px rgba(79,70,229,0.25)',
            '&:hover': { boxShadow: '0 8px 20px rgba(79,70,229,0.35)', transform: 'translateY(-1px)' },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: { borderColor: LINE },
        rounded: { borderRadius: 14 },
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          borderColor: LINE,
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'saturate(180%) blur(8px)',
          color: INK,
          borderBottom: `1px solid ${LINE}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 }, sizeSmall: { height: 22 } },
    },
    MuiTextField: { defaultProps: { size: 'medium' } },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, color: MUTED, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' },
      },
    },
    MuiTableRow: {
      styleOverrides: { root: { '&:last-child td': { borderBottom: 0 } } },
    },
  },
})
