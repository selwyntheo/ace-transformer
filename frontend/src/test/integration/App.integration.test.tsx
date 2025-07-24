import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    if (format === 'CSV') return 'name,age\\nSample,25'
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
      outputData: '{"transformed": "data"}',
      success: true,
      processingTimeMs: 100
    })
    mockAdvancedTransform.mockResolvedValue({
      outputData: '{"advanced": "transformation"}',
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
