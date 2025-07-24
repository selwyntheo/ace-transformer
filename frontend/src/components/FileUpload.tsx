import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material'
import {
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import type { FormatType } from '../services/api'
import {
  isValidFileType,
  formatFileSize,
  detectFormatFromFileName,
  detectFormatFromContent,
} from '../utils/formatUtils'

interface FileUploadProps {
  onFileUpload: (content: string, fileName: string, detectedFormat?: FormatType) => void
  onFileRemove: () => void
  uploadedFile: string | null
  fileName: string | null
  disabled?: boolean
  maxSize?: number // in bytes
}

const DropzoneContainer = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isDragActive' && prop !== 'hasError',
})<{ isDragActive: boolean; hasError: boolean }>(
  ({ theme, isDragActive, hasError }) => ({
    border: `2px dashed ${
      hasError
        ? theme.palette.error.main
        : isDragActive
        ? theme.palette.primary.main
        : theme.palette.grey[300]
    }`,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(4),
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: isDragActive
      ? theme.palette.action.hover
      : hasError
      ? theme.palette.error.light + '20'
      : theme.palette.background.paper,
    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.action.hover,
    },
  })
)

const FileInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(2),
}))

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  onFileRemove,
  uploadedFile,
  fileName,
  disabled = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
}) => {
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const processFile = useCallback(
    async (file: File) => {
      setError(null)
      setIsProcessing(true)

      try {
        // Validate file type
        if (!isValidFileType(file)) {
          throw new Error('Unsupported file type. Please upload JSON, XML, CSV, or TXT files.')
        }

        // Validate file size
        if (file.size > maxSize) {
          throw new Error(`File size exceeds ${formatFileSize(maxSize)} limit.`)
        }

        // Read file content
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsText(file)
        })

        // Detect format
        const formatFromName = detectFormatFromFileName(file.name)
        const formatFromContent = detectFormatFromContent(content)
        const detectedFormat = formatFromName || formatFromContent

        onFileUpload(content, file.name, detectedFormat || undefined)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setIsProcessing(false)
      }
    },
    [onFileUpload, maxSize]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0])
      }
    },
    [processFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: disabled || isProcessing,
    accept: {
      'application/json': ['.json'],
      'application/xml': ['.xml'],
      'text/xml': ['.xml'],
      'text/csv': ['.csv'],
      'application/csv': ['.csv'],
      'text/plain': ['.txt'],
    },
  })

  const handleRemoveFile = () => {
    setError(null)
    onFileRemove()
  }

  if (uploadedFile && fileName) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Uploaded File
        </Typography>
        <FileInfo>
          <Box display="flex" alignItems="center" gap={1}>
            <AttachFileIcon color="primary" />
            <Typography variant="body1">{fileName}</Typography>
            <Chip
              label={formatFileSize(new Blob([uploadedFile]).size)}
              size="small"
              variant="outlined"
            />
          </Box>
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleRemoveFile}
            color="error"
            size="small"
            disabled={disabled}
          >
            Remove
          </Button>
        </FileInfo>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload File
      </Typography>
      
      <DropzoneContainer
        {...getRootProps()}
        isDragActive={isDragActive}
        hasError={!!error}
        elevation={0}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              Processing file...
            </Typography>
            <LinearProgress sx={{ mt: 2 }} />
          </Box>
        ) : (
          <Box>
            <CloudUploadIcon
              sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? 'Drop your file here'
                : 'Drag & drop a file here, or click to browse'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Supports JSON, XML, CSV, and TXT files up to {formatFileSize(maxSize)}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AttachFileIcon />}
              disabled={disabled}
            >
              Browse Files
            </Button>
          </Box>
        )}
      </DropzoneContainer>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}

export default FileUpload
