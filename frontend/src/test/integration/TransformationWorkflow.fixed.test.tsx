import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import QuickTransform from '../../pages/QuickTransform'
import * as api from '../../services/api'

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    transform: vi.fn(),
  },
}))

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('QuickTransform Integration Tests', () => {
  const user = userEvent.setup()
  const mockTransform = vi.mocked(api.default.transform)

  beforeEach(() => {
    vi.clearAllMocks()
    mockTransform.mockResolvedValue({
      transformedData: '{"name":"John","age":30}',
      success: true,
      processingTimeMs: 100
    })
  })

  describe('Complete Transformation Workflow', () => {
    it('should complete JSON to XML transformation workflow', async () => {
      renderWithTheme(<QuickTransform />)

      // Find source format section and select JSON
      const sourceSection = screen.getByText('Source Format').closest('div')!
      const jsonSourceCard = sourceSection.querySelector('[data-testid]') || 
                            sourceSection.querySelectorAll('.MuiCard-root')[0]
      await user.click(jsonSourceCard)

      // Find target format section and select XML
      const targetSection = screen.getByText('Target Format').closest('div')!
      const xmlTargetCard = targetSection.querySelectorAll('.MuiCard-root')[1] // XML is second card
      await user.click(xmlTargetCard)

      // Upload file
      const fileInput = screen.getByLabelText(/upload file/i)
      const file = new File(['{"name":"John","age":30}'], 'test.json', { type: 'application/json' })
      
      await user.upload(fileInput, file)

      // Click transform button
      const transformButton = screen.getByRole('button', { name: /transform/i })
      await user.click(transformButton)

      // Verify API call
      await waitFor(() => {
        expect(mockTransform).toHaveBeenCalledWith({
          sourceData: '{"name":"John","age":30}',
          sourceFormat: 'JSON',
          targetFormat: 'XML'
        })
      })

      // Verify result display
      await waitFor(() => {
        expect(screen.getByText('Transformation Result')).toBeInTheDocument()
      })
    })

    it('should complete CSV to JSON transformation workflow', async () => {
      renderWithTheme(<QuickTransform />)

      // Find source format section and select CSV
      const sourceSection = screen.getByText('Source Format').closest('div')!
      const csvSourceCard = sourceSection.querySelectorAll('.MuiCard-root')[2] // CSV is third card
      await user.click(csvSourceCard)

      // Find target format section and select JSON
      const targetSection = screen.getByText('Target Format').closest('div')!
      const jsonTargetCard = targetSection.querySelectorAll('.MuiCard-root')[0] // JSON is first card
      await user.click(jsonTargetCard)

      // Upload CSV file
      const fileInput = screen.getByLabelText(/upload file/i)
      const csvData = 'name,age\nJohn,30\nJane,25'
      const file = new File([csvData], 'test.csv', { type: 'text/csv' })
      
      await user.upload(fileInput, file)

      // Click transform button
      const transformButton = screen.getByRole('button', { name: /transform/i })
      await user.click(transformButton)

      // Verify API call
      await waitFor(() => {
        expect(mockTransformData).toHaveBeenCalledWith({
          sourceFormat: 'CSV',
          targetFormat: 'JSON',
          data: csvData,
          fieldMappings: []
        })
      })

      // Verify result display
      await waitFor(() => {
        expect(screen.getByText('Transformation Result')).toBeInTheDocument()
      })
    })

    it('should complete XML to CSV transformation workflow', async () => {
      renderWithTheme(<QuickTransform />)

      // Find source format section and select XML
      const sourceSection = screen.getByText('Source Format').closest('div')!
      const xmlSourceCard = sourceSection.querySelectorAll('.MuiCard-root')[1] // XML is second card
      await user.click(xmlSourceCard)

      // Find target format section and select CSV
      const targetSection = screen.getByText('Target Format').closest('div')!
      const csvTargetCard = targetSection.querySelectorAll('.MuiCard-root')[2] // CSV is third card
      await user.click(csvTargetCard)

      // Upload XML file
      const fileInput = screen.getByLabelText(/upload file/i)
      const xmlData = '<person><name>John</name><age>30</age></person>'
      const file = new File([xmlData], 'test.xml', { type: 'text/xml' })
      
      await user.upload(fileInput, file)

      // Click transform button
      const transformButton = screen.getByRole('button', { name: /transform/i })
      await user.click(transformButton)

      // Verify API call
      await waitFor(() => {
        expect(mockTransformData).toHaveBeenCalledWith({
          sourceFormat: 'XML',
          targetFormat: 'CSV',
          data: xmlData,
          fieldMappings: []
        })
      })

      // Verify result display
      await waitFor(() => {
        expect(screen.getByText('Transformation Result')).toBeInTheDocument()
      })
    })

    it('should complete TXT to JSON transformation workflow', async () => {
      renderWithTheme(<QuickTransform />)

      // Find source format section and select TXT
      const sourceSection = screen.getByText('Source Format').closest('div')!
      const txtSourceCard = sourceSection.querySelectorAll('.MuiCard-root')[3] // TXT is fourth card
      await user.click(txtSourceCard)

      // Find target format section and select JSON
      const targetSection = screen.getByText('Target Format').closest('div')!
      const jsonTargetCard = targetSection.querySelectorAll('.MuiCard-root')[0] // JSON is first card
      await user.click(jsonTargetCard)

      // Upload TXT file
      const fileInput = screen.getByLabelText(/upload file/i)
      const txtData = 'John,30\nJane,25'
      const file = new File([txtData], 'test.txt', { type: 'text/plain' })
      
      await user.upload(fileInput, file)

      // Click transform button
      const transformButton = screen.getByRole('button', { name: /transform/i })
      await user.click(transformButton)

      // Verify API call
      await waitFor(() => {
        expect(mockTransformData).toHaveBeenCalledWith({
          sourceFormat: 'TXT',
          targetFormat: 'JSON',
          data: txtData,
          fieldMappings: []
        })
      })

      // Verify result display
      await waitFor(() => {
        expect(screen.getByText('Transformation Result')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling in Transformation Workflow', () => {
    it('should handle invalid file type error', async () => {
      mockTransformData.mockRejectedValue(new Error('Invalid file type'))
      
      renderWithTheme(<QuickTransform />)

      // Select formats
      const sourceSection = screen.getByText('Source Format').closest('div')!
      const jsonSourceCard = sourceSection.querySelectorAll('.MuiCard-root')[0]
      await user.click(jsonSourceCard)

      const targetSection = screen.getByText('Target Format').closest('div')!
      const xmlTargetCard = targetSection.querySelectorAll('.MuiCard-root')[1]
      await user.click(xmlTargetCard)

      // Upload file
      const fileInput = screen.getByLabelText(/upload file/i)
      const file = new File(['invalid'], 'test.json', { type: 'application/json' })
      await user.upload(fileInput, file)

      // Attempt transformation
      const transformButton = screen.getByRole('button', { name: /transform/i })
      await user.click(transformButton)

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })

    it('should handle API transformation error', async () => {
      mockTransformData.mockRejectedValue(new Error('Transformation failed'))
      
      renderWithTheme(<QuickTransform />)

      // Select formats
      const sourceSection = screen.getByText('Source Format').closest('div')!
      const jsonSourceCard = sourceSection.querySelectorAll('.MuiCard-root')[0]
      await user.click(jsonSourceCard)

      const targetSection = screen.getByText('Target Format').closest('div')!
      const xmlTargetCard = targetSection.querySelectorAll('.MuiCard-root')[1]
      await user.click(xmlTargetCard)

      // Upload file
      const fileInput = screen.getByLabelText(/upload file/i)
      const file = new File(['{"name":"John"}'], 'test.json', { type: 'application/json' })
      await user.upload(fileInput, file)

      // Attempt transformation
      const transformButton = screen.getByRole('button', { name: /transform/i })
      await user.click(transformButton)

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })

    it('should handle network timeout error', async () => {
      mockTransformData.mockRejectedValue(new Error('Network timeout'))
      
      renderWithTheme(<QuickTransform />)

      // Complete setup steps
      const sourceSection = screen.getByText('Source Format').closest('div')!
      const jsonSourceCard = sourceSection.querySelectorAll('.MuiCard-root')[0]
      await user.click(jsonSourceCard)

      const targetSection = screen.getByText('Target Format').closest('div')!
      const xmlTargetCard = targetSection.querySelectorAll('.MuiCard-root')[1]
      await user.click(xmlTargetCard)

      const fileInput = screen.getByLabelText(/upload file/i)
      const file = new File(['{"name":"John"}'], 'test.json', { type: 'application/json' })
      await user.upload(fileInput, file)

      // Attempt transformation
      const transformButton = screen.getByRole('button', { name: /transform/i })
      await user.click(transformButton)

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Transformation Result Actions', () => {
    it('should allow copying result to clipboard', async () => {
      // Mock clipboard properly for JSDOM
      const mockWriteText = vi.fn()
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText,
        },
        writable: true,
      })

      renderWithTheme(<QuickTransform />)

      // Complete transformation (abbreviated for test focus)
      const sourceSection = screen.getByText('Source Format').closest('div')!
      const jsonSourceCard = sourceSection.querySelectorAll('.MuiCard-root')[0]
      await user.click(jsonSourceCard)

      const targetSection = screen.getByText('Target Format').closest('div')!
      const xmlTargetCard = targetSection.querySelectorAll('.MuiCard-root')[1]
      await user.click(xmlTargetCard)

      const fileInput = screen.getByLabelText(/upload file/i)
      const file = new File(['{"name":"John"}'], 'test.json', { type: 'application/json' })
      await user.upload(fileInput, file)

      const transformButton = screen.getByRole('button', { name: /transform/i })
      await user.click(transformButton)

      // Wait for result and find copy button
      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copy/i })
        expect(copyButton).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /copy/i })
      await user.click(copyButton)

      // Verify clipboard interaction
      expect(mockWriteText).toHaveBeenCalledWith('{"name":"John","age":30}')
    })

    it('should allow clearing transformation result', async () => {
      renderWithTheme(<QuickTransform />)

      // Complete transformation (abbreviated)
      const sourceSection = screen.getByText('Source Format').closest('div')!
      const jsonSourceCard = sourceSection.querySelectorAll('.MuiCard-root')[0]
      await user.click(jsonSourceCard)

      const targetSection = screen.getByText('Target Format').closest('div')!
      const xmlTargetCard = targetSection.querySelectorAll('.MuiCard-root')[1]
      await user.click(xmlTargetCard)

      const fileInput = screen.getByLabelText(/upload file/i)
      const file = new File(['{"name":"John"}'], 'test.json', { type: 'application/json' })
      await user.upload(fileInput, file)

      const transformButton = screen.getByRole('button', { name: /transform/i })
      await user.click(transformButton)

      // Wait for result and find clear button
      await waitFor(() => {
        const clearButton = screen.getByRole('button', { name: /clear/i })
        expect(clearButton).toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      // Verify result is cleared
      await waitFor(() => {
        expect(screen.queryByText('Transformation Result')).not.toBeInTheDocument()
      })
    })
  })

  describe('Large File Handling', () => {
    it('should handle large file transformations', async () => {
      renderWithTheme(<QuickTransform />)

      // Create a large JSON file (simulated)
      const largeJsonData = JSON.stringify({
        users: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `User ${i}`,
          email: `user${i}@example.com`
        }))
      })

      // Test with large file
      const sourceSection = screen.getByText('Source Format').closest('div')!
      const jsonSourceCard = sourceSection.querySelectorAll('.MuiCard-root')[0]
      await user.click(jsonSourceCard)

      const targetSection = screen.getByText('Target Format').closest('div')!
      const csvTargetCard = targetSection.querySelectorAll('.MuiCard-root')[2]
      await user.click(csvTargetCard)

      const fileInput = screen.getByLabelText(/upload file/i)
      const file = new File([largeJsonData], 'large.json', { type: 'application/json' })
      await user.upload(fileInput, file)

      const transformButton = screen.getByRole('button', { name: /transform/i })
      await user.click(transformButton)

      // Verify API handles large file
      await waitFor(() => {
        expect(mockTransformData).toHaveBeenCalledWith({
          sourceFormat: 'JSON',
          targetFormat: 'CSV',
          data: largeJsonData,
          fieldMappings: []
        })
      })
    })
  })
})
