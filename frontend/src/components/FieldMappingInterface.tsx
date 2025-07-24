import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  DataObject as DataObjectIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  AutoFixHigh as AutoFixHighIcon,
  Clear as ClearIcon,
  Preview as PreviewIcon,
  Transform as TransformIcon,
  DragIndicator as DragIndicatorIcon,
  Add as AddIcon,
  List as ListIcon,
} from '@mui/icons-material'
import type { FormatType, FieldMapping } from '../services/api'

interface SourceField {
  name: string
  type: string
  sample?: string
  path: string
  isArrayItem?: boolean
  arrayLength?: number
}

interface TargetField {
  name: string
  type: string
  required?: boolean
  description?: string
}

interface FieldMappingInterfaceProps {
  sourceFormat: FormatType | null
  targetFormat: FormatType | null
  sourceData: string | null
  onMappingChange: (mappings: FieldMapping[]) => void
  onPreview?: (mappings: FieldMapping[]) => void
  disabled?: boolean
}

const FieldMappingInterface: React.FC<FieldMappingInterfaceProps> = ({
  sourceFormat,
  targetFormat,
  sourceData,
  onMappingChange,
  onPreview,
}) => {
  const [sourceFields, setSourceFields] = useState<SourceField[]>([])
  const [targetFields, setTargetFields] = useState<TargetField[]>([])
  const [mappings, setMappings] = useState<FieldMapping[]>([])
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [hoveredTargetField, setHoveredTargetField] = useState<string | null>(null)
  const [draggedField, setDraggedField] = useState<SourceField | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info')
  const [addFieldDialogOpen, setAddFieldDialogOpen] = useState(false)
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldType, setNewFieldType] = useState('string')
  const [newFieldDescription, setNewFieldDescription] = useState('')
  const [newFieldRequired, setNewFieldRequired] = useState(false)

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

  // JSON field extraction with improved array handling
  const extractJsonFields = (obj: any, prefix = '', depth = 0): SourceField[] => {
    const fields: SourceField[] = []
    
    if (depth > 5) return fields // Prevent deep nesting
    
    Object.entries(obj).forEach(([key, value]) => {
      const fieldName = prefix ? `${prefix}.${key}` : key
      
      if (Array.isArray(value)) {
        // Handle arrays
        fields.push({
          name: fieldName,
          type: 'array',
          sample: `Array[${value.length}]`,
          path: fieldName,
          isArrayItem: false,
          arrayLength: value.length,
        })
        
        // If array has objects, extract fields from first item
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
          const arrayItemFields = extractJsonFields(value[0], `${fieldName}[*]`, depth + 1)
          arrayItemFields.forEach(field => {
            fields.push({
              ...field,
              isArrayItem: true,
              name: field.name.replace(`${fieldName}[*].`, `${fieldName}[].`),
              path: field.path.replace(`${fieldName}[*].`, `${fieldName}[].`),
            })
          })
        } else if (value.length > 0) {
          // Array of primitives
          fields.push({
            name: `${fieldName}[]`,
            type: typeof value[0],
            sample: String(value[0]).substring(0, 50),
            path: `${fieldName}[]`,
            isArrayItem: true,
            arrayLength: value.length,
          })
        }
      } else if (typeof value === 'object' && value !== null) {
        // Handle objects
        fields.push({
          name: fieldName,
          type: 'object',
          path: fieldName,
          sample: 'Object',
        })
        fields.push(...extractJsonFields(value, fieldName, depth + 1))
      } else {
        // Handle primitives
        fields.push({
          name: fieldName,
          type: typeof value,
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
      type: detectDataType(sampleRow?.[index] || ''),
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
        name: 'content',
        type: 'string',
        sample: txtData.substring(0, 50),
        path: 'content',
      }
    ]
  }

  // Detect data type from sample value
  const detectDataType = (value: string): string => {
    if (!value || value.trim() === '') return 'string'
    
    // Check for number
    if (!isNaN(Number(value))) {
      return value.includes('.') ? 'number' : 'integer'
    }
    
    // Check for boolean
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
      return 'boolean'
    }
    
    // Check for date
    if (!isNaN(Date.parse(value))) {
      return 'date'
    }
    
    return 'string'
  }

  // Get initial target fields based on format (now as starting point, not fixed)
  const getInitialTargetFields = useCallback((format: FormatType): TargetField[] => {
    switch (format) {
      case 'JSON':
        return [
          { name: 'name', type: 'string', required: true, description: 'Full name of the user' },
          { name: 'email', type: 'string', required: true, description: 'Email address' },
          { name: 'profile', type: 'object', required: false, description: 'User profile information' },
        ]
      case 'XML':
        return [
          { name: 'root', type: 'element', required: true, description: 'Root element' },
          { name: 'item', type: 'element', description: 'Item element' },
          { name: 'value', type: 'text', description: 'Text content' },
          { name: 'attribute', type: 'attribute', description: 'XML attribute' },
        ]
      case 'CSV':
        return [
          { name: 'column1', type: 'string', description: 'First column' },
          { name: 'column2', type: 'string', description: 'Second column' },
          { name: 'column3', type: 'string', description: 'Third column' },
          { name: 'column4', type: 'string', description: 'Fourth column' },
        ]
      case 'TXT':
        return [
          { name: 'line', type: 'string', description: 'Single line' },
          { name: 'paragraph', type: 'string', description: 'Text paragraph' },
        ]
      default:
        return []
    }
  }, [])

  // Add new target field
  const addNewTargetField = () => {
    if (!newFieldName.trim()) {
      setSnackbarMessage('Field name is required')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return
    }

    // Check if field already exists
    if (targetFields.find(f => f.name === newFieldName.trim())) {
      setSnackbarMessage('Field with this name already exists')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return
    }

    const newField: TargetField = {
      name: newFieldName.trim(),
      type: newFieldType,
      required: newFieldRequired,
      description: newFieldDescription.trim() || undefined,
    }

    setTargetFields(prev => [...prev, newField])
    setSnackbarMessage(`Added new target field: ${newField.name}`)
    setSnackbarSeverity('success')
    setSnackbarOpen(true)
    
    // Reset form
    setNewFieldName('')
    setNewFieldType('string')
    setNewFieldDescription('')
    setNewFieldRequired(false)
    setAddFieldDialogOpen(false)
  }

  // Remove target field
  const removeTargetField = (fieldName: string) => {
    // Remove field from target fields
    setTargetFields(prev => prev.filter(f => f.name !== fieldName))
    
    // Remove any mappings that use this target field
    const newMappings = mappings.filter(m => m.targetField !== fieldName)
    if (newMappings.length !== mappings.length) {
      setMappings(newMappings)
      onMappingChange(newMappings)
    }
    
    setSnackbarMessage(`Removed target field: ${fieldName}`)
    setSnackbarSeverity('info')
    setSnackbarOpen(true)
  }

  // Update fields when data changes
  useEffect(() => {
    if (sourceData && sourceFormat) {
      const fields = extractSourceFields(sourceData, sourceFormat)
      setSourceFields(fields)
    } else {
      setSourceFields([])
    }
  }, [sourceData, sourceFormat, extractSourceFields])

  useEffect(() => {
    if (targetFormat) {
      const fields = getInitialTargetFields(targetFormat)
      setTargetFields(fields)
    } else {
      setTargetFields([])
    }
  }, [targetFormat, getInitialTargetFields])

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
    
    const newMapping: FieldMapping = {
      sourceField: sourceField.name,
      targetField: targetField.name,
      transformationRule: undefined,
    }
    
    const newMappings = [...mappings, newMapping]
    setMappings(newMappings)
    onMappingChange(newMappings)
    
    setSnackbarMessage(`Created mapping: ${sourceField.name} → ${targetField.name}`)
    setSnackbarSeverity('success')
    setSnackbarOpen(true)
  }

  const removeMapping = (sourceField: string, targetField: string) => {
    const newMappings = mappings.filter(m => 
      !(m.sourceField === sourceField && m.targetField === targetField)
    )
    setMappings(newMappings)
    onMappingChange(newMappings)
    
    setSnackbarMessage(`Removed mapping: ${sourceField} → ${targetField}`)
    setSnackbarSeverity('info')
    setSnackbarOpen(true)
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

  // Auto-mapping functionality
  const performAutoMapping = () => {
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
    
    const newMappings: FieldMapping[] = []
    
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
          'timestamp': ['date', 'time', 'created', 'updated']
        }
        
        for (const [targetKey, sourceVariants] of Object.entries(commonMappings)) {
          if (sourceVariants.some(variant => sourceName.includes(variant))) {
            matchingTarget = targetFields.find(tf => tf.name.toLowerCase().includes(targetKey))
            if (matchingTarget) break
          }
        }
      }
      
      if (matchingTarget) {
        // Check if mapping already exists
        const existingMapping = mappings.find(m => 
          m.sourceField === sourceField.name && m.targetField === matchingTarget!.name
        )
        
        if (!existingMapping) {
          newMappings.push({
            sourceField: sourceField.name,
            targetField: matchingTarget.name,
            transformationRule: undefined,
          })
        }
      }
    })
    
    if (newMappings.length > 0) {
      const allMappings = [...mappings, ...newMappings]
      setMappings(allMappings)
      onMappingChange(allMappings)
      setSnackbarMessage(`Auto-mapped ${newMappings.length} field(s)`)
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } else {
      setSnackbarMessage('No automatic mappings could be created')
      setSnackbarSeverity('info')
      setSnackbarOpen(true)
    }
  }

  const clearAllMappings = () => {
    setMappings([])
    onMappingChange([])
    setSnackbarMessage('All mappings cleared')
    setSnackbarSeverity('info')
    setSnackbarOpen(true)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Field Mapping Configuration
      </Typography>
      
      {/* Auto-mapping controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          onClick={performAutoMapping}
          disabled={sourceFields.length === 0 || targetFields.length === 0}
          startIcon={<AutoFixHighIcon />}
        >
          Auto Map Fields
        </Button>
        <Button
          variant="outlined"
          onClick={clearAllMappings}
          disabled={mappings.length === 0}
          startIcon={<ClearIcon />}
          color="error"
        >
          Clear All Mappings
        </Button>
        <Button
          variant="outlined"
          onClick={() => setPreviewDialogOpen(true)}
          disabled={mappings.length === 0}
          startIcon={<PreviewIcon />}
        >
          Preview Mappings
        </Button>
        <Typography variant="body2" color="text.secondary">
          {mappings.length} field mapping(s) configured
        </Typography>
      </Box>

      {/* Source and Target Fields Layout */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        {/* Source Fields */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2, height: '400px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DataObjectIcon />
              Source Fields ({sourceFields.length})
            </Typography>
            {sourceFields.length === 0 ? (
              <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No source fields available. Upload a file to see source fields.
              </Typography>
            ) : (
              <List dense>
                {sourceFields.map((field) => (
                  <ListItem
                    key={field.name}
                    draggable
                    onDragStart={(e) => handleDragStart(e, field)}
                    sx={{ 
                      cursor: 'grab',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: draggedField?.name === field.name ? 'action.selected' : 'background.paper',
                      pl: field.isArrayItem ? 3 : 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'translateX(4px)',
                        transition: 'all 0.2s ease'
                      },
                      '&:active': {
                        cursor: 'grabbing'
                      }
                    }}
                  >
                    <ListItemIcon>
                      {field.type === 'array' ? <ListIcon /> : 
                       field.isArrayItem ? <DataObjectIcon fontSize="small" /> : 
                       <DragIndicatorIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {field.name}
                          {field.isArrayItem && (
                            <Chip
                              size="small"
                              label="Array Item"
                              color="info"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                          {field.arrayLength && (
                            <Chip
                              size="small"
                              label={`[${field.arrayLength}]`}
                              color="primary"
                              variant="filled"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            {field.type}
                          </Typography>
                          {field.sample && (
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                              Sample: {field.sample}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Chip
                      size="small"
                      label={field.type}
                      color="primary"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>

        {/* Target Fields */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2, height: '400px', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DataObjectIcon />
                Target Fields ({targetFields.length})
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setAddFieldDialogOpen(true)}
                disabled={!targetFormat}
              >
                Add Field
              </Button>
            </Box>
            {targetFields.length === 0 ? (
              <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No target fields available. Select a format to see target fields.
              </Typography>
            ) : (
              <List dense>
                {targetFields.map((field) => (
                  <ListItem
                    key={field.name}
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleDragEnter(field.name)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, field)}
                    sx={{ 
                      border: '2px solid',
                      borderColor: hoveredTargetField === field.name ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: hoveredTargetField === field.name ? 'primary.light' : 'background.paper',
                      transition: 'all 0.2s ease',
                      minHeight: '56px',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <ListItemIcon>
                      <DataObjectIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {field.name}
                          {field.required && (
                            <Chip
                              size="small"
                              label="Required"
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={field.description || field.type}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        label={field.type}
                        color="secondary"
                        variant="outlined"
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeTargetField(field.name)}
                        color="error"
                        sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Field Mappings Section - Below Source and Target Fields */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinkIcon />
          Field Mappings ({mappings.length})
        </Typography>
        
        {mappings.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No field mappings configured. Drag source fields to target fields or use Auto Map.
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ p: 2 }}>
            <List>
              {mappings.map((mapping, index) => (
                <ListItem key={`${mapping.sourceField}-${mapping.targetField}-${index}`} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                  <ListItemIcon>
                    <LinkIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${mapping.sourceField} → ${mapping.targetField}`}
                    secondary={mapping.transformationRule || 'Direct mapping'}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label="Active"
                      color="success"
                      variant="outlined"
                    />
                    <IconButton
                      edge="end"
                      onClick={() => removeMapping(mapping.sourceField, mapping.targetField)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>

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
            {mappings.map((mapping, index) => (
              <ListItem key={`${mapping.sourceField}-${mapping.targetField}-${index}`}>
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

      {/* Add Target Field Dialog */}
      <Dialog
        open={addFieldDialogOpen}
        onClose={() => setAddFieldDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Target Field</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Field Name"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              fullWidth
              required
              autoFocus
            />
            
            <FormControl fullWidth>
              <InputLabel>Field Type</InputLabel>
              <Select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
                label="Field Type"
              >
                <MenuItem value="string">String</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="integer">Integer</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="array">Array</MenuItem>
                <MenuItem value="object">Object</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description (Optional)"
              value={newFieldDescription}
              onChange={(e) => setNewFieldDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="checkbox"
                checked={newFieldRequired}
                onChange={(e) => setNewFieldRequired(e.target.checked)}
                id="required-checkbox"
              />
              <label htmlFor="required-checkbox">
                <Typography variant="body2">Required field</Typography>
              </label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFieldDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={addNewTargetField}
            disabled={!newFieldName.trim()}
          >
            Add Field
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default FieldMappingInterface
