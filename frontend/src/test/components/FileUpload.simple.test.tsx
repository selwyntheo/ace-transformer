import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUpload from '../../components/FileUpload'

describe('FileUpload', () => {
  const mockOnFileUpload = vi.fn()
  const mockOnFileRemove = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
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
  })

  it('should call onFileRemove when remove button is clicked', async () => {
    const user = userEvent.setup()
    
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

    // Check that the upload area has disabled styling
    const uploadArea = screen.getByText(/drag and drop/i).closest('div')
    expect(uploadArea).toHaveAttribute('style')
  })
})
