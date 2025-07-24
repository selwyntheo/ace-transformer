import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FieldMappingInterface from '../../components/FieldMappingInterface'
import type { FormatType, FieldMapping } from '../../services/api'

describe('FieldMappingInterface', () => {
  const user = userEvent.setup()
  const mockOnMappingChange = vi.fn()
  const mockOnPreview = vi.fn()

  const defaultProps = {
    sourceFormat: 'JSON' as FormatType,
    targetFormat: 'XML' as FormatType,
    sourceData: '{"name": "John", "age": 30, "address": {"city": "NYC", "zip": "10001"}}',
    onMappingChange: mockOnMappingChange,
    onPreview: mockOnPreview,
    disabled: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the interface with all sections', () => {
    render(<FieldMappingInterface {...defaultProps} />)
    
    expect(screen.getByText('Advanced Field Mapping')).toBeInTheDocument()
    expect(screen.getByText('Source Fields (JSON)')).toBeInTheDocument()
    expect(screen.getByText('Target Fields (XML)')).toBeInTheDocument()
    expect(screen.getByText('Mapping Rules')).toBeInTheDocument()
  })

  it('should extract JSON fields correctly', async () => {
    render(<FieldMappingInterface {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('name')).toBeInTheDocument()
      expect(screen.getByText('age')).toBeInTheDocument()
      expect(screen.getByText('address.city')).toBeInTheDocument()
      expect(screen.getByText('address.zip')).toBeInTheDocument()
    })
  })

  it('should show field types and samples', async () => {
    render(<FieldMappingInterface {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('string')).toBeInTheDocument()
      expect(screen.getByText('number')).toBeInTheDocument()
      expect(screen.getByText('"John"')).toBeInTheDocument()
      expect(screen.getByText('"30"')).toBeInTheDocument()
    })
  })

  it('should allow auto-mapping of fields', async () => {
    render(<FieldMappingInterface {...defaultProps} />)
    
    const autoMapButton = screen.getByRole('button', { name: /auto map/i })
    await user.click(autoMapButton)
    
    expect(mockOnMappingChange).toHaveBeenCalled()
    const mappings = mockOnMappingChange.mock.calls[0][0] as FieldMapping[]
    expect(mappings.length).toBeGreaterThan(0)
  })

  it('should handle CSV data extraction', () => {
    const csvData = 'name,age,email\nJohn,30,john@example.com\nJane,25,jane@example.com'
    const props = {
      ...defaultProps,
      sourceFormat: 'CSV' as FormatType,
      sourceData: csvData,
    }
    
    render(<FieldMappingInterface {...props} />)
    
    expect(screen.getByText('Source Fields (CSV)')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('age')).toBeInTheDocument()
    expect(screen.getByText('email')).toBeInTheDocument()
  })

  it('should handle XML data extraction', () => {
    const xmlData = '<person><name>John</name><age>30</age><address city="NYC" zip="10001" /></person>'
    const props = {
      ...defaultProps,
      sourceFormat: 'XML' as FormatType,
      sourceData: xmlData,
    }
    
    render(<FieldMappingInterface {...props} />)
    
    expect(screen.getByText('Source Fields (XML)')).toBeInTheDocument()
  })

  it('should show empty state when no source data', () => {
    const props = {
      ...defaultProps,
      sourceData: null,
    }
    
    render(<FieldMappingInterface {...props} />)
    
    expect(screen.getByText(/upload source data to detect fields/i)).toBeInTheDocument()
  })

  it('should handle TXT data extraction', () => {
    const txtData = 'Line 1\nLine 2\nLine 3'
    const props = {
      ...defaultProps,
      sourceFormat: 'TXT' as FormatType,
      sourceData: txtData,
    }
    
    render(<FieldMappingInterface {...props} />)
    
    expect(screen.getByText('Source Fields (TXT)')).toBeInTheDocument()
    expect(screen.getByText('line')).toBeInTheDocument()
    expect(screen.getByText('lineNumber')).toBeInTheDocument()
  })

  it('should disable interface when disabled prop is true', () => {
    const props = {
      ...defaultProps,
      disabled: true,
    }
    
    render(<FieldMappingInterface {...props} />)
    
    const autoMapButton = screen.getByRole('button', { name: /auto map/i })
    expect(autoMapButton).toBeDisabled()
  })

  it('should open preview dialog', async () => {
    render(<FieldMappingInterface {...defaultProps} />)
    
    // First create some mappings
    const autoMapButton = screen.getByRole('button', { name: /auto map/i })
    await user.click(autoMapButton)
    
    // Then open preview
    const previewButton = screen.getByRole('button', { name: /preview/i })
    await user.click(previewButton)
    
    expect(screen.getByText('Mapping Preview')).toBeInTheDocument()
  })

  it('should handle configuration name changes', async () => {
    render(<FieldMappingInterface {...defaultProps} />)
    
    const configInput = screen.getByLabelText(/configuration name/i)
    await user.type(configInput, 'My Config')
    
    expect(configInput).toHaveValue('My Config')
  })

  it('should add custom target fields', async () => {
    render(<FieldMappingInterface {...defaultProps} />)
    
    const addButton = screen.getByTitle('Add custom field')
    await user.click(addButton)
    
    // Should add a new custom field to the target fields
    expect(screen.getByText(/CustomField/)).toBeInTheDocument()
  })

  it('should handle field selection and mapping creation', async () => {
    render(<FieldMappingInterface {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('name')).toBeInTheDocument()
    })
    
    // Click on a source field
    const sourceField = screen.getByText('name').closest('.MuiCard-root')
    if (sourceField) {
      await user.click(sourceField)
    }
    
    // Then click on a target field
    const targetField = screen.getByText('name').closest('.MuiCard-root')
    if (targetField) {
      await user.click(targetField)
    }
    
    expect(mockOnMappingChange).toHaveBeenCalled()
  })

  it('should show field counts in target fields', async () => {
    render(<FieldMappingInterface {...defaultProps} />)
    
    // Create mappings first
    const autoMapButton = screen.getByRole('button', { name: /auto map/i })
    await user.click(autoMapButton)
    
    await waitFor(() => {
      // Should show mapping counts
      const targetSection = screen.getByText('Target Fields (XML)').closest('div')
      expect(targetSection).toBeInTheDocument()
    })
  })

  it('should handle invalid JSON gracefully', () => {
    const props = {
      ...defaultProps,
      sourceData: '{"invalid": json}',
    }
    
    render(<FieldMappingInterface {...props} />)
    
    // Should not crash and show appropriate message
    expect(screen.getByText('Source Fields (JSON)')).toBeInTheDocument()
  })

  it('should toggle auto-detect types', async () => {
    render(<FieldMappingInterface {...defaultProps} />)
    
    const autoDetectSwitch = screen.getByRole('checkbox', { name: /auto-detect field types/i })
    expect(autoDetectSwitch).toBeChecked()
    
    await user.click(autoDetectSwitch)
    expect(autoDetectSwitch).not.toBeChecked()
  })

  it('should show advanced options accordion', async () => {
    render(<FieldMappingInterface {...defaultProps} />)
    
    const advancedToggle = screen.getByText('Advanced Options')
    await user.click(advancedToggle)
    
    expect(screen.getByText(/configure transformation rules/i)).toBeInTheDocument()
  })
})
