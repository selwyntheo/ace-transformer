import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TransformationResult from '../../components/TransformationResult'

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
})

describe('TransformationResult', () => {
  const mockOnClear = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render transformation result with JSON data', () => {
    render(
      <TransformationResult
        result='{"name": "John", "age": 30}'
        targetFormat="JSON"
        fileName="result.json"
        processingTime={150}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText(/transformation complete/i)).toBeInTheDocument()
    expect(screen.getByText('JSON')).toBeInTheDocument()
    expect(screen.getByText(/John/)).toBeInTheDocument()
  })

  it('should render XML transformation result', () => {
    render(
      <TransformationResult
        result="<root><name>John</name><age>30</age></root>"
        targetFormat="XML"
        fileName="result.xml"
        processingTime={200}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText('XML')).toBeInTheDocument()
    expect(screen.getByText(/<root>/)).toBeInTheDocument()
  })

  it('should render CSV transformation result', () => {
    render(
      <TransformationResult
        result="name,age\nJohn,30\nJane,25"
        targetFormat="CSV"
        fileName="result.csv"
        processingTime={100}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText('CSV')).toBeInTheDocument()
    expect(screen.getByText(/name,age/)).toBeInTheDocument()
  })

  it('should handle copy to clipboard', async () => {
    render(
      <TransformationResult
        result='{"name": "John", "age": 30}'
        targetFormat="JSON"
        fileName="result.json"
        processingTime={150}
        onClear={mockOnClear}
      />
    )

    const copyButton = screen.getByRole('button', { name: /copy/i })
    await user.click(copyButton)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('{"name": "John", "age": 30}')
  })

  it('should handle download', async () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn()
    })

    // Mock document.createElement and click
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
      style: { display: '' }
    }
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any)
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any)

    render(
      <TransformationResult
        result='{"name": "John", "age": 30}'
        targetFormat="JSON"
        fileName="result.json"
        processingTime={150}
        onClear={mockOnClear}
      />
    )

    const downloadButton = screen.getByRole('button', { name: /download/i })
    await user.click(downloadButton)

    expect(document.createElement).toHaveBeenCalledWith('a')
    expect(mockAnchor.click).toHaveBeenCalled()
  })

  it('should handle clear button', async () => {
    render(
      <TransformationResult
        result='{"name": "John", "age": 30}'
        targetFormat="JSON"
        fileName="result.json"
        processingTime={150}
        onClear={mockOnClear}
      />
    )

    const clearButton = screen.getByRole('button', { name: /clear/i })
    await user.click(clearButton)

    expect(mockOnClear).toHaveBeenCalled()
  })

  it('should toggle between formatted and raw view', async () => {
    render(
      <TransformationResult
        result='{"name":"John","age":30}'
        targetFormat="JSON"
        fileName="result.json"
        processingTime={150}
        onClear={mockOnClear}
      />
    )

    // Should show formatted by default
    expect(screen.getByText(/formatted/i)).toBeInTheDocument()

    // Click raw view tab
    const rawTab = screen.getByRole('tab', { name: /raw/i })
    await user.click(rawTab)

    expect(screen.getByText(/raw/i)).toBeInTheDocument()
  })

  it('should show processing time', () => {
    render(
      <TransformationResult
        result='{"name": "John", "age": 30}'
        targetFormat="JSON"
        fileName="result.json"
        processingTime={2500}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText(/2.5s/i)).toBeInTheDocument()
  })

  it('should handle long processing times', () => {
    render(
      <TransformationResult
        result='{"name": "John", "age": 30}'
        targetFormat="JSON"
        fileName="result.json"
        processingTime={75000} // 75 seconds
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText(/75s/i)).toBeInTheDocument()
  })

  it('should handle null result', () => {
    render(
      <TransformationResult
        result={null}
        targetFormat={null}
        fileName={undefined}
        processingTime={undefined}
        onClear={mockOnClear}
      />
    )

    // Should not crash and should show appropriate state
    expect(screen.queryByText(/transformation complete/i)).not.toBeInTheDocument()
  })

  it('should handle empty result', () => {
    render(
      <TransformationResult
        result=""
        targetFormat="JSON"
        fileName="empty.json"
        processingTime={50}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText('JSON')).toBeInTheDocument()
    expect(screen.getByText(/50ms/i)).toBeInTheDocument()
  })

  it('should show appropriate file extension for target format', () => {
    render(
      <TransformationResult
        result="<data>test</data>"
        targetFormat="XML"
        fileName="result"
        processingTime={100}
        onClear={mockOnClear}
      />
    )

    // Should append .xml extension for XML format
    expect(screen.getByText(/\.xml/i)).toBeInTheDocument()
  })
})
