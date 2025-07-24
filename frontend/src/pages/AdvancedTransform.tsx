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
  Chip,
} from '@mui/material'
import {
  Transform as TransformIcon,
  Refresh as RefreshIcon,
  Science as AdvancedIcon,
} from '@mui/icons-material'
import type { FormatType, FieldMapping } from '../services/api'
import TransformationService from '../services/api'
import FormatSelector from '../components/FormatSelector'
import FileUpload from '../components/FileUpload'
import TransformationResult from '../components/TransformationResult'
import FieldMappingInterface from '../components/FieldMappingInterface'
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
  fieldMappings: FieldMapping[]
}

const AdvancedTransform: React.FC = () => {
  const [state, setState] = useState<TransformationState>({
    sourceFormat: null,
    targetFormat: null,
    sourceData: null,
    fileName: null,
    result: null,
    processingTime: null,
    error: null,
    isLoading: false,
    fieldMappings: [],
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

  const handleMappingChange = (mappings: FieldMapping[]) => {
    console.log('Field mappings changed:', mappings)
    setState(prev => ({
      ...prev,
      fieldMappings: mappings,
      error: null,
    }))
  }

  const handleLoadSampleData = (format: FormatType) => {
    const sampleData = generateSampleData(format)
    handleFileUpload(sampleData, `sample.${format.toLowerCase()}`, format)
  }

  const canTransformAdvanced = 
    state.sourceFormat &&
    state.targetFormat && 
    state.sourceData && 
    state.fieldMappings.length > 0 &&
    !state.isLoading

  const handleAdvancedTransform = async () => {
    if (!canTransformAdvanced) {
      console.log('Cannot transform - requirements not met:', {
        sourceFormat: state.sourceFormat,
        targetFormat: state.targetFormat,
        hasSourceData: !!state.sourceData,
        mappingsCount: state.fieldMappings.length,
        isLoading: state.isLoading
      })
      return
    }

    console.log('Starting transformation with:', {
      sourceFormat: state.sourceFormat,
      targetFormat: state.targetFormat,
      mappings: state.fieldMappings,
      dataLength: state.sourceData?.length
    })

    setState(prev => ({ ...prev, isLoading: true, error: null, result: null }))

    try {
      const response = await TransformationService.advancedTransform({
        inputData: state.sourceData!,
        sourceFormat: state.sourceFormat!,
        targetFormat: state.targetFormat!,
        mappingRules: state.fieldMappings,
      })

      console.log('Transformation successful:', response)

      setState(prev => ({
        ...prev,
        result: response.outputData,
        processingTime: response.processingTimeMs,
        isLoading: false,
      }))
    } catch (error) {
      console.error('Transformation failed:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Advanced transformation failed',
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
      fieldMappings: [],
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

  const handlePreviewMapping = (mappings: FieldMapping[]) => {
    // This could show a preview of how the data would look with these mappings
    console.log('Preview mappings:', mappings)
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Container maxWidth={false} disableGutters sx={{ px: 3, py: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            <AdvancedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Advanced Transform
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Transform data with advanced field-level mapping and custom rules
          </Typography>
        </Box>

        {/* Two Panel Layout */}
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '320px 1fr' }} gap={3}>
          {/* Left Panel - Configuration */}
          <Box>
            {/* Format Selection */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Format Selection
              </Typography>
              <Box display="grid" gridTemplateColumns="1fr" gap={2}>
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
          <Paper sx={{ p: 3, mb: 3 }}>
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

          {/* Status Display */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {!state.sourceFormat && (
                <Chip
                  label="Select a source format to begin"
                  color="default"
                  variant="outlined"
                  size="small"
                />
              )}
              {state.sourceFormat && !state.targetFormat && (
                <Chip
                  label="Select a target format"
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              {state.sourceFormat && state.targetFormat && !state.sourceData && (
                <Chip
                  label="Upload a file or load sample data"
                  color="secondary"
                  variant="outlined"
                  size="small"
                />
              )}
              {state.sourceFormat && state.targetFormat && state.sourceData && state.fieldMappings.length === 0 && (
                <Chip
                  label="Configure field mappings for transformation"
                  color="warning"
                  variant="filled"
                  size="small"
                />
              )}
              {canTransformAdvanced && !state.result && (
                <Chip
                  label={`Ready for transformation with ${state.fieldMappings.length} field mappings`}
                  color="success"
                  variant="filled"
                  size="small"
                />
              )}
            </Box>
          </Paper>
        </Box>

        {/* Right Panel - Field Mapping Interface */}
        <Box>
          {state.sourceData && state.sourceFormat && state.targetFormat ? (
            <Paper sx={{ p: 3, mb: 3 }}>
              <FieldMappingInterface
                sourceFormat={state.sourceFormat}
                targetFormat={state.targetFormat}
                sourceData={state.sourceData}
                onMappingChange={handleMappingChange}
                onPreview={handlePreviewMapping}
                disabled={state.isLoading}
              />
            </Paper>
          ) : (
            <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
              <Box py={8}>
                <AdvancedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Field Mapping Interface
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select formats and upload data to configure field mappings
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Transform Controls */}
          {state.sourceData && state.sourceFormat && state.targetFormat && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Transform
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={state.isLoading ? <CircularProgress size={20} /> : <TransformIcon />}
                  onClick={handleAdvancedTransform}
                  disabled={!canTransformAdvanced}
                  sx={{ flex: 1 }}
                >
                  {state.isLoading ? 'Transforming...' : 'Advanced Transform'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                  disabled={state.isLoading}
                >
                  Reset
                </Button>
              </Box>
              
              {/* Status Display */}
              <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                {state.fieldMappings.length === 0 && (
                  <Chip
                    label="Configure field mappings for transformation"
                    color="warning"
                    variant="filled"
                    size="small"
                  />
                )}
                {canTransformAdvanced && !state.result && (
                  <Chip
                    label={`Ready for transformation with ${state.fieldMappings.length} field mappings`}
                    color="success"
                    variant="filled"
                    size="small"
                  />
                )}
                {state.isLoading && (
                  <Chip
                    label="Transformation in progress..."
                    color="primary"
                    variant="filled"
                    size="small"
                  />
                )}
              </Box>
            </Paper>
          )}

          {/* Transformation Result */}
          {state.result && (
            <TransformationResult
              result={state.result}
              targetFormat={state.targetFormat}
              fileName={state.fileName || 'transformed_data'}
              processingTime={state.processingTime || undefined}
              onClear={handleClearResult}
            />
          )}
        </Box>
      </Box>

      {/* Error Display */}
      {state.error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {state.error}
        </Alert>
      )}
      </Container>
    </Box>
  )
}

export default AdvancedTransform
