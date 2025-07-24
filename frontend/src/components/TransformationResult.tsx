import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Download as DownloadIcon,
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon,
  Code as CodeIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import type { FormatType } from '../services/api'
import { downloadFile, copyToClipboard, FORMAT_EXTENSIONS } from '../utils/formatUtils'

interface TransformationResultProps {
  result: string | null
  targetFormat: FormatType | null
  fileName?: string
  processingTime?: number
  onClear?: () => void
}

const ResultContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  minHeight: 400,
  maxHeight: 600,
  display: 'flex',
  flexDirection: 'column',
}))

const CodeBlock = styled('pre')(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  overflow: 'auto',
  flexGrow: 1,
  margin: 0,
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
  fontSize: '0.875rem',
  lineHeight: 1.5,
}))

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: theme.palette.text.secondary,
  textAlign: 'center',
}))

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      {value === index && children}
    </div>
  )
}

const TransformationResult: React.FC<TransformationResultProps> = ({
  result,
  targetFormat,
  fileName = 'transformed_data',
  processingTime,
  onClear,
}) => {
  const [tabValue, setTabValue] = useState(0)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const handleDownload = () => {
    if (result && targetFormat) {
      const extension = FORMAT_EXTENSIONS[targetFormat][0]
      const downloadFileName = `${fileName.replace(/\.[^/.]+$/, "")}${extension}`
      
      let mimeType = 'text/plain'
      switch (targetFormat) {
        case 'JSON':
          mimeType = 'application/json'
          break
        case 'XML':
          mimeType = 'application/xml'
          break
        case 'CSV':
          mimeType = 'text/csv'
          break
      }
      
      downloadFile(result, downloadFileName, mimeType)
      showSnackbar('File downloaded successfully!')
    }
  }

  const handleCopy = async () => {
    if (result) {
      try {
        await copyToClipboard(result)
        showSnackbar('Content copied to clipboard!')
      } catch (error) {
        showSnackbar('Failed to copy content')
      }
    }
  }

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message)
    setSnackbarOpen(true)
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const formatResult = (content: string, format: FormatType | null): string => {
    if (!format) return content

    try {
      switch (format) {
        case 'JSON':
          return JSON.stringify(JSON.parse(content), null, 2)
        case 'XML':
          // Simple XML formatting - in a real app, you might use a library
          return content
            .replace(/></g, '>\n<')
            .split('\n')
            .map((line, index, array) => {
              const trimmed = line.trim()
              if (trimmed.startsWith('</')) {
                return '  '.repeat(Math.max(0, array.slice(0, index).filter(l => l.trim().startsWith('<') && !l.trim().startsWith('</')).length - array.slice(0, index).filter(l => l.trim().startsWith('</')).length - 1)) + trimmed
              } else if (trimmed.startsWith('<') && !trimmed.includes('</')) {
                return '  '.repeat(array.slice(0, index).filter(l => l.trim().startsWith('<') && !l.trim().startsWith('</')).length - array.slice(0, index).filter(l => l.trim().startsWith('</')).length) + trimmed
              }
              return trimmed
            })
            .join('\n')
        default:
          return content
      }
    } catch {
      return content
    }
  }

  if (!result) {
    return (
      <ResultContainer elevation={1}>
        <Typography variant="h6" gutterBottom>
          Transformation Result
        </Typography>
        <EmptyState>
          <CodeIcon sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No transformation result yet
          </Typography>
          <Typography variant="body2">
            Upload a file and select formats to see the transformation result
          </Typography>
        </EmptyState>
      </ResultContainer>
    )
  }

  const formattedResult = formatResult(result, targetFormat)

  return (
    <ResultContainer elevation={1}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Transformation Result
          {targetFormat && ` (${targetFormat})`}
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Copy to clipboard">
            <IconButton onClick={handleCopy} size="small">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download file">
            <IconButton onClick={handleDownload} size="small">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {processingTime && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Transformation completed in {processingTime}ms
        </Alert>
      )}

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2, minHeight: 40 }}>
        <Tab label="Formatted" icon={<VisibilityIcon />} />
        <Tab label="Raw" icon={<CodeIcon />} />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <CodeBlock>{formattedResult}</CodeBlock>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <CodeBlock>{result}</CodeBlock>
      </TabPanel>

      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Size: {new Blob([result]).size} bytes
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Download
          </Button>
          {onClear && (
            <Button variant="outlined" onClick={onClear}>
              Clear
            </Button>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </ResultContainer>
  )
}

export default TransformationResult
