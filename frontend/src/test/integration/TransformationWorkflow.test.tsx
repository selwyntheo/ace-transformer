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
      outputData: '{"name":"John","age":30}',
      success: true,
      processingTimeMs: 100
    })
  })

  describe('Complete Transformation Workflow', () => {
    it('should complete JSON to XML transformation workflow', async () => {
      renderWithTheme(<QuickTransform />)

      // Find source format section and select JSON (first card)
      const sourceSection = screen.getByText('Source Format').closest('div')!
      const sourceCards = sourceSection.querySelectorAll('.MuiCard-root')
      await user.click(sourceCards[0]) // JSON

      // Find target format section and select XML (second card)
      const targetSection = screen.getByText('Target Format').closest('div')!
      const targetCards = targetSection.querySelectorAll('.MuiCard-root')
      await user.click(targetCards[1]) // XML

      // Upload file using the hidden file input from react-dropzone
      const fileInput = screen.getByRole('textbox', { hidden: true }) || 
                       document.querySelector('input[type="file"]')
      expect(fileInput).toBeTruthy()
      
      const file = new File(['{"name":"John","age":30}'], 'test.json', { type: 'application/json' })
      await user.upload(fileInput as HTMLInputElement, file)

      // Click transform button
      const transformButton = screen.getByRole('button', { name: /transform data/i })
      await user.click(transformButton)

      // Verify API call
      await waitFor(() => {
        expect(mockTransform).toHaveBeenCalledWith({
          inputData: '{"name":"John","age":30}',
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

      // Find source format section and select CSV (third card)
      const sourceSection = screen.getByText('Source Format').closest('div')!
      const sourceCards = sourceSection.querySelectorAll('.MuiCard-root')
      await user.click(sourceCards[2]) // CSV

      // Find target format section and select JSON (first card)
      const targetSection = screen.getByText('Target Format').closest('div')!
      const targetCards = targetSection.querySelectorAll('.MuiCard-root')
      await user.click(targetCards[0]) // JSON

      // Upload CSV file
      const fileInput = document.querySelector('input[type="file"]')!
      const csvData = 'name,age\nJohn,30\nJane,25'
      const file = new File([csvData], 'test.csv', { type: 'text/csv' })
      
      await user.upload(fileInput as HTMLInputElement, file)

      // Click transform button
      const transformButton = screen.getByRole('button', { name: /transform data/i })
      await user.click(transformButton)

      // Verify API call
      await waitFor(() => {
        expect(mockTransform).toHaveBeenCalledWith({
          inputData: csvData,
          sourceFormat: 'CSV',
          targetFormat: 'JSON'
        })
      })

      // Verify result display
      await waitFor(() => {
        expect(screen.getByText('Transformation Result')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API transformation error', async () => {
      mockTransform.mockRejectedValue(new Error('Transformation failed'))
      
      renderWithTheme(<QuickTransform />)

      // Select formats
      const sourceSection = screen.getByText('Source Format').closest('div')!
      const sourceCards = sourceSection.querySelectorAll('.MuiCard-root')
      await user.click(sourceCards[0]) // JSON

      const targetSection = screen.getByText('Target Format').closest('div')!
      const targetCards = targetSection.querySelectorAll('.MuiCard-root')
      await user.click(targetCards[1]) // XML

      // Upload file
      const fileInput = document.querySelector('input[type="file"]')!
      const file = new File(['{"name":"John"}'], 'test.json', { type: 'application/json' })
      await user.upload(fileInput as HTMLInputElement, file)

      // Attempt transformation
      const transformButton = screen.getByRole('button', { name: /transform data/i })
      await user.click(transformButton)

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Result Actions', () => {
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

      // Complete transformation
      const sourceSection = screen.getByText('Source Format').closest('div')!
      const sourceCards = sourceSection.querySelectorAll('.MuiCard-root')
      await user.click(sourceCards[0]) // JSON

      const targetSection = screen.getByText('Target Format').closest('div')!
      const targetCards = targetSection.querySelectorAll('.MuiCard-root')
      await user.click(targetCards[1]) // XML

      const fileInput = document.querySelector('input[type="file"]')!
      const file = new File(['{"name":"John"}'], 'test.json', { type: 'application/json' })
      await user.upload(fileInput as HTMLInputElement, file)

      const transformButton = screen.getByRole('button', { name: /transform data/i })
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
  })
})
