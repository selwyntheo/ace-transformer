import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import AdvancedTransform from '../../pages/AdvancedTransform'
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
    if (format === 'CSV') return 'name,age\nSample,25'
    return 'Sample text data'
  }),
  detectFormatFromFileName: vi.fn(),
  detectFormatFromContent: vi.fn(),
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

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('AdvancedTransform', () => {
  const user = userEvent.setup()
  const mockTransform = vi.mocked(TransformationService.transform)
  const mockAdvancedTransform = vi.mocked(TransformationService.advancedTransform)

  beforeEach(() => {
    vi.clearAllMocks()
    mockTransform.mockResolvedValue({
      outputData: '{"result": "success"}',
      success: true,
      processingTimeMs: 100
    })
    mockAdvancedTransform.mockResolvedValue({
      outputData: '{"advanced": "result"}',
      success: true,
      processingTimeMs: 150
    })
  })

  it('should render with both quick and advanced tabs', () => {
    renderWithTheme(<AdvancedTransform />)
    
    expect(screen.getByText('Advanced Transform')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /quick transform/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /advanced mapping/i })).toBeInTheDocument()
  })

  it('should show quick transform tab by default', () => {
    renderWithTheme(<AdvancedTransform />)
    
    expect(screen.getByText('Source Format')).toBeInTheDocument()
    expect(screen.getByText('Target Format')).toBeInTheDocument()
    expect(screen.getByText('Upload File')).toBeInTheDocument()
  })

  it('should switch to advanced mapping tab', async () => {
    renderWithTheme(<AdvancedTransform />)
    
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    expect(screen.getByText('Transformation Steps')).toBeInTheDocument()
    expect(screen.getByText('Select Source Format')).toBeInTheDocument()
  })

  it('should show stepper in advanced mode', async () => {
    renderWithTheme(<AdvancedTransform />)
    
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    expect(screen.getByText('Select Source Format')).toBeInTheDocument()
    expect(screen.getByText('Select Target Format')).toBeInTheDocument()
    expect(screen.getByText('Upload Source Data')).toBeInTheDocument()
    expect(screen.getByText('Configure Field Mappings')).toBeInTheDocument()
    expect(screen.getByText('Transform & Review Results')).toBeInTheDocument()
  })

  it('should advance stepper when formats are selected', async () => {
    renderWithTheme(<AdvancedTransform />)
    
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    // Select source format
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    // Select target format
    const targetSection = screen.getByText('Target Format').closest('div')!
    const xmlCard = targetSection.querySelector('.MuiCard-root')
    if (xmlCard) await user.click(xmlCard)
    
    // Should advance to upload step
    expect(screen.getByText('Upload your data file or use sample data')).toBeInTheDocument()
  })

  it('should perform quick transform', async () => {
    renderWithTheme(<AdvancedTransform />)
    
    // Stay on quick transform tab and set up transformation
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    const targetSection = screen.getByText('Target Format').closest('div')!
    const xmlCard = targetSection.querySelector('.MuiCard-root')
    if (xmlCard) await user.click(xmlCard)
    
    // Load sample data
    const jsonSampleButton = screen.getByRole('button', { name: /json sample/i })
    await user.click(jsonSampleButton)
    
    // Click transform
    const transformButton = screen.getByRole('button', { name: /quick transform/i })
    await user.click(transformButton)
    
    await waitFor(() => {
      expect(mockTransform).toHaveBeenCalledWith({
        inputData: '{"name":"Sample","age":25}',
        sourceFormat: 'JSON',
        targetFormat: 'XML',
      })
    })
  })

  it('should perform advanced transform with field mappings', async () => {
    renderWithTheme(<AdvancedTransform />)
    
    // Switch to advanced tab
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    // Complete setup steps
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    const targetSection = screen.getByText('Target Format').closest('div')!
    const xmlCard = targetSection.querySelector('.MuiCard-root')
    if (xmlCard) await user.click(xmlCard)
    
    // Go to upload step
    const goToUploadStep = screen.getByText('Go to Step')
    await user.click(goToUploadStep)
    
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
    })
  })

  it('should show error handling', async () => {
    mockTransform.mockRejectedValue(new Error('Transform failed'))
    
    renderWithTheme(<AdvancedTransform />)
    
    // Set up quick transform
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    const targetSection = screen.getByText('Target Format').closest('div')!
    const xmlCard = targetSection.querySelector('.MuiCard-root')
    if (xmlCard) await user.click(xmlCard)
    
    const jsonSampleButton = screen.getByRole('button', { name: /json sample/i })
    await user.click(jsonSampleButton)
    
    const transformButton = screen.getByRole('button', { name: /quick transform/i })
    await user.click(transformButton)
    
    await waitFor(() => {
      expect(screen.getByText(/transform failed/i)).toBeInTheDocument()
    })
  })

  it('should handle reset functionality', async () => {
    renderWithTheme(<AdvancedTransform />)
    
    // Set up some state
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    const resetButton = screen.getByRole('button', { name: /reset/i })
    await user.click(resetButton)
    
    // Should reset back to initial state
    expect(screen.getByText('Select a source format to begin')).toBeInTheDocument()
  })

  it('should show appropriate status messages', async () => {
    renderWithTheme(<AdvancedTransform />)
    
    // Switch to advanced mode
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    // Should show initial message
    expect(screen.getByText('Select a source format to begin')).toBeInTheDocument()
    
    // Select source format
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    await waitFor(() => {
      expect(screen.getByText('Select a target format')).toBeInTheDocument()
    })
  })

  it('should disable buttons appropriately', () => {
    renderWithTheme(<AdvancedTransform />)
    
    // Transform buttons should be disabled initially
    const quickTransformButton = screen.getByRole('button', { name: /quick transform/i })
    expect(quickTransformButton).toBeDisabled()
  })

  it('should handle file upload in advanced mode', async () => {
    renderWithTheme(<AdvancedTransform />)
    
    // Switch to advanced tab
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    // Set up formats
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    const targetSection = screen.getByText('Target Format').closest('div')!
    const xmlCard = targetSection.querySelector('.MuiCard-root')
    if (xmlCard) await user.click(xmlCard)
    
    // Navigate to upload step
    const uploadStepButton = screen.getAllByText('Go to Step')[2] // Upload is step 3
    await user.click(uploadStepButton)
    
    expect(screen.getByText('Upload File')).toBeInTheDocument()
  })

  it('should show field mapping interface when data is loaded', async () => {
    renderWithTheme(<AdvancedTransform />)
    
    // Switch to advanced tab
    const advancedTab = screen.getByRole('tab', { name: /advanced mapping/i })
    await user.click(advancedTab)
    
    // Complete all setup steps
    const sourceSection = screen.getByText('Source Format').closest('div')!
    const jsonCard = sourceSection.querySelector('.MuiCard-root')
    if (jsonCard) await user.click(jsonCard)
    
    const targetSection = screen.getByText('Target Format').closest('div')!
    const xmlCard = targetSection.querySelector('.MuiCard-root')
    if (xmlCard) await user.click(xmlCard)
    
    // Load sample data
    const jsonSampleButton = screen.getByRole('button', { name: /json sample/i })
    await user.click(jsonSampleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Field Mapping')).toBeInTheDocument()
    })
  })
})
