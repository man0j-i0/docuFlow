import { Box } from '@mui/material'

/** Hexagon mark with a document glyph. `light` renders white-on-transparent
 *  for use over the gradient panel. */
export function LogoMark({ size = 30, light = false }: { size?: number; light?: boolean }) {
  const fill = light ? 'rgba(255,255,255,0.16)' : 'url(#dfg)'
  const stroke = light ? '#fff' : '#fff'
  return (
    <Box sx={{ width: size, height: size, display: 'grid', placeItems: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="dfg" x1="0" y1="0" x2="32" y2="32">
            <stop stopColor="#4f46e5" />
            <stop offset="1" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
        <path
          d="M16 1.7l11.3 6.5v13L16 27.7 4.7 21.2v-13L16 1.7z"
          fill={fill}
          stroke={light ? 'rgba(255,255,255,0.4)' : 'none'}
        />
        <path
          d="M13 10.5h6M13 14h6M13 17.5h4"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}
