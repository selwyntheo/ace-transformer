import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUpload from '../../components/FileUpload'

// Mock the file utilities
vi.mock('../../utils/formatUtils', () => ({
  detectFormatFromFileName: vi.fn(),
  detectFormatFromContent: vi.fn(),
  formatFileSize: vi.fn((size) => `${size} bytes`),
  isValidFileType: vi.fn(),
}))

import { detectFormatFromFileName, detectFormatFromContent, isValidFileType } from '../../utils/formatUtils'

describe('FileUpload', () => {
  const mockOnFileUpload = vi.fn()
  const mockOnFileRemove = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default mock returns
    vi.mocked(detectFormatFromFileName).mockReturnValue('JSON')
    vi.mocked(detectFormatFromContent).mockReturnValue('JSON')
    vi.mocked(isValidFileType).mockReturnValue(true)
  })

  it('should render upload area when no file is uploaded', () => {
    render(
      <FileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        uploadedFile={null}
        fileName={null}
      />
    )

    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument()
    expect(screen.getByText(/click to select/i)).toBeInTheDocument()
  })

  it('should show uploaded file when file is provided', () => {
    render(
      <FileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        uploadedFile='{"name": "test"}'
        fileName="test.json"
      />
    )

    expect(screen.getByText('test.json')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
  })

  it('should handle file selection via input', async () => {
    const file = new File(['{"name": "test"}'], 'test.json', { type: 'application/json' })
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null,
      onerror: null,
      result: '{"name": "test"}'
    }
    
    const FileReaderSpy = vi.fn(() => mockFileReader)
    vi.stubGlobal('FileReader', FileReaderSpy)

    render(
      <FileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        uploadedFile={null}
        fileName={null}
      />
    )

    const fileInput = screen.getByRole('button').querySelector('input[type="file"]')
    if (fileInput) {
      await user.upload(fileInput, file)
      
      // Simulate successful file read
      if (mockFileReader.onload) {
        mockFileReader.onload({} as ProgressEvent<FileReader>)
      }

      await waitFor(() => {
        expect(mockOnFileUpload).toHaveBeenCalledWith('{"name": "test"}', 'test.json', 'JSON')
      })
    }
  })

  it('should show error for invalid file type', async () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    vi.mocked(isValidFileType).mockReturnValue(false)

    render(
      <FileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        uploadedFile={null}
        fileName={null}
      />
    )

    const fileInput = screen.getByRole('button').querySelector('input[type="file"]')
    if (fileInput) {
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument()
        expect(mockOnFileUpload).not.toHaveBeenCalled()
      })
    }
  })

  it('should show error for file too large', async () => {
    const largeContent = 'x'.repeat(11 * 1024 * 1024) // 11MB
    const largeFile = new File([largeContent], 'large.json', { type: 'application/json' })

    render(
      <FileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        uploadedFile={null}
        fileName={null}
        maxSize={10 * 1024 * 1024} // 10MB
      />
    )

    const fileInput = screen.getByRole('button').querySelector('input[type="file"]')
    if (fileInput) {
      await user.upload(fileInput, largeFile)

      await waitFor(() => {
        expect(screen.getByText(/file too large/i)).toBeInTheDocument()
        expect(mockOnFileUpload).not.toHaveBeenCalled()
      })
    }
  })

  it('should allow file removal', async () => {
    render(
      <FileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        uploadedFile='{"test": true}'
        fileName="test.json"
      />
    )

    const removeButton = screen.getByRole('button', { name: /remove/i })
    await user.click(removeButton)

    expect(mockOnFileRemove).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(
      <FileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        uploadedFile={null}
        fileName={null}
        disabled={true}
      />
    )

    const uploadArea = screen.getByText(/drag and drop/i).closest('div')
    expect(uploadArea).toHaveStyle('opacity: 0.6')
  })

  it('should handle file read errors', async () => {
    const file = new File(['content'], 'test.json', { type: 'application/json' })

    // Mock FileReader with error
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null,
      onerror: null,
      result: null
    }
    
    vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))

    render(
      <FileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        uploadedFile={null}
        fileName={null}
      />
    )

    const fileInput = screen.getByRole('button').querySelector('input[type="file"]')
    if (fileInput) {
      await user.upload(fileInput, file)

      // Simulate file read error
      if (mockFileReader.onerror) {
        mockFileReader.onerror({} as ProgressEvent<FileReader>)
      }

      await waitFor(() => {
        expect(screen.getByText(/error reading file/i)).toBeInTheDocument()
      })
    }
  })

  it('should show loading state during file processing', async () => {
    const file = new File(['{"processing": true}'], 'test.json', { type: 'application/json' })

    render(
      <FileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        uploadedFile={null}
        fileName={null}
      />
    )

    const fileInput = screen.getByRole('button').querySelector('input[type="file"]')
    if (fileInput) {
      await user.upload(fileInput, file)

      // Should show loading indicator during processing
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    }
  })

  it('should detect format from file name and content', async () => {
    const file = new File(['<root>test</root>'], 'test.xml', { type: 'application/xml' })
    vi.mocked(detectFormatFromFileName).mockReturnValue('XML')
    vi.mocked(detectFormatFromContent).mockReturnValue('XML')

    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null,
      onerror: null,
      result: '<root>test</root>'
    }
    
    vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))

    render(
      <FileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        uploadedFile={null}
        fileName={null}
      />
    )

    const fileInput = screen.getByRole('button').querySelector('input[type="file"]')
    if (fileInput) {
      await user.upload(fileInput, file)

      // Simulate successful file read
      if (mockFileReader.onload) {
        mockFileReader.onload({} as ProgressEvent<FileReader>)
      }

      await waitFor(() => {
        expect(detectFormatFromFileName).toHaveBeenCalledWith('test.xml')
        expect(detectFormatFromContent).toHaveBeenCalledWith('<root>test</root>')
        expect(mockOnFileUpload).toHaveBeenCalledWith('<root>test</root>', 'test.xml', 'XML')
      })
    }
  })
})
})
