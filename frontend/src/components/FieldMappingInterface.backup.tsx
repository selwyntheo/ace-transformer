import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Visibility as PreviewIcon,
  Save as SaveIcon,
  Transform as TransformIcon,
  AccountTree as MappingIcon,
  Settings as SettingsIcon,
  AutoFixHigh as AutoMapIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import type { FormatType, FieldMapping } from '../services/api'

interface FieldMappingInterfaceProps {
  sourceFormat: FormatType | null
  targetFormat: FormatType | null
  sourceData: string | null
  onMappingChange: (mappings: FieldMapping[]) => void
  onPreview?: (mappings: FieldMapping[]) => void
  disabled?: boolean
}

interface SourceField {
  name: string
  type: string
  sample?: string
  path?: string
}

interface TargetField {
  name: string
  type: string
  required?: boolean
  description?: string
  defaultValue?: string
}

interface MappingRule extends FieldMapping {
  id: string
  validated?: boolean
  transformFunction?: string
}

const MappingContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}))

const FieldCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  cursor: 'grab',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.dragging': {
    opacity: 0.5,
  },
}))

const MappingRule = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
}))

const DropZone = styled(Box)(({ theme }) => ({
  minHeight: 60,
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: theme.palette.grey[50],
  transition: 'all 0.2s ease',
  '&.drag-over': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '20',
  },
}))

const FieldMappingInterface: React.FC<FieldMappingInterfaceProps> = ({
  sourceFormat,
  targetFormat,
  sourceData,
  onMappingChange,
  onPreview,
  disabled = false,
}) => {
  const [sourceFields, setSourceFields] = useState<SourceField[]>([])
  const [targetFields, setTargetFields] = useState<TargetField[]>([])
  const [mappings, setMappings] = useState<MappingRule[]>([])
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [configurationName, setConfigurationName] = useState('')
  const [autoDetectTypes, setAutoDetectTypes] = useState(true)
  const [selectedSourceField, setSelectedSourceField] = useState<SourceField | null>(null)
  const [hoveredTargetField, setHoveredTargetField] = useState<string | null>(null)
  const [draggedField, setDraggedField] = useState<SourceField | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info')

  // Extract fields from source data
  const extractSourceFields = useCallback((data: string, format: FormatType): SourceField[] => {
    try {
      switch (format) {
        case 'JSON':
          const jsonData = JSON.parse(data)
          return extractJsonFields(jsonData)
        case 'XML':
          return extractXmlFields(data)
        case 'CSV':
          return extractCsvFields(data)
        case 'TXT':
          return extractTxtFields(data)
        default:
          return []
      }
    } catch (error) {
      console.error('Error extracting source fields:', error)
      return []
    }
  }, [])

  // JSON field extraction
  const extractJsonFields = (obj: any, prefix = '', depth = 0): SourceField[] => {
    const fields: SourceField[] = []
    
    if (depth > 3) return fields // Prevent deep nesting
    
    Object.entries(obj).forEach(([key, value]) => {
      const fieldName = prefix ? `${prefix}.${key}` : key
      const fieldType = Array.isArray(value) ? 'array' : typeof value
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        fields.push({
          name: fieldName,
          type: 'object',
          path: fieldName,
        })
        fields.push(...extractJsonFields(value, fieldName, depth + 1))
      } else {
        fields.push({
          name: fieldName,
          type: fieldType,
          sample: String(value).substring(0, 50),
          path: fieldName,
        })
      }
    })
    
    return fields
  }

  // XML field extraction
  const extractXmlFields = (xmlData: string): SourceField[] => {
    const fields: SourceField[] = []
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlData, 'text/xml')
    
    const extractFromElement = (element: Element, prefix = '') => {
      const tagName = prefix ? `${prefix}.${element.tagName}` : element.tagName
      
      // Add attributes
      for (const attr of element.attributes) {
        fields.push({
          name: `${tagName}@${attr.name}`,
          type: 'string',
          sample: attr.value,
          path: `${tagName}@${attr.name}`,
        })
      }
      
      // Add text content if no children
      if (element.children.length === 0 && element.textContent?.trim()) {
        fields.push({
          name: tagName,
          type: 'string',
          sample: element.textContent.trim().substring(0, 50),
          path: tagName,
        })
      }
      
      // Process child elements
      for (const child of element.children) {
        extractFromElement(child, tagName)
      }
    }
    
    if (doc.documentElement) {
      extractFromElement(doc.documentElement)
    }
    
    return fields
  }

  // CSV field extraction
  const extractCsvFields = (csvData: string): SourceField[] => {
    const lines = csvData.split('\n').filter(line => line.trim())
    if (lines.length === 0) return []
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const sampleRow = lines[1]?.split(',').map(v => v.trim().replace(/"/g, ''))
    
    return headers.map((header, index) => ({
      name: header,
      type: autoDetectTypes ? detectDataType(sampleRow?.[index] || '') : 'string',
      sample: sampleRow?.[index]?.substring(0, 50),
      path: header,
    }))
  }

  // TXT field extraction (simple line-based)
  const extractTxtFields = (txtData: string): SourceField[] => {
    const lines = txtData.split('\n').filter(line => line.trim())
    return [
      {
        name: 'line',
        type: 'string',
        sample: lines[0]?.substring(0, 50),
        path: 'line',
      },
      {
        name: 'lineNumber',
        type: 'number',
        sample: '1',
        path: 'lineNumber',
      },
    ]
  }

  // Auto-detect data type
  const detectDataType = (value: string): string => {
    if (!value) return 'string'
    if (!isNaN(Number(value))) return 'number'
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') return 'boolean'
    if (Date.parse(value)) return 'date'
    return 'string'
  }

  // Generate default target fields based on target format
  const generateTargetFields = (format: FormatType): TargetField[] => {
    switch (format) {
      case 'JSON':
        return [
          { name: 'id', type: 'string', description: 'Unique identifier' },
          { name: 'name', type: 'string', description: 'Display name' },
          { name: 'value', type: 'string', description: 'Main value' },
          { name: 'metadata', type: 'object', description: 'Additional information' },
        ]
      case 'XML':
        return [
          { name: 'root', type: 'object', description: 'Root element' },
          { name: 'item', type: 'object', description: 'Item element' },
          { name: 'name', type: 'string', description: 'Name element' },
          { name: 'value', type: 'string', description: 'Value element' },
        ]
      case 'CSV':
        return [
          { name: 'Column1', type: 'string', description: 'First column' },
          { name: 'Column2', type: 'string', description: 'Second column' },
          { name: 'Column3', type: 'string', description: 'Third column' },
        ]
      case 'TXT':
        return [
          { name: 'output', type: 'string', description: 'Output text' },
        ]
      default:
        return []
    }
  }

  // Update fields when data changes
  useEffect(() => {
    if (sourceData && sourceFormat) {
      const fields = extractSourceFields(sourceData, sourceFormat)
      setSourceFields(fields)
    }
  }, [sourceData, sourceFormat, extractSourceFields])

  useEffect(() => {
    if (targetFormat) {
      const fields = generateTargetFields(targetFormat)
      setTargetFields(fields)
    }
  }, [targetFormat])

  // Handle field mapping
  const addMapping = (sourceField: SourceField, targetField: TargetField) => {
    // Check if mapping already exists
    const existingMapping = mappings.find(m => 
      m.sourceField === sourceField.name && m.targetField === targetField.name
    )
    
    if (existingMapping) {
      setSnackbarMessage(`Mapping already exists: ${sourceField.name} → ${targetField.name}`)
      setSnackbarSeverity('warning')
      setSnackbarOpen(true)
      return
    }
    
    const newMapping: MappingRule = {
      id: `${Date.now()}-${Math.random()}`,
      sourceField: sourceField.name,
      targetField: targetField.name,
      validated: true,
    }
    
    const newMappings = [...mappings, newMapping]
    setMappings(newMappings)
    onMappingChange(newMappings)
    
    setSnackbarMessage(`Created mapping: ${sourceField.name} → ${targetField.name}`)
    setSnackbarSeverity('success')
    setSnackbarOpen(true)
  }

  const removeMapping = (id: string) => {
    const mapping = mappings.find(m => m.id === id)
    const newMappings = mappings.filter(m => m.id !== id)
    setMappings(newMappings)
    onMappingChange(newMappings)
    
    if (mapping) {
      setSnackbarMessage(`Removed mapping: ${mapping.sourceField} → ${mapping.targetField}`)
      setSnackbarSeverity('info')
      setSnackbarOpen(true)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, field: SourceField) => {
    setDraggedField(field)
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', field.name)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDragEnter = (fieldName: string) => {
    setHoveredTargetField(fieldName)
  }

  const handleDragLeave = () => {
    setHoveredTargetField(null)
  }

  const handleDrop = (e: React.DragEvent, targetField: TargetField) => {
    e.preventDefault()
    setHoveredTargetField(null)
    
    if (draggedField) {
      addMapping(draggedField, targetField)
      setDraggedField(null)
    }
  }

  // Auto-mapping based on field names
  const autoMap = () => {
    console.log('AutoMap started')
    console.log('Source fields:', sourceFields.map(f => f.name))
    console.log('Target fields:', targetFields.map(f => f.name))
    
    if (sourceFields.length === 0) {
      setSnackbarMessage('No source fields available. Please upload data first.')
      setSnackbarSeverity('warning')
      setSnackbarOpen(true)
      return
    }
    
    if (targetFields.length === 0) {
      setSnackbarMessage('No target fields available. Please select a target format.')
      setSnackbarSeverity('warning')
      setSnackbarOpen(true)
      return
    }
    
    const newMappings: MappingRule[] = []
    
    sourceFields.forEach(sourceField => {
      const sourceName = sourceField.name.toLowerCase().trim()
      
      // Try exact match first
      let matchingTarget = targetFields.find(targetField => 
        targetField.name.toLowerCase().trim() === sourceName
      )
      
      // If no exact match, try partial matches
      if (!matchingTarget) {
        matchingTarget = targetFields.find(targetField => {
          const targetName = targetField.name.toLowerCase().trim()
          return targetName.includes(sourceName) || sourceName.includes(targetName)
        })
      }
      
      // If still no match, try common field mappings
      if (!matchingTarget) {
        const commonMappings: { [key: string]: string[] } = {
          'id': ['id', 'identifier', 'key', 'primary'],
          'name': ['name', 'title', 'label', 'description'],
          'value': ['value', 'amount', 'data', 'content'],
          'date': ['date', 'time', 'created', 'updated']
        }
        
        for (const [targetKey, sourceVariants] of Object.entries(commonMappings)) {
          if (sourceVariants.some(variant => sourceName.includes(variant))) {
            matchingTarget = targetFields.find(tf => tf.name.toLowerCase().includes(targetKey))
            if (matchingTarget) break
          }
        }
      }
      
      console.log(`Source field "${sourceField.name}":`, matchingTarget ? `matched with "${matchingTarget.name}"` : 'no match found')
      
      if (matchingTarget) {
        newMappings.push({
          id: `${Date.now()}-${Math.random()}`,
          sourceField: sourceField.name,
          targetField: matchingTarget.name,
          validated: true,
        })
      }
    })
    
    console.log('New mappings created:', newMappings)
    
    if (newMappings.length === 0) {
      setSnackbarMessage('No automatic mappings could be created. Field names do not match common patterns.')
      setSnackbarSeverity('warning')
      setSnackbarOpen(true)
    } else {
      setSnackbarMessage(`Successfully created ${newMappings.length} automatic mapping${newMappings.length > 1 ? 's' : ''}`)
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    }
    
    setMappings(newMappings)
    onMappingChange(newMappings)
  }

  // Add custom target field
  const addTargetField = () => {
    const newField: TargetField = {
      name: `CustomField${targetFields.length + 1}`,
      type: 'string',
      description: 'Custom field',
    }
    setTargetFields(prev => [...prev, newField])
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" gutterBottom>
            <MappingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Advanced Field Mapping
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Map fields from your source data to the target format structure. 
            Click a source field to select it, then click a target field to create a mapping.
            {selectedSourceField && (
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                <br />
                Selected: "{selectedSourceField.name}" - Click a target field to map it.
              </Box>
            )}
          </Typography>
        </Box>
      </Box>

      {/* Configuration Header */}
      <MappingContainer elevation={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            size="small"
            label="Configuration Name"
            value={configurationName}
            onChange={(e) => setConfigurationName(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <Box display="flex" gap={1}>
            <Button
              startIcon={<AutoMapIcon />}
              onClick={autoMap}
              variant="outlined"
              size="small"
              disabled={disabled || sourceFields.length === 0}
            >
              Auto Map
            </Button>
            <Button
              startIcon={<PreviewIcon />}
              onClick={() => setPreviewDialogOpen(true)}
              variant="outlined"
              size="small"
              disabled={disabled || mappings.length === 0}
            >
              Preview
            </Button>
            <Button
              startIcon={<SaveIcon />}
              variant="outlined"
              size="small"
              disabled={disabled || !configurationName}
            >
              Save Config
            </Button>
          </Box>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={autoDetectTypes}
              onChange={(e) => setAutoDetectTypes(e.target.checked)}
            />
          }
          label="Auto-detect field types"
        />
      </MappingContainer>

      {/* Single Unified Mapping Panel */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          <MappingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Field Mapping Configuration
        </Typography>
        
        {sourceFields.length === 0 || targetFields.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            {!sourceData ? 'Upload source data to detect fields.' : 
             sourceFields.length === 0 ? 'No source fields detected. Try uploading a different file.' :
             'Select a target format to see available target fields.'}
          </Alert>
        ) : (
          <Box>
            {/* Field Mapping Interface */}
            <Box display="flex" gap={3} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
              {/* Source Fields Column */}
              <Box flex={1}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                    Source Fields ({sourceFormat})
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {sourceFields.length} fields detected
                  </Typography>
                  
                  <Box sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                    {sourceFields.map((field, index) => {
                      const isSelected = selectedSourceField?.name === field.name
                      const mappedTargets = mappings.filter(m => m.sourceField === field.name)
                      const isAlreadyMapped = mappedTargets.length > 0
                      
                      return (
                        <FieldCard 
                          key={index} 
                          variant="outlined"
                          onClick={() => setSelectedSourceField(isSelected ? null : field)}
                          sx={{ 
                            cursor: 'pointer',
                            bgcolor: isSelected ? 'primary.light' : 'inherit',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            position: 'relative',
                            mb: 1,
                            '&:hover': { 
                              bgcolor: isSelected ? 'primary.main' : 'action.hover',
                              borderColor: isSelected ? 'primary.main' : 'divider'
                            }
                          }}
                        >
                          {/* Connection Indicator */}
                          {isAlreadyMapped && (
                            <Box
                              sx={{
                                position: 'absolute',
                                right: -6,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: 'grey.400',
                                border: '2px solid white',
                                boxShadow: 1,
                                zIndex: 1,
                              }}
                            />
                          )}

                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Box flex={1}>
                                <Typography variant="subtitle2" noWrap>
                                  {field.name}
                                  {isSelected && (
                                    <Chip
                                      label="Selected"
                                      size="small"
                                      color="primary"
                                      variant="filled"
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </Typography>
                                <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                                  <Chip
                                    label={field.type}
                                    size="small"
                                    variant="outlined"
                                    color="default"
                                  />
                                  {field.sample && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ 
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: 100
                                      }}
                                    >
                                      "{field.sample}"
                                    </Typography>
                                  )}
                                </Box>
                                {/* Show mapped targets */}
                                {mappedTargets.length > 0 && (
                                  <Box mt={0.5}>
                                    {mappedTargets.map((mapping, idx) => (
                                      <Chip
                                        key={idx}
                                        label={`→ ${mapping.targetField}`}
                                        size="small"
                                        variant="outlined"
                                        color="default"
                                        sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </Box>
                              <Box display="flex" alignItems="center">
                                <Typography
                                  variant="caption"
                                  color={isAlreadyMapped ? 'text.primary' : 'text.disabled'}
                                  sx={{ mr: 1 }}
                                >
                                  {mappedTargets.length}
                                </Typography>
                                <DragIcon color="action" />
                              </Box>
                            </Box>
                          </CardContent>
                        </FieldCard>
                      )
                    })}
                  </Box>
                </Box>
              </Box>

              {/* Mapping Rules Column */}
              <Box flex={1}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom color="secondary" sx={{ fontWeight: 'bold' }}>
                    Field Mappings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {mappings.length} mapping{mappings.length !== 1 ? 's' : ''} configured
                  </Typography>
                  
                  {mappings.length === 0 ? (
                    <DropZone sx={{ minHeight: 200, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography color="text.secondary" variant="body2" textAlign="center">
                        No mappings created yet.
                        <br />
                        {selectedSourceField ? 
                          `Click a target field to map "${selectedSourceField.name}"` :
                          'Select a source field first, then click a target field'
                        }
                      </Typography>
                    </DropZone>
                  ) : (
                    <Box sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                      {mappings.map((mapping) => (
                        <Box
                          key={mapping.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1.5,
                            mb: 1,
                            bgcolor: 'action.hover',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          {/* Source Field */}
                          <Box
                            sx={{
                              flex: 1,
                              p: 1,
                              borderRadius: 1,
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="body2" fontWeight="medium" noWrap>
                              {mapping.sourceField}
                            </Typography>
                          </Box>

                          {/* Arrow */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mx: 1,
                              minWidth: 40,
                            }}
                          >
                            <Box
                              sx={{
                                width: 20,
                                height: 2,
                                bgcolor: 'primary.main',
                                borderRadius: 1,
                              }}
                            />
                            <ArrowIcon
                              sx={{
                                color: 'primary.main',
                                fontSize: 16,
                                ml: -0.5,
                              }}
                            />
                          </Box>

                          {/* Target Field */}
                          <Box
                            sx={{
                              flex: 1,
                              p: 1,
                              borderRadius: 1,
                              bgcolor: 'success.light',
                              color: 'success.contrastText',
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="body2" fontWeight="medium" noWrap>
                              {mapping.targetField}
                            </Typography>
                          </Box>

                          {/* Transformation Rule Badge */}
                          {mapping.transformationRule && (
                            <Chip
                              label={mapping.transformationRule}
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}

                          {/* Delete Button */}
                          <IconButton
                            size="small"
                            onClick={() => removeMapping(mapping.id)}
                            disabled={disabled}
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Target Fields Column */}
              <Box flex={1}>
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: 'bold' }}>
                      Target Fields ({targetFormat})
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={addTargetField}
                      disabled={disabled}
                      title="Add custom field"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {targetFields.length} fields available
                  </Typography>
                  
                  <Box sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                    {targetFields.map((field, index) => {
                      const mappedSources = mappings.filter(m => m.targetField === field.name)
                      const isAlreadyMapped = mappedSources.length > 0
                      const canMap = selectedSourceField && !disabled
                      
                      return (
                        <FieldCard 
                          key={index} 
                          variant="outlined"
                          onClick={() => {
                            if (selectedSourceField) {
                              addMapping(selectedSourceField, field)
                              setSelectedSourceField(null)
                            }
                          }}
                          sx={{ 
                            cursor: canMap ? 'pointer' : 'default',
                            bgcolor: 'inherit',
                            borderColor: 'divider',
                            position: 'relative',
                            mb: 1,
                            '&:hover': { 
                              bgcolor: canMap ? 'action.hover' : 'inherit',
                              borderColor: canMap ? 'divider' : 'divider'
                            }
                          }}
                        >
                          {/* Connection Indicator */}
                          {isAlreadyMapped && (
                            <Box
                              sx={{
                                position: 'absolute',
                                left: -6,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: 'grey.400',
                                border: '2px solid white',
                                boxShadow: 1,
                                zIndex: 1,
                              }}
                            />
                          )}

                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Box display="flex" alignItems="center">
                                <DragIcon color="action" />
                                <Typography
                                  variant="caption"
                                  color={isAlreadyMapped ? 'text.primary' : 'text.disabled'}
                                  sx={{ mr: 1 }}
                                >
                                  {mappedSources.length}
                                </Typography>
                              </Box>
                              <Box flex={1} textAlign="right">
                                <Typography variant="subtitle2" noWrap>
                                  {field.name}
                                  {field.required && (
                                    <Chip
                                      label="Required"
                                      size="small"
                                      color="error"
                                      variant="outlined"
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </Typography>
                                <Box display="flex" gap={1} alignItems="center" justifyContent="flex-end" mt={0.5}>
                                  <Chip
                                    label={field.type}
                                    size="small"
                                    variant="outlined"
                                    color="default"
                                  />
                                  {field.description && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ 
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: 100
                                      }}
                                    >
                                      {field.description}
                                    </Typography>
                                  )}
                                </Box>
                                {/* Show mapped sources */}
                                {mappedSources.length > 0 && (
                                  <Box mt={0.5} textAlign="right">
                                    {mappedSources.map((mapping, idx) => (
                                      <Chip
                                        key={idx}
                                        label={`${mapping.sourceField} →`}
                                        size="small"
                                        variant="outlined"
                                        color="default"
                                        sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </CardContent>
                        </FieldCard>
                      )
                    })}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Mapping Preview</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Preview of field mappings for {sourceFormat} → {targetFormat} transformation:
          </Typography>
          <List>
            {mappings.map((mapping) => (
              <ListItem key={mapping.id}>
                <ListItemIcon>
                  <TransformIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={`${mapping.sourceField} → ${mapping.targetField}`}
                  secondary={mapping.transformationRule || 'Direct mapping'}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          {onPreview && (
            <Button
              variant="contained"
              onClick={() => {
                onPreview?.(mappings)
                setPreviewDialogOpen(false)
              }}
            >
              Apply Preview
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default FieldMappingInterface
