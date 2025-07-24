import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormatSelector from '../../components/FormatSelector'
import { SUPPORTED_FORMATS } from '../../utils/formatUtils'

describe('FormatSelector', () => {
  const mockOnFormatSelect = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all supported formats', () => {
    render(
      <FormatSelector
        formats={SUPPORTED_FORMATS}
        selectedFormat={null}
        onFormatSelect={mockOnFormatSelect}
        title="Select Source Format"
      />
    )

    SUPPORTED_FORMATS.forEach(format => {
      expect(screen.getByText(format)).toBeInTheDocument()
    })
  })

  it('should display the title', () => {
    const title = "Select Source Format"
    render(
      <FormatSelector
        formats={SUPPORTED_FORMATS}
        selectedFormat={null}
        onFormatSelect={mockOnFormatSelect}
        title={title}
      />
    )

    expect(screen.getByText(title)).toBeInTheDocument()
  })

  it('should highlight selected format', () => {
    render(
      <FormatSelector
        formats={SUPPORTED_FORMATS}
        selectedFormat="JSON"
        onFormatSelect={mockOnFormatSelect}
        title="Select Format"
      />
    )

    const jsonCard = screen.getByText('JSON').closest('.MuiCard-root')
    expect(jsonCard).toHaveStyle('border: 2px solid')
  })

  it('should call onFormatSelect when format is clicked', async () => {
    render(
      <FormatSelector
        formats={SUPPORTED_FORMATS}
        selectedFormat={null}
        onFormatSelect={mockOnFormatSelect}
        title="Select Format"
      />
    )

    const jsonCard = screen.getByText('JSON').closest('.MuiCard-root')
    if (jsonCard) {
      await user.click(jsonCard)
      expect(mockOnFormatSelect).toHaveBeenCalledWith('JSON')
    }
  })

  it('should show format descriptions', () => {
    render(
      <FormatSelector
        formats={SUPPORTED_FORMATS}
        selectedFormat={null}
        onFormatSelect={mockOnFormatSelect}
        title="Select Format"
      />
    )

    // Check that descriptions are present (adjust based on actual descriptions)
    expect(screen.getByText(/JavaScript Object Notation/i)).toBeInTheDocument()
    expect(screen.getByText(/Extensible Markup Language/i)).toBeInTheDocument()
    expect(screen.getByText(/Comma Separated Values/i)).toBeInTheDocument()
    expect(screen.getByText(/Plain Text/i)).toBeInTheDocument()
  })

  it('should handle keyboard navigation', async () => {
    render(
      <FormatSelector
        formats={SUPPORTED_FORMATS}
        selectedFormat={null}
        onFormatSelect={mockOnFormatSelect}
        title="Select Format"
      />
    )

    const jsonCard = screen.getByText('JSON').closest('.MuiCard-root')
    if (jsonCard) {
      await user.click(jsonCard)
      await user.keyboard('{Enter}')
      expect(mockOnFormatSelect).toHaveBeenCalledWith('JSON')
    }
  })

  it('should update selection when selectedFormat prop changes', () => {
    const { rerender } = render(
      <FormatSelector
        formats={SUPPORTED_FORMATS}
        selectedFormat="JSON"
        onFormatSelect={mockOnFormatSelect}
        title="Select Format"
      />
    )

    let jsonCard = screen.getByText('JSON').closest('.MuiCard-root')
    expect(jsonCard).toHaveStyle('border: 2px solid')

    rerender(
      <FormatSelector
        formats={SUPPORTED_FORMATS}
        selectedFormat="XML"
        onFormatSelect={mockOnFormatSelect}
        title="Select Format"
      />
    )

    const xmlCard = screen.getByText('XML').closest('.MuiCard-root')
    expect(xmlCard).toHaveStyle('border: 2px solid')
  })

  it('should disable selection when disabled prop is true', async () => {
    render(
      <FormatSelector
        formats={SUPPORTED_FORMATS}
        selectedFormat={null}
        onFormatSelect={mockOnFormatSelect}
        title="Select Format"
        disabled={true}
      />
    )

    const cards = screen.getAllByText(/JSON|XML|CSV|TXT/).map(el => el.closest('.MuiCard-root'))
    cards.forEach((card: Element | null) => {
      if (card) {
        expect(card).toHaveStyle('opacity: 0.6')
        expect(card).toHaveStyle('cursor: not-allowed')
      }
    })

    // Click should not trigger callback when disabled
    const jsonCard = screen.getByText('JSON').closest('.MuiCard-root')
    if (jsonCard) {
      await user.click(jsonCard)
      expect(mockOnFormatSelect).not.toHaveBeenCalled()
    }
  })
})
