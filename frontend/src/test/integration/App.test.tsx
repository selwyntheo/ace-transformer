import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { TransformationService } from '../../services/api'

// Mock the TransformationService
vi.mock('../../services/api', () => ({
  TransformationService: {
    transform: vi.fn(),
    advancedTransform: vi.fn(),
  },
}))

// Mock file utilities
vi.mock('../../utils/formatUtils', () => ({
  SUPPORTED_FORMATS: ['JSON', 'XML', 'CSV', 'TXT'],
  generateSampleData: vi.fn((format) => {
    if (format === 'JSON') return '{"name":"Sample","age":25}'
    if (format === 'XML') return '<root><name>Sample</name><age>25</age></root>'
    if (format === 'CSV') return 'name,age
Sample,25'
    return 'Sample text data'
  }),
  detectFormatFromFileName: vi.fn(() => 'JSON'),
  detectFormatFromContent: vi.fn(() => 'JSON'),
  formatFileSize: vi.fn((size) => `${size} bytes`),
  isValidFileType: vi.fn(() => true),
  downloadFile: vi.fn(),
  copyToClipboard: vi.fn(),
  FORMAT_DESCRIPTIONS: {
    JSON: 'JavaScript Object Notation',
    XML: 'Extensible Markup Language',
    CSV: 'Comma Separated Values',
    TXT: 'Plain Text',
  },
  FORMAT_ICONS: {
    JSON: '{}',
    XML: '</>',
    CSV: '📊',
    TXT: '📄'
  },
  FORMAT_EXTENSIONS: {
    JSON: ['.json'],
    XML: ['.xml'],
    CSV: ['.csv'],
    TXT: ['.txt']
  }
}))

describe('App Integration Tests', () => {
  const user = userEvent.setup()
  const mockTransform = vi.mocked(TransformationService.transform)
  const mockAdvancedTransform = vi.mocked(TransformationService.advancedTransform)

  beforeEach(() => {
    vi.clearAllMocks()
    mockTransform.mockResolvedValue({
      transformedData: '{"transformed": "data"}',
      success: true,
      processingTimeMs: 100
    })
    mockAdvancedTransform.mockResolvedValue({
      transformedData: '{"advanced": "transformation"}',
      success: true,
      processingTimeMs: 150
    })
  })

  it('should render main application with navigation', () => {
    render(<App />)
    
    expect(screen.getByText('AceTransformer')).toBeInTheDocument()
    expect(screen.getByText('Universal Data Transformation Platform')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /quick transform/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /advanced mapping/i })).toBeInTheDocument()
  })

  it('should start with quick transform tab active', () => {
    render(<App />)
    
    expect(screen.getByText('Quick Transform')).toBeInTheDocument()
    expect(screen.getByText('Transform data between different formats quickly and easily')).toBeInTheDocument()
  })

  it('should switch between tabs', async () => {
    render(<App />)
    
    // Click advanced mapping tab
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    expect(screen.getByText('Transform data with advanced field-level mapping and custom rules')).toBeInTheDocument()
    
    // Switch back to quick transform
    const quickTab = screen.getByRole('tab', { name: /quick transform/i })
    await user.click(quickTab)
    
    expect(screen.getByText('Transform data between different formats quickly and easily')).toBeInTheDocument()
  })

  it('should show field mapping interface in advanced mode', async () => {
    render(<App />)
    
    // Switch to advanced tab
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    // Switch to advanced mapping mode
    const advancedMappingTab = screen.getAllByRole('tab', { name: /advanced mapping/i })[1]
    await user.click(advancedMappingTab)
    
    // Complete setup
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    const targetSection = screen.getByText('Target Format').closest('div')!
    const xmlCards = targetSection.querySelectorAll('.MuiCard-root')
    if (xmlCards[1]) await user.click(xmlCards[1])
    
    const jsonSampleButton = screen.getByRole('button', { name: /json sample/i })
    await user.click(jsonSampleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Source Fields (JSON)')).toBeInTheDocument()
      expect(screen.getByText('Target Fields (XML)')).toBeInTheDocument()
      expect(screen.getByText('Mapping Rules')).toBeInTheDocument()
    })
  })

  it('should show stepper navigation in advanced mode', async () => {
    render(<App />)
    
    // Switch to advanced tab
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    // Switch to advanced mapping mode
    const advancedMappingTab = screen.getAllByRole('tab', { name: /advanced mapping/i })[1]
    await user.click(advancedMappingTab)
    
    expect(screen.getByText('Transformation Steps')).toBeInTheDocument()
    expect(screen.getByText('Select Source Format')).toBeInTheDocument()
    expect(screen.getByText('Select Target Format')).toBeInTheDocument()
    expect(screen.getByText('Upload Source Data')).toBeInTheDocument()
    expect(screen.getByText('Configure Field Mappings')).toBeInTheDocument()
    expect(screen.getByText('Transform & Review Results')).toBeInTheDocument()
  })
})

describe('App Integration Tests', () => {

// Mock file utilities
vi.mock('../../utils/formatUtils', () => ({
  const user = userEvent.setup()
  const mockTransform = vi.mocked(TransformationService.transform)
  const mockAdvancedTransform = vi.mocked(TransformationService.advancedTransform)

  beforeEach(() => {
    vi.clearAllMocks()
    mockTransform.mockResolvedValue({
      transformedData: '{"transformed": "data"}',
      success: true,
      processingTimeMs: 100
    })
    mockAdvancedTransform.mockResolvedValue({
      transformedData: '{"advanced": "transformation"}',
      success: true,
      processingTimeMs: 150
    })
  })

  it('should render main application with navigation', () => {
    render(<App />)
    
    expect(screen.getByText('AceTransformer')).toBeInTheDocument()
    expect(screen.getByText('Universal Data Transformation Platform')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /quick transform/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /advanced mapping/i })).toBeInTheDocument()
  })

  it('should start with quick transform tab active', () => {
    render(<App />)
    
    expect(screen.getByText('Quick Transform')).toBeInTheDocument()
    expect(screen.getByText('Transform data between different formats quickly and easily')).toBeInTheDocument()
  })

  it('should switch between tabs', async () => {
    render(<App />)
    
    // Click advanced mapping tab
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    expect(screen.getByText('Transform data with advanced field-level mapping and custom rules')).toBeInTheDocument()
    
    // Switch back to quick transform
    const quickTab = screen.getByRole('tab', { name: /quick transform/i })
    await user.click(quickTab)
    
    expect(screen.getByText('Transform data between different formats quickly and easily')).toBeInTheDocument()
  })

  it('should perform complete quick transformation workflow', async () => {
    render(<App />)
    
    // Ensure we're on quick transform tab
    const quickTab = screen.getByRole('tab', { name: /quick transform/i })
    await user.click(quickTab)
    
    // Select source format
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    // Select target format
    const targetSection = screen.getByText('Target Format').closest('div')!
    const xmlCards = targetSection.querySelectorAll('.MuiCard-root')
    if (xmlCards[1]) await user.click(xmlCards[1]) // XML is second card
    
    // Load sample data
    const jsonSampleButton = screen.getByRole('button', { name: /json sample/i })
    await user.click(jsonSampleButton)
    
    // Transform
    const transformButton = screen.getByRole('button', { name: /transform data/i })
    await user.click(transformButton)
    
    await waitFor(() => {
      expect(mockTransform).toHaveBeenCalledWith({
        inputData: '{"name":"Sample","age":25}',
        sourceFormat: 'JSON',
        targetFormat: 'XML',
      })
    })
  })

  it('should perform complete advanced transformation workflow', async () => {
    render(<App />)
    
    // Switch to advanced mapping tab
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    // Switch to advanced mapping mode within the tab
    const advancedMappingTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedMappingTab)
    
    // Select source format
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    // Select target format
    const targetSection = screen.getByText('Target Format').closest('div')!
    const xmlCards = targetSection.querySelectorAll('.MuiCard-root')
    if (xmlCards[1]) await user.click(xmlCards[1]) // XML is second card
    
    // Load sample data
    const jsonSampleButton = screen.getByRole('button', { name: /json sample/i })
    await user.click(jsonSampleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Field Mapping')).toBeInTheDocument()
    })
    
    // Auto map fields
    const autoMapButton = screen.getByRole('button', { name: /auto map/i })
    await user.click(autoMapButton)
    
    // Perform advanced transform
    const advancedTransformButton = screen.getByRole('button', { name: /advanced transform/i })
    await user.click(advancedTransformButton)
    
    await waitFor(() => {
      expect(mockAdvancedTransform).toHaveBeenCalled()
      const call = mockAdvancedTransform.mock.calls[0][0]
      expect(call.inputData).toBe('{"name":"Sample","age":25}')
      expect(call.sourceFormat).toBe('JSON')
      expect(call.targetFormat).toBe('XML')
      expect(call.mappingRules).toBeDefined()
    })
  })

  it('should show field mapping interface in advanced mode', async () => {
    render(<App />)
    
    // Switch to advanced tab
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    // Switch to advanced mapping mode
    const advancedMappingTab = screen.getAllByRole('tab', { name: /advanced mapping/i })[1]
    await user.click(advancedMappingTab)
    
    // Complete setup
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    const targetSection = screen.getByText('Target Format').closest('div')!
    const xmlCards = targetSection.querySelectorAll('.MuiCard-root')
    if (xmlCards[1]) await user.click(xmlCards[1])
    
    const jsonSampleButton = screen.getByRole('button', { name: /json sample/i })
    await user.click(jsonSampleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Source Fields (JSON)')).toBeInTheDocument()
      expect(screen.getByText('Target Fields (XML)')).toBeInTheDocument()
      expect(screen.getByText('Mapping Rules')).toBeInTheDocument()
    })
  })

  it('should handle errors in both modes', async () => {
    mockTransform.mockRejectedValue(new Error('Quick transform failed'))
    mockAdvancedTransform.mockRejectedValue(new Error('Advanced transform failed'))
    
    render(<App />)
    
    // Test quick transform error
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    const targetSection = screen.getByText('Target Format').closest('div')!
    const xmlCards = targetSection.querySelectorAll('.MuiCard-root')
    if (xmlCards[1]) await user.click(xmlCards[1])
    
    const jsonSampleButton = screen.getByRole('button', { name: /json sample/i })
    await user.click(jsonSampleButton)
    
    const transformButton = screen.getByRole('button', { name: /transform data/i })
    await user.click(transformButton)
    
    await waitFor(() => {
      expect(screen.getByText(/quick transform failed/i)).toBeInTheDocument()
    })
  })

  it('should show stepper navigation in advanced mode', async () => {
    render(<App />)
    
    // Switch to advanced tab
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    // Switch to advanced mapping mode
    const advancedMappingTab = screen.getAllByRole('tab', { name: /advanced mapping/i })[1]
    await user.click(advancedMappingTab)
    
    expect(screen.getByText('Transformation Steps')).toBeInTheDocument()
    expect(screen.getByText('Select Source Format')).toBeInTheDocument()
    expect(screen.getByText('Select Target Format')).toBeInTheDocument()
    expect(screen.getByText('Upload Source Data')).toBeInTheDocument()
    expect(screen.getByText('Configure Field Mappings')).toBeInTheDocument()
    expect(screen.getByText('Transform & Review Results')).toBeInTheDocument()
  })

  it('should progress through stepper steps', async () => {
    render(<App />)
    
    // Switch to advanced mode
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    const advancedMappingTab = screen.getAllByRole('tab', { name: /advanced mapping/i })[1]
    await user.click(advancedMappingTab)
    
    // Select source format - should advance stepper
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    // Select target format - should advance stepper
    const targetSection = screen.getByText('Target Format').closest('div')!
    const xmlCards = targetSection.querySelectorAll('.MuiCard-root')
    if (xmlCards[1]) await user.click(xmlCards[1])
    
    // Load data - should advance stepper
    const jsonSampleButton = screen.getByRole('button', { name: /json sample/i })
    await user.click(jsonSampleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Field Mapping')).toBeInTheDocument()
    })
  })

  it('should allow navigation between stepper steps', async () => {
    render(<App />)
    
    // Switch to advanced mode
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    const advancedMappingTab = screen.getAllByRole('tab', { name: /advanced mapping/i })[1]
    await user.click(advancedMappingTab)
    
    // Complete some steps
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    // Navigate back to first step
    const stepButtons = screen.getAllByText('Go to Step')
    if (stepButtons[0]) await user.click(stepButtons[0])
    
    // Should show format selection
    expect(screen.getByText('Choose the format of your source data')).toBeInTheDocument()
  })

  it('should show appropriate status messages throughout the workflow', async () => {
    render(<App />)
    
    // Should show initial message
    expect(screen.getByText('Select a source format to begin')).toBeInTheDocument()
    
    // Select source format
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    await waitFor(() => {
      expect(screen.getByText('Select a target format')).toBeInTheDocument()
    })
    
    // Select target format
    const targetSection = screen.getByText('Target Format').closest('div')!
    const xmlCards = targetSection.querySelectorAll('.MuiCard-root')
    if (xmlCards[1]) await user.click(xmlCards[1])
    
    await waitFor(() => {
      expect(screen.getByText('Upload a file or load sample data')).toBeInTheDocument()
    })
  })
})
