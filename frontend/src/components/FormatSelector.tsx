import React from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import type { FormatType } from '../services/api'
import { FORMAT_DESCRIPTIONS, FORMAT_ICONS } from '../utils/formatUtils'

interface FormatSelectorProps {
  formats: FormatType[]
  selectedFormat: FormatType | null
  onFormatSelect: (format: FormatType) => void
  title: string
  disabled?: boolean
}

const FormatIcon = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  marginRight: theme.spacing(1),
  userSelect: 'none',
  display: 'inline-flex',
  alignItems: 'center',
}))

const FormatSelector: React.FC<FormatSelectorProps> = ({
  formats,
  selectedFormat,
  onFormatSelect,
  title,
  disabled = false,
}) => {
  const handleChange = (event: any) => {
    const value = event.target.value as FormatType
    onFormatSelect(value)
  }

  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id={`${title.toLowerCase().replace(/\s+/g, '-')}-label`}>
          {title}
        </InputLabel>
        <Select
          labelId={`${title.toLowerCase().replace(/\s+/g, '-')}-label`}
          value={selectedFormat || ''}
          label={title}
          onChange={handleChange}
          renderValue={(selected) => {
            if (!selected) return ''
            return (
              <Box display="flex" alignItems="center">
                <FormatIcon>{FORMAT_ICONS[selected as FormatType]}</FormatIcon>
                <Typography>{selected}</Typography>
              </Box>
            )
          }}
        >
          {formats.map((format) => (
            <MenuItem key={format} value={format}>
              <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                <FormatIcon>{FORMAT_ICONS[format]}</FormatIcon>
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body1" component="div">
                  {format}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {FORMAT_DESCRIPTIONS[format]}
                </Typography>
              </ListItemText>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default FormatSelector
