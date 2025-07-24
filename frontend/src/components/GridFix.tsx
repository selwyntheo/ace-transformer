import React from 'react'
import { Box } from '@mui/material'

// Temporary Grid wrapper to fix MUI v7 Grid issues
export const GridContainer: React.FC<{ children: React.ReactNode; spacing?: number }> = ({ 
  children, 
  spacing = 2 
}) => (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: spacing * 8 + 'px',
    }}
  >
    {children}
  </Box>
)

export const GridItem: React.FC<{ 
  children: React.ReactNode; 
  xs?: number | 'auto';
  sm?: number | 'auto';
}> = ({ 
  children, 
  xs = 12,
  sm 
}) => {
  const getWidth = (size: number | 'auto' | undefined) => {
    if (size === 'auto') return 'auto'
    if (typeof size === 'number') return `${(size / 12) * 100}%`
    return '100%'
  }

  return (
    <Box
      sx={{
        width: {
          xs: getWidth(xs),
          sm: getWidth(sm || xs),
        },
        minWidth: 0, // Allow shrinking
        flexGrow: xs === 'auto' ? 0 : undefined,
      }}
    >
      {children}
    </Box>
  )
}
