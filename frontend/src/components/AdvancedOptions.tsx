/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  TextField,
  Select,
  MenuItem,
  Chip,
  Button,
  Divider,
  Alert,
  Slider,
  Radio,
  RadioGroup,
  InputAdornment,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  BugReport as BugReportIcon,
  Transform as TransformIcon,
} from '@mui/icons-material'

export interface TransformationRule {
  id: string
  name: string
  type: 'mapping' | 'validation' | 'transformation' | 'filter'
  condition: string
  action: string
  enabled: boolean
}

export interface ValidationRule {
  id: string
  field: string
  type: 'required' | 'format' | 'range' | 'custom'
  rule: string
  message: string
  enabled: boolean
}

export interface AdvancedSettings {
  // Transformation Rules
  transformationRules: TransformationRule[]
  
  // Validation Settings
  validationRules: ValidationRule[]
  validateOnTransform: boolean
  strictValidation: boolean
  
  // Performance Settings
  batchSize: number
  maxMemoryUsage: number
  enableParallelProcessing: boolean
  
  // Output Settings
  preserveNullValues: boolean
  preserveEmptyStrings: boolean
  prettifyOutput: boolean
  includeMetadata: boolean
  
  // Error Handling
  continueOnError: boolean
  maxErrors: number
  errorReporting: 'none' | 'summary' | 'detailed'
  
  // Advanced Features
  enableCustomFunctions: boolean
  enableConditionalMapping: boolean
  enableDataAugmentation: boolean
  
  // Security
  sanitizeInput: boolean
  enableDataMasking: boolean
  maskingPatterns: string[]
}

interface AdvancedOptionsProps {
  settings: AdvancedSettings
  onSettingsChange: (settings: AdvancedSettings) => void
  disabled?: boolean
}

const defaultSettings: AdvancedSettings = {
  transformationRules: [],
  validationRules: [],
  validateOnTransform: true,
  strictValidation: false,
  batchSize: 1000,
  maxMemoryUsage: 512,
  enableParallelProcessing: true,
  preserveNullValues: false,
  preserveEmptyStrings: true,
  prettifyOutput: true,
  includeMetadata: false,
  continueOnError: true,
  maxErrors: 100,
  errorReporting: 'summary',
  enableCustomFunctions: false,
  enableConditionalMapping: true,
  enableDataAugmentation: false,
  sanitizeInput: true,
  enableDataMasking: false,
  maskingPatterns: ['email', 'phone', 'ssn'],
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  settings = defaultSettings,
  onSettingsChange,
  disabled = false,
}) => {
  const [expandedPanels, setExpandedPanels] = useState<string[]>(['transformation'])

  const handlePanelChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanels(prev => 
      isExpanded 
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    )
  }

  const updateSettings = (updates: Partial<AdvancedSettings>) => {
    onSettingsChange({ ...settings, ...updates })
  }

  const addTransformationRule = () => {
    const newRule: TransformationRule = {
      id: `rule_${Date.now()}`,
      name: `Rule ${settings.transformationRules.length + 1}`,
      type: 'mapping',
      condition: '',
      action: '',
      enabled: true,
    }
    updateSettings({
      transformationRules: [...settings.transformationRules, newRule]
    })
  }

  const updateTransformationRule = (id: string, updates: Partial<TransformationRule>) => {
    updateSettings({
      transformationRules: settings.transformationRules.map(rule =>
        rule.id === id ? { ...rule, ...updates } : rule
      )
    })
  }

  const deleteTransformationRule = (id: string) => {
    updateSettings({
      transformationRules: settings.transformationRules.filter(rule => rule.id !== id)
    })
  }

  const addValidationRule = () => {
    const newRule: ValidationRule = {
      id: `validation_${Date.now()}`,
      field: '',
      type: 'required',
      rule: '',
      message: '',
      enabled: true,
    }
    updateSettings({
      validationRules: [...settings.validationRules, newRule]
    })
  }

  const updateValidationRule = (id: string, updates: Partial<ValidationRule>) => {
    updateSettings({
      validationRules: settings.validationRules.map(rule =>
        rule.id === id ? { ...rule, ...updates } : rule
      )
    })
  }

  const deleteValidationRule = (id: string) => {
    updateSettings({
      validationRules: settings.validationRules.filter(rule => rule.id !== id)
    })
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <SettingsIcon sx={{ mr: 1 }} />
        <Typography variant="h6">
          Advanced Options
        </Typography>
        <Chip 
          label={`${settings.transformationRules.length + settings.validationRules.length} rules`}
          size="small"
          sx={{ ml: 2 }}
        />
      </Box>

      {/* Transformation Rules */}
      <Accordion 
        expanded={expandedPanels.includes('transformation')}
        onChange={handlePanelChange('transformation')}
        disabled={disabled}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <TransformIcon sx={{ mr: 1 }} />
            <Typography>Transformation Rules</Typography>
            <Chip 
              label={settings.transformationRules.length}
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Define custom transformation rules to modify data during conversion
            </Typography>
            
            {settings.transformationRules.map((rule) => (
              <Paper key={rule.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Rule Name"
                      value={rule.name}
                      onChange={(e) => updateTransformationRule(rule.id, { name: e.target.value })}
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth size="small">
                      <Select
                        value={rule.type}
                        onChange={(e) => updateTransformationRule(rule.id, { type: e.target.value as any })}
                        disabled={disabled}
                      >
                        <MenuItem value="mapping">Field Mapping</MenuItem>
                        <MenuItem value="validation">Validation</MenuItem>
                        <MenuItem value="transformation">Data Transform</MenuItem>
                        <MenuItem value="filter">Filter</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Condition"
                      value={rule.condition}
                      onChange={(e) => updateTransformationRule(rule.id, { condition: e.target.value })}
                      placeholder="field === 'value'"
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Action"
                      value={rule.action}
                      onChange={(e) => updateTransformationRule(rule.id, { action: e.target.value })}
                      placeholder="toUpperCase()"
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid item xs="auto">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rule.enabled}
                          onChange={(e) => updateTransformationRule(rule.id, { enabled: e.target.checked })}
                          disabled={disabled}
                        />
                      }
                      label="Enabled"
                    />
                  </Grid>
                  <Grid item xs="auto">
                    <IconButton
                      onClick={() => deleteTransformationRule(rule.id)}
                      disabled={disabled}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}
            
            <Button
              startIcon={<AddIcon />}
              onClick={addTransformationRule}
              variant="outlined"
              disabled={disabled}
            >
              Add Transformation Rule
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Validation Settings */}
      <Accordion 
        expanded={expandedPanels.includes('validation')}
        onChange={handlePanelChange('validation')}
        disabled={disabled}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <SecurityIcon sx={{ mr: 1 }} />
            <Typography>Validation & Security</Typography>
            <Chip 
              label={settings.validationRules.length}
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {/* Global Validation Settings */}
            <FormGroup sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.validateOnTransform}
                    onChange={(e) => updateSettings({ validateOnTransform: e.target.checked })}
                    disabled={disabled}
                  />
                }
                label="Validate data during transformation"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.strictValidation}
                    onChange={(e) => updateSettings({ strictValidation: e.target.checked })}
                    disabled={disabled}
                  />
                }
                label="Strict validation (fail on any validation error)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.sanitizeInput}
                    onChange={(e) => updateSettings({ sanitizeInput: e.target.checked })}
                    disabled={disabled}
                  />
                }
                label="Sanitize input data"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableDataMasking}
                    onChange={(e) => updateSettings({ enableDataMasking: e.target.checked })}
                    disabled={disabled}
                  />
                }
                label="Enable data masking for sensitive fields"
              />
            </FormGroup>

            <Divider sx={{ my: 2 }} />

            {/* Validation Rules */}
            <Typography variant="subtitle2" gutterBottom>
              Validation Rules
            </Typography>
            
            {settings.validationRules.map((rule) => (
              <Paper key={rule.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Field"
                      value={rule.field}
                      onChange={(e) => updateValidationRule(rule.id, { field: e.target.value })}
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth size="small">
                      <Select
                        value={rule.type}
                        onChange={(e) => updateValidationRule(rule.id, { type: e.target.value as any })}
                        disabled={disabled}
                      >
                        <MenuItem value="required">Required</MenuItem>
                        <MenuItem value="format">Format</MenuItem>
                        <MenuItem value="range">Range</MenuItem>
                        <MenuItem value="custom">Custom</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Rule"
                      value={rule.rule}
                      onChange={(e) => updateValidationRule(rule.id, { rule: e.target.value })}
                      placeholder="regex pattern or expression"
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Error Message"
                      value={rule.message}
                      onChange={(e) => updateValidationRule(rule.id, { message: e.target.value })}
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid item xs="auto">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rule.enabled}
                          onChange={(e) => updateValidationRule(rule.id, { enabled: e.target.checked })}
                          disabled={disabled}
                        />
                      }
                      label="Enabled"
                    />
                  </Grid>
                  <Grid item xs="auto">
                    <IconButton
                      onClick={() => deleteValidationRule(rule.id)}
                      disabled={disabled}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}
            
            <Button
              startIcon={<AddIcon />}
              onClick={addValidationRule}
              variant="outlined"
              disabled={disabled}
            >
              Add Validation Rule
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Performance Settings */}
      <Accordion 
        expanded={expandedPanels.includes('performance')}
        onChange={handlePanelChange('performance')}
        disabled={disabled}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <SpeedIcon sx={{ mr: 1 }} />
            <Typography>Performance Settings</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>
                Batch Size: {settings.batchSize}
              </Typography>
              <Slider
                value={settings.batchSize}
                onChange={(_, value) => updateSettings({ batchSize: value as number })}
                min={100}
                max={10000}
                step={100}
                marks={[
                  { value: 100, label: '100' },
                  { value: 1000, label: '1K' },
                  { value: 5000, label: '5K' },
                  { value: 10000, label: '10K' },
                ]}
                disabled={disabled}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>
                Max Memory Usage: {settings.maxMemoryUsage}MB
              </Typography>
              <Slider
                value={settings.maxMemoryUsage}
                onChange={(_, value) => updateSettings({ maxMemoryUsage: value as number })}
                min={128}
                max={2048}
                step={128}
                marks={[
                  { value: 128, label: '128MB' },
                  { value: 512, label: '512MB' },
                  { value: 1024, label: '1GB' },
                  { value: 2048, label: '2GB' },
                ]}
                disabled={disabled}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableParallelProcessing}
                    onChange={(e) => updateSettings({ enableParallelProcessing: e.target.checked })}
                    disabled={disabled}
                  />
                }
                label="Enable parallel processing for large datasets"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Output Settings */}
      <Accordion 
        expanded={expandedPanels.includes('output')}
        onChange={handlePanelChange('output')}
        disabled={disabled}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Output Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.preserveNullValues}
                  onChange={(e) => updateSettings({ preserveNullValues: e.target.checked })}
                  disabled={disabled}
                />
              }
              label="Preserve null values in output"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.preserveEmptyStrings}
                  onChange={(e) => updateSettings({ preserveEmptyStrings: e.target.checked })}
                  disabled={disabled}
                />
              }
              label="Preserve empty strings"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.prettifyOutput}
                  onChange={(e) => updateSettings({ prettifyOutput: e.target.checked })}
                  disabled={disabled}
                />
              }
              label="Format output for readability"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.includeMetadata}
                  onChange={(e) => updateSettings({ includeMetadata: e.target.checked })}
                  disabled={disabled}
                />
              }
              label="Include transformation metadata"
            />
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Error Handling */}
      <Accordion 
        expanded={expandedPanels.includes('errors')}
        onChange={handlePanelChange('errors')}
        disabled={disabled}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <BugReportIcon sx={{ mr: 1 }} />
            <Typography>Error Handling</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.continueOnError}
                    onChange={(e) => updateSettings({ continueOnError: e.target.checked })}
                    disabled={disabled}
                  />
                }
                label="Continue processing on errors"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Errors"
                value={settings.maxErrors}
                onChange={(e) => updateSettings({ maxErrors: parseInt(e.target.value) || 0 })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Maximum number of errors before stopping transformation">
                        <InfoIcon />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                disabled={disabled}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel>Error Reporting</FormLabel>
                <RadioGroup
                  value={settings.errorReporting}
                  onChange={(e) => updateSettings({ errorReporting: e.target.value as any })}
                >
                  <FormControlLabel 
                    value="none" 
                    control={<Radio />} 
                    label="None" 
                    disabled={disabled}
                  />
                  <FormControlLabel 
                    value="summary" 
                    control={<Radio />} 
                    label="Summary only" 
                    disabled={disabled}
                  />
                  <FormControlLabel 
                    value="detailed" 
                    control={<Radio />} 
                    label="Detailed reports" 
                    disabled={disabled}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Advanced Features */}
      <Accordion 
        expanded={expandedPanels.includes('features')}
        onChange={handlePanelChange('features')}
        disabled={disabled}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Advanced Features</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableCustomFunctions}
                  onChange={(e) => updateSettings({ enableCustomFunctions: e.target.checked })}
                  disabled={disabled}
                />
              }
              label="Enable custom JavaScript functions in rules"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableConditionalMapping}
                  onChange={(e) => updateSettings({ enableConditionalMapping: e.target.checked })}
                  disabled={disabled}
                />
              }
              label="Enable conditional field mapping"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableDataAugmentation}
                  onChange={(e) => updateSettings({ enableDataAugmentation: e.target.checked })}
                  disabled={disabled}
                />
              }
              label="Enable data augmentation and enrichment"
            />
          </FormGroup>
          
          {settings.enableCustomFunctions && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Security Warning:</strong> Custom functions can execute arbitrary code. 
                Only enable this feature if you trust the transformation rules.
              </Typography>
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>
    </Paper>
  )
}

export default AdvancedOptions
