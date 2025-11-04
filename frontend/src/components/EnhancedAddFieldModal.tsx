import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import type { FieldMapping } from '../services/api'

interface EnhancedAddFieldModalProps {
  open: boolean
  onClose: () => void
  onAdd: (field: FieldMapping) => void
  parentField?: string
  nestingLevel?: number
}

type FieldType = 'SIMPLE' | 'NESTED_OBJECT' | 'COMPUTED' | 'KEY_VALUE_PAIR'
type ComputedType = 'UUID' | 'TIMESTAMP' | 'TIMESTAMP_ISO' | 'DATE' | 'COUNT' | 'INCREMENT' | 'CONSTANT' | 'RANDOM_STRING' | 'RANDOM_NUMBER'

const EnhancedAddFieldModal: React.FC<EnhancedAddFieldModalProps> = ({
  open,
  onClose,
  onAdd,
  parentField,
  nestingLevel = 0,
}) => {
  const [fieldName, setFieldName] = useState('')
  const [sourceField, setSourceField] = useState('')
  const [fieldType, setFieldType] = useState<FieldType>('SIMPLE')
  const [computedType, setComputedType] = useState<ComputedType>('UUID')
  const [transformationRule, setTransformationRule] = useState('')
  const [keyFieldName, setKeyFieldName] = useState('key')
  const [valueFieldName, setValueFieldName] = useState('value')
  const [children, setChildren] = useState<FieldMapping[]>([])
  const [childFieldName, setChildFieldName] = useState('')
  const [childSourceField, setChildSourceField] = useState('')
  const [childFieldType, setChildFieldType] = useState<FieldType>('SIMPLE')
  const [childComputedType, setChildComputedType] = useState<ComputedType>('UUID')

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setFieldName('')
    setSourceField('')
    setFieldType('SIMPLE')
    setComputedType('UUID')
    setTransformationRule('')
    setKeyFieldName('key')
    setValueFieldName('value')
    setChildren([])
    setChildFieldName('')
    setChildSourceField('')
    setChildFieldType('SIMPLE')
    setChildComputedType('UUID')
  }

  const handleAdd = () => {
    const newField: FieldMapping = {
      sourceField: sourceField || fieldName,
      targetField: fieldName,
      fieldType,
      isNested: parentField !== undefined,
      parentField,
      nestingLevel,
    }

    if (fieldType === 'COMPUTED') {
      newField.computedType = computedType
      newField.transformationRule = transformationRule
    } else if (fieldType === 'NESTED_OBJECT') {
      newField.children = children
    } else if (fieldType === 'KEY_VALUE_PAIR') {
      newField.isKeyValuePair = true
      newField.keyFieldName = keyFieldName
      newField.valueFieldName = valueFieldName
    } else if (transformationRule) {
      newField.transformationRule = transformationRule
    }

    onAdd(newField)
    handleClose()
  }

  const addChildField = () => {
    if (!childFieldName.trim()) return

    const childField: FieldMapping = {
      sourceField: childSourceField || childFieldName,
      targetField: childFieldName,
      fieldType: childFieldType,
      isNested: true,
      parentField: fieldName,
      nestingLevel: nestingLevel + 1,
    }

    if (childFieldType === 'COMPUTED') {
      childField.computedType = childComputedType
    }

    setChildren([...children, childField])
    setChildFieldName('')
    setChildSourceField('')
    setChildFieldType('SIMPLE')
    setChildComputedType('UUID')
  }

  const removeChildField = (index: number) => {
    setChildren(children.filter((_, i) => i !== index))
  }

  const getComputedFieldDescription = (type: ComputedType): string => {
    const descriptions: Record<ComputedType, string> = {
      UUID: 'Generates a unique identifier (UUID v4)',
      TIMESTAMP: 'Current timestamp in milliseconds',
      TIMESTAMP_ISO: 'ISO 8601 formatted timestamp',
      DATE: 'Current date (YYYY-MM-DD)',
      COUNT: 'Count of items in the source field',
      INCREMENT: 'Auto-incrementing number starting from 1',
      CONSTANT: 'Constant value (specify in transformation rule)',
      RANDOM_STRING: 'Random 8-character string',
      RANDOM_NUMBER: 'Random number (0-999999)',
    }
    return descriptions[type] || ''
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Add New Field
          {nestingLevel > 0 && (
            <Chip label={`Level ${nestingLevel + 1}`} size="small" color="primary" />
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          {/* Target Field Name */}
          <TextField
            label="Target Field Name"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            fullWidth
            required
            autoFocus
            helperText="The name of the field in the target format"
          />

          {/* Field Type Selection */}
          <FormControl fullWidth>
            <InputLabel>Field Type</InputLabel>
            <Select
              value={fieldType}
              onChange={(e: SelectChangeEvent) => setFieldType(e.target.value as FieldType)}
              label="Field Type"
            >
              <MenuItem value="SIMPLE">Simple Field Mapping</MenuItem>
              <MenuItem value="NESTED_OBJECT">Nested Object</MenuItem>
              <MenuItem value="COMPUTED">Computed/Generated Field</MenuItem>
              <MenuItem value="KEY_VALUE_PAIR">Key/Value Pair</MenuItem>
            </Select>
          </FormControl>

          {/* Simple Field Configuration */}
          {fieldType === 'SIMPLE' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Source Field Path"
                value={sourceField}
                onChange={(e) => setSourceField(e.target.value)}
                fullWidth
                required
                helperText="Path to the source field (e.g., user.name or items[].id)"
              />
              <TextField
                label="Transformation Rule (Optional)"
                value={transformationRule}
                onChange={(e) => setTransformationRule(e.target.value)}
                fullWidth
                helperText="e.g., uppercase, lowercase, trim"
              />
            </Box>
          )}

          {/* Computed Field Configuration */}
          {fieldType === 'COMPUTED' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Computed Type</InputLabel>
                <Select
                  value={computedType}
                  onChange={(e: SelectChangeEvent) => setComputedType(e.target.value as ComputedType)}
                  label="Computed Type"
                >
                  <MenuItem value="UUID">UUID</MenuItem>
                  <MenuItem value="TIMESTAMP">Timestamp</MenuItem>
                  <MenuItem value="TIMESTAMP_ISO">Timestamp (ISO)</MenuItem>
                  <MenuItem value="DATE">Date</MenuItem>
                  <MenuItem value="COUNT">Count</MenuItem>
                  <MenuItem value="INCREMENT">Auto Increment</MenuItem>
                  <MenuItem value="CONSTANT">Constant Value</MenuItem>
                  <MenuItem value="RANDOM_STRING">Random String</MenuItem>
                  <MenuItem value="RANDOM_NUMBER">Random Number</MenuItem>
                </Select>
              </FormControl>

              <Box
                sx={{
                  p: 2,
                  bgcolor: 'info.light',
                  borderRadius: 1,
                  color: 'info.contrastText',
                }}
              >
                <Typography variant="body2">
                  {getComputedFieldDescription(computedType)}
                </Typography>
              </Box>

              {(computedType === 'CONSTANT' || computedType === 'COUNT') && (
                <TextField
                  label={computedType === 'CONSTANT' ? 'Constant Value' : 'Source Field to Count'}
                  value={transformationRule}
                  onChange={(e) => setTransformationRule(e.target.value)}
                  fullWidth
                  required
                  helperText={
                    computedType === 'CONSTANT'
                      ? 'Enter the constant value to use'
                      : 'Enter the path to the field/array to count'
                  }
                />
              )}
            </Box>
          )}

          {/* Nested Object Configuration */}
          {fieldType === 'NESTED_OBJECT' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Define child fields for this nested object:
              </Typography>

              {/* Child Fields List */}
              {children.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {children.map((child, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                      }}
                    >
                      <Chip
                        label={child.fieldType}
                        size="small"
                        color={child.fieldType === 'COMPUTED' ? 'secondary' : 'default'}
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {child.targetField}
                        {child.fieldType === 'COMPUTED' && ` (${child.computedType})`}
                      </Typography>
                      <IconButton size="small" onClick={() => removeChildField(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Add Child Field */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddIcon fontSize="small" />
                    <Typography>Add Child Field</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Child Field Name"
                      value={childFieldName}
                      onChange={(e) => setChildFieldName(e.target.value)}
                      fullWidth
                      size="small"
                    />

                    <FormControl fullWidth size="small">
                      <InputLabel>Child Field Type</InputLabel>
                      <Select
                        value={childFieldType}
                        onChange={(e: SelectChangeEvent) =>
                          setChildFieldType(e.target.value as FieldType)
                        }
                        label="Child Field Type"
                      >
                        <MenuItem value="SIMPLE">Simple Field</MenuItem>
                        <MenuItem value="COMPUTED">Computed Field</MenuItem>
                      </Select>
                    </FormControl>

                    {childFieldType === 'SIMPLE' && (
                      <TextField
                        label="Source Field"
                        value={childSourceField}
                        onChange={(e) => setChildSourceField(e.target.value)}
                        fullWidth
                        size="small"
                      />
                    )}

                    {childFieldType === 'COMPUTED' && (
                      <FormControl fullWidth size="small">
                        <InputLabel>Computed Type</InputLabel>
                        <Select
                          value={childComputedType}
                          onChange={(e: SelectChangeEvent) =>
                            setChildComputedType(e.target.value as ComputedType)
                          }
                          label="Computed Type"
                        >
                          <MenuItem value="UUID">UUID</MenuItem>
                          <MenuItem value="TIMESTAMP">Timestamp</MenuItem>
                          <MenuItem value="TIMESTAMP_ISO">Timestamp (ISO)</MenuItem>
                          <MenuItem value="DATE">Date</MenuItem>
                          <MenuItem value="INCREMENT">Auto Increment</MenuItem>
                          <MenuItem value="CONSTANT">Constant</MenuItem>
                        </Select>
                      </FormControl>
                    )}

                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addChildField}
                      disabled={!childFieldName.trim()}
                      fullWidth
                    >
                      Add Child
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}

          {/* Key/Value Pair Configuration */}
          {fieldType === 'KEY_VALUE_PAIR' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Source Field Path"
                value={sourceField}
                onChange={(e) => setSourceField(e.target.value)}
                fullWidth
                required
                helperText="Path to the source map/object to convert to key-value pairs"
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Key Field Name"
                  value={keyFieldName}
                  onChange={(e) => setKeyFieldName(e.target.value)}
                  fullWidth
                  helperText="Name for the key field"
                />
                <TextField
                  label="Value Field Name"
                  value={valueFieldName}
                  onChange={(e) => setValueFieldName(e.target.value)}
                  fullWidth
                  helperText="Name for the value field"
                />
              </Box>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'info.light',
                  borderRadius: 1,
                  color: 'info.contrastText',
                }}
              >
                <Typography variant="body2">
                  Converts an object/map into an array of key-value pair objects.
                  Example: {`{ "a": 1, "b": 2 }`} → {`[{ ${keyFieldName}: "a", ${valueFieldName}: 1 }, ...]`}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={!fieldName.trim() || (fieldType === 'SIMPLE' && !sourceField.trim())}
        >
          Add Field
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EnhancedAddFieldModal
