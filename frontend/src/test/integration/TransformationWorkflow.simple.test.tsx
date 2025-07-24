import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from    // Upload file
    const file = new File([jsonContent], 'data.json', { type: 'application/json' })
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: jsonContent
    }
    vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))

    const fileInput = screen.getByRole('button').querySelector('input[type="file"]')
    if (fileInput) {
      await user.upload(fileInput as HTMLInputElement, file)
      if (mockFileReader.onload) {
        mockFileReader.onload({})
      }
    }y/user-event'
import { TransformationService } from '../../services/api'
import QuickTransform from '../../pages/QuickTransform'

// Mock the TransformationService
vi.mock('../../services/api', () => ({
  TransformationService: {
    transform: vi.fn(),
  },
}))

// Mock file utilities
vi.mock('../../utils/formatUtils', () => ({
  detectFormatFromFileName: vi.fn(),
  detectFormatFromContent: vi.fn(),
  formatFileSize: vi.fn((size) => `${size} bytes`),
  isValidFileType: vi.fn(),
  downloadFile: vi.fn(),
  copyToClipboard: vi.fn(),
  SUPPORTED_FORMATS: ['JSON', 'XML', 'CSV', 'TXT'],
  FORMAT_DESCRIPTIONS: {
    JSON: 'JavaScript Object Notation - structured data format',
    XML: 'Extensible Markup Language - markup format',
    CSV: 'Comma Separated Values - tabular data format',
    TXT: 'Plain Text - unstructured text format'
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

import { detectFormatFromFileName, detectFormatFromContent, isValidFileType } from '../../utils/formatUtils'

describe('Transformation Workflow Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default mock returns
    vi.mocked(detectFormatFromFileName).mockReturnValue('JSON')
    vi.mocked(detectFormatFromContent).mockReturnValue('JSON')
    vi.mocked(isValidFileType).mockReturnValue(true)
  })

  it('should display the transformation interface', async () => {
    render(<QuickTransform />)

    // Should show format selectors
    expect(screen.getByText(/select source format/i)).toBeInTheDocument()
    expect(screen.getByText(/select target format/i)).toBeInTheDocument()

    // Should show all format options
    expect(screen.getAllByText('JSON')).toHaveLength(2) // Source and target
    expect(screen.getAllByText('XML')).toHaveLength(2)
    expect(screen.getAllByText('CSV')).toHaveLength(2)
    expect(screen.getAllByText('TXT')).toHaveLength(2)

    // Should show file upload area
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument()

    // Transform button should be disabled initially
    const transformButton = screen.getByRole('button', { name: /transform/i })
    expect(transformButton).toBeDisabled()
  })

  it('should enable transform button when all requirements are met', async () => {
    render(<QuickTransform />)

    // Select source format
    const jsonSourceCards = screen.getAllByText('JSON')
    const sourceCard = jsonSourceCards[0].closest('.MuiCard-root')
    if (sourceCard) {
      await user.click(sourceCard)
    }

    // Select target format  
    const xmlTargetCards = screen.getAllByText('XML')
    const targetCard = xmlTargetCards[1].closest('.MuiCard-root')
    if (targetCard) {
      await user.click(targetCard)
    }

    // Upload file
    const jsonContent = '{"name": "John", "age": 30}'
    const file = new File([jsonContent], 'data.json', { type: 'application/json' })
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: jsonContent
    }
    vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))

    const fileInput = screen.getByRole('button').querySelector('input[type="file"]')
    if (fileInput) {
      await user.upload(fileInput as HTMLInputElement, file)
      
      // Simulate successful file read
      if (mockFileReader.onload) {
        mockFileReader.onload({})
      }
    }

    // Wait for file processing
    await waitFor(() => {
      expect(screen.getByText('data.json')).toBeInTheDocument()
    })

    // Transform button should now be enabled
    const transformButton = screen.getByRole('button', { name: /transform/i })
    expect(transformButton).not.toBeDisabled()
  })

  it('should perform successful transformation', async () => {
    const jsonContent = '{"name": "John", "age": 30}'
    const xmlResponse = '<root><name>John</name><age>30</age></root>'

    // Mock successful transformation
    vi.mocked(TransformationService.transform).mockResolvedValueOnce({
      transformedData: xmlResponse,
      processingTimeMs: 150,
      success: true
    })

    render(<QuickTransform />)

    // Setup transformation (abbreviated for brevity)
    const jsonSourceCards = screen.getAllByText('JSON')
    const sourceCard = jsonSourceCards[0].closest('.MuiCard-root')
    if (sourceCard) await user.click(sourceCard)

    const xmlTargetCards = screen.getAllByText('XML')
    const targetCard = xmlTargetCards[1].closest('.MuiCard-root')
    if (targetCard) await user.click(targetCard)

    // Upload file
    const file = new File([jsonContent], 'data.json', { type: 'application/json' })
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
      onerror: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
      result: jsonContent
    }
    vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))

    const fileInput = screen.getByRole('button').querySelector('input[type="file"]')
    if (fileInput) {
      await user.upload(fileInput as HTMLInputElement, file)
      if (mockFileReader.onload) {
        mockFileReader.onload.call(mockFileReader, {} as ProgressEvent<FileReader>)
      }
    }

    await waitFor(() => {
      expect(screen.getByText('data.json')).toBeInTheDocument()
    })

    // Start transformation
    const transformButton = screen.getByRole('button', { name: /transform/i })
    await user.click(transformButton)

    // Verify API call
    expect(TransformationService.transform).toHaveBeenCalledWith({
      sourceData: jsonContent,
      sourceFormat: 'JSON',
      targetFormat: 'XML'
    })

    // Verify result display
    await waitFor(() => {
      expect(screen.getByText(/transformation complete/i)).toBeInTheDocument()
      expect(screen.getByText(/150ms/i)).toBeInTheDocument()
    })
  })

  it('should handle transformation errors', async () => {
    const jsonContent = '{"invalid": json}'

    // Mock transformation error
    vi.mocked(TransformationService.transform).mockRejectedValueOnce(
      new Error('Invalid JSON format')
    )

    render(<QuickTransform />)

    // Setup and perform transformation (abbreviated)
    const jsonSourceCards = screen.getAllByText('JSON')
    const sourceCard = jsonSourceCards[0].closest('.MuiCard-root')
    if (sourceCard) await user.click(sourceCard)

    const xmlTargetCards = screen.getAllByText('XML')
    const targetCard = xmlTargetCards[1].closest('.MuiCard-root')
    if (targetCard) await user.click(targetCard)

    const file = new File([jsonContent], 'invalid.json', { type: 'application/json' })
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
      onerror: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
      result: jsonContent
    }
    vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))

    const fileInput = screen.getByRole('button').querySelector('input[type="file"]')
    if (fileInput) {
      await user.upload(fileInput as HTMLInputElement, file)
      if (mockFileReader.onload) {
        mockFileReader.onload.call(mockFileReader, {} as ProgressEvent<FileReader>)
      }
    }

    await waitFor(() => {
      expect(screen.getByText('invalid.json')).toBeInTheDocument()
    })

    const transformButton = screen.getByRole('button', { name: /transform/i })
    await user.click(transformButton)

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
      expect(screen.getByText(/invalid json format/i)).toBeInTheDocument()
    })
  })

  it('should reject invalid file types', async () => {
    vi.mocked(isValidFileType).mockReturnValue(false)

    render(<QuickTransform />)

    // Select formats
    const jsonSourceCards = screen.getAllByText('JSON')
    const sourceCard = jsonSourceCards[0].closest('.MuiCard-root')
    if (sourceCard) await user.click(sourceCard)

    // Try to upload invalid file
    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' })
    
    const fileInput = screen.getByRole('button').querySelector('input[type="file"]')
    if (fileInput) {
      await user.upload(fileInput as HTMLInputElement, file)
    }

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument()
    })

    // Transform button should remain disabled
    const transformButton = screen.getByRole('button', { name: /transform/i })
    expect(transformButton).toBeDisabled()
  })

  it('should clear results when clear button is clicked', async () => {
    const jsonContent = '{"name": "John"}'
    const xmlResponse = '<root><name>John</name></root>'

    vi.mocked(TransformationService.transform).mockResolvedValueOnce({
      transformedData: xmlResponse,
      processingTimeMs: 100,
      success: true
    })

    render(<QuickTransform />)

    // Perform complete transformation workflow
    const jsonSourceCards = screen.getAllByText('JSON')
    const sourceCard = jsonSourceCards[0].closest('.MuiCard-root')
    if (sourceCard) await user.click(sourceCard)

    const xmlTargetCards = screen.getAllByText('XML')
    const targetCard = xmlTargetCards[1].closest('.MuiCard-root')
    if (targetCard) await user.click(targetCard)

    const file = new File([jsonContent], 'data.json', { type: 'application/json' })
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
      onerror: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
      result: jsonContent
    }
    vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))

    const fileInput = screen.getByRole('button').querySelector('input[type="file"]')
    if (fileInput) {
      await user.upload(fileInput as HTMLInputElement, file)
      if (mockFileReader.onload) {
        mockFileReader.onload.call(mockFileReader, {} as ProgressEvent<FileReader>)
      }
    }

    await waitFor(() => {
      expect(screen.getByText('data.json')).toBeInTheDocument()
    })

    const transformButton = screen.getByRole('button', { name: /transform/i })
    await user.click(transformButton)

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText(/transformation complete/i)).toBeInTheDocument()
    })

    // Clear the result
    const clearButton = screen.getByRole('button', { name: /clear/i })
    await user.click(clearButton)

    // Result should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/transformation complete/i)).not.toBeInTheDocument()
    })
  })
})
