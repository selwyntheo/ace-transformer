import React, { useState } from 'react'
import {
  Box,
  Container,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Typography,
  Divider,
  Stack,
} from '@mui/material'
import {
  Transform as TransformIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import type { FormatType } from '../services/api'
import TransformationService from '../services/api'
import FormatSelector from '../components/FormatSelector'
import FileUpload from '../components/FileUpload'
import TransformationResult from '../components/TransformationResult'
import { SUPPORTED_FORMATS, generateSampleData } from '../utils/formatUtils'

interface TransformationState {
  sourceFormat: FormatType | null
  targetFormat: FormatType | null
  sourceData: string | null
  fileName: string | null
  result: string | null
  processingTime: number | null
  error: string | null
  isLoading: boolean
}

const QuickTransform: React.FC = () => {
  const [state, setState] = useState<TransformationState>({
    sourceFormat: null,
    targetFormat: null,
    sourceData: null,
    fileName: null,
    result: null,
    processingTime: null,
    error: null,
    isLoading: false,
  })

  const handleSourceFormatSelect = (format: FormatType) => {
    setState(prev => ({
      ...prev,
      sourceFormat: format,
      error: null,
    }))
  }

  const handleTargetFormatSelect = (format: FormatType) => {
    setState(prev => ({
      ...prev,
      targetFormat: format,
      error: null,
    }))
  }

  const handleFileUpload = (content: string, fileName: string, detectedFormat?: FormatType) => {
    setState(prev => ({
      ...prev,
      sourceData: content,
      fileName,
      sourceFormat: detectedFormat || prev.sourceFormat,
      result: null,
      error: null,
    }))
  }

  const handleFileRemove = () => {
    setState(prev => ({
      ...prev,
      sourceData: null,
      fileName: null,
      result: null,
      error: null,
    }))
  }

  const handleLoadSampleData = (format: FormatType) => {
    const sampleData = generateSampleData(format)
    handleFileUpload(sampleData, `sample.${format.toLowerCase()}`, format)
  }

  const canTransform = 
    state.sourceFormat && 
    state.targetFormat && 
    state.sourceData && 
    !state.isLoading

  const handleTransform = async () => {
    if (!canTransform) return

    setState(prev => ({ ...prev, isLoading: true, error: null, result: null }))

    try {
      const response = await TransformationService.transform({
        inputData: state.sourceData!,
        sourceFormat: state.sourceFormat!,
        targetFormat: state.targetFormat!,
      })

      setState(prev => ({
        ...prev,
        result: response.transformedData,
        processingTime: response.processingTimeMs,
        isLoading: false,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Transformation failed',
        isLoading: false,
      }))
    }
  }

  const handleReset = () => {
    setState({
      sourceFormat: null,
      targetFormat: null,
      sourceData: null,
      fileName: null,
      result: null,
      processingTime: null,
      error: null,
      isLoading: false,
    })
  }

  const handleClearResult = () => {
    setState(prev => ({
      ...prev,
      result: null,
      processingTime: null,
      error: null,
    }))
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quick Transform
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Transform data between different formats quickly and easily
        </Typography>
      </Box>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={4}>
        {/* Format Selection */}
        <Paper sx={{ p: 3, height: 'fit-content' }}>
          <Typography variant="h6" gutterBottom>
            Format Selection
          </Typography>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <FormatSelector
              formats={SUPPORTED_FORMATS}
              selectedFormat={state.sourceFormat}
              onFormatSelect={handleSourceFormatSelect}
              title="Source Format"
              disabled={state.isLoading}
            />
            <FormatSelector
              formats={SUPPORTED_FORMATS}
              selectedFormat={state.targetFormat}
              onFormatSelect={handleTargetFormatSelect}
              title="Target Format"
              disabled={state.isLoading}
            />
          </Box>
        </Paper>

        {/* File Upload */}
        <Paper sx={{ p: 3 }}>
          <FileUpload
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
            uploadedFile={state.sourceData}
            fileName={state.fileName}
            disabled={state.isLoading}
          />
          
          {/* Sample Data Section */}
          <Box mt={3}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Or try with sample data:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {SUPPORTED_FORMATS.map(format => (
                <Button
                  key={format}
                  size="small"
                  variant="outlined"
                  onClick={() => handleLoadSampleData(format)}
                  disabled={state.isLoading}
                >
                  {format} Sample
                </Button>
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Transformation Result */}
        <TransformationResult
          result={state.result}
          targetFormat={state.targetFormat}
          fileName={state.fileName || 'transformed_data'}
          processingTime={state.processingTime || undefined}
          onClear={handleClearResult}
        />
      </Box>

      {/* Transform Controls */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Box display="flex" justifyContent="center" gap={2} alignItems="center">
          <Button
            variant="contained"
            size="large"
            startIcon={state.isLoading ? <CircularProgress size={20} /> : <TransformIcon />}
            onClick={handleTransform}
            disabled={!canTransform}
            sx={{ minWidth: 200 }}
          >
            {state.isLoading ? 'Transforming...' : 'Transform Data'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={state.isLoading}
          >
            Reset
          </Button>
        </Box>

        {/* Status Display */}
        <Box mt={2} display="flex" justifyContent="center">
          {!state.sourceFormat && (
            <Typography variant="body2" color="text.secondary">
              Select a source format to begin
            </Typography>
          )}
          {state.sourceFormat && !state.targetFormat && (
            <Typography variant="body2" color="text.secondary">
              Select a target format
            </Typography>
          )}
          {state.sourceFormat && state.targetFormat && !state.sourceData && (
            <Typography variant="body2" color="text.secondary">
              Upload a file or load sample data
            </Typography>
          )}
          {canTransform && !state.result && (
            <Typography variant="body2" color="success.main">
              Ready to transform {state.sourceFormat} → {state.targetFormat}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Error Display */}
      {state.error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {state.error}
        </Alert>
      )}
    </Container>
  )
}

export default QuickTransform
