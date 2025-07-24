import type { FormatType } from '../services/api'

export const SUPPORTED_FORMATS: FormatType[] = ['JSON', 'XML', 'CSV', 'TXT']

export const FORMAT_EXTENSIONS: Record<FormatType, string[]> = {
  JSON: ['.json'],
  XML: ['.xml'],
  CSV: ['.csv'],
  TXT: ['.txt'],
}

export const FORMAT_MIME_TYPES: Record<FormatType, string[]> = {
  JSON: ['application/json', 'text/json'],
  XML: ['application/xml', 'text/xml'],
  CSV: ['text/csv', 'application/csv'],
  TXT: ['text/plain'],
}

export const FORMAT_DESCRIPTIONS: Record<FormatType, string> = {
  JSON: 'JavaScript Object Notation',
  XML: 'Extensible Markup Language',
  CSV: 'Comma-Separated Values',
  TXT: 'Plain Text',
}

export const FORMAT_ICONS: Record<FormatType, string> = {
  JSON: '{ }',
  XML: '< >',
  CSV: '📊',
  TXT: '📄',
}

/**
 * Detect format from file extension
 */
export function detectFormatFromFileName(fileName: string): FormatType | null {
  const extension = '.' + fileName.split('.').pop()?.toLowerCase()
  
  for (const [format, extensions] of Object.entries(FORMAT_EXTENSIONS)) {
    if (extensions.includes(extension)) {
      return format as FormatType
    }
  }
  
  return null
}

/**
 * Detect format from file content
 */
export function detectFormatFromContent(content: string): FormatType | null {
  const trimmed = content.trim()
  
  // Try JSON
  try {
    JSON.parse(trimmed)
    return 'JSON'
  } catch {}
  
  // Try XML
  if (trimmed.startsWith('<?xml') || (trimmed.startsWith('<') && trimmed.endsWith('>'))) {
    return 'XML'
  }
  
  // Try CSV (simple heuristic)
  const lines = trimmed.split('\n')
  if (lines.length > 1 && lines[0].includes(',')) {
    return 'CSV'
  }
  
  // Default to TXT
  return 'TXT'
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate file type
 */
export function isValidFileType(file: File): boolean {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  return Object.values(FORMAT_EXTENSIONS).flat().includes(extension)
}

/**
 * Extract fields from JSON data
 */
export function extractJsonFields(data: any, prefix = ''): string[] {
  const fields: string[] = []
  
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    for (const key in data) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
        fields.push(...extractJsonFields(data[key], fullKey))
      } else {
        fields.push(fullKey)
      }
    }
  }
  
  return fields
}

/**
 * Extract fields from CSV data
 */
export function extractCsvFields(csvContent: string): string[] {
  const lines = csvContent.trim().split('\n')
  if (lines.length === 0) return []
  
  return lines[0].split(',').map(field => field.trim().replace(/"/g, ''))
}

/**
 * Extract fields from XML data
 */
export function extractXmlFields(xmlContent: string): string[] {
  const tagRegex = /<([^/>]+)>/g
  const tags = new Set<string>()
  let match
  
  while ((match = tagRegex.exec(xmlContent)) !== null) {
    const tagName = match[1].split(' ')[0] // Remove attributes
    if (!tagName.startsWith('?') && !tagName.startsWith('!')) {
      tags.add(tagName)
    }
  }
  
  return Array.from(tags)
}

/**
 * Extract fields based on format
 */
export function extractFields(content: string, format: FormatType): string[] {
  try {
    switch (format) {
      case 'JSON':
        return extractJsonFields(JSON.parse(content))
      case 'CSV':
        return extractCsvFields(content)
      case 'XML':
        return extractXmlFields(content)
      case 'TXT':
        return ['line', 'content']
      default:
        return []
    }
  } catch (error) {
    console.error('Error extracting fields:', error)
    return []
  }
}

/**
 * Generate sample data for a format
 */
export function generateSampleData(format: FormatType): string {
  switch (format) {
    case 'JSON':
      return JSON.stringify({
        employees: [
          {
            id: 1,
            name: "John Doe",
            email: "john.doe@company.com",
            department: "Engineering",
            salary: 75000
          },
          {
            id: 2,
            name: "Jane Smith", 
            email: "jane.smith@company.com",
            department: "Marketing",
            salary: 65000
          }
        ]
      }, null, 2)
    
    case 'XML':
      return `<?xml version="1.0" encoding="UTF-8"?>
<employees>
  <employee>
    <id>1</id>
    <name>John Doe</name>
    <email>john.doe@company.com</email>
    <department>Engineering</department>
    <salary>75000</salary>
  </employee>
  <employee>
    <id>2</id>
    <name>Jane Smith</name>
    <email>jane.smith@company.com</email>
    <department>Marketing</department>
    <salary>65000</salary>
  </employee>
</employees>`
    
    case 'CSV':
      return `id,name,email,department,salary
1,John Doe,john.doe@company.com,Engineering,75000
2,Jane Smith,jane.smith@company.com,Marketing,65000
3,Bob Johnson,bob.johnson@company.com,Sales,55000`
    
    case 'TXT':
      return `Employee Report
================

John Doe - Engineering - $75,000
Jane Smith - Marketing - $65,000
Bob Johnson - Sales - $55,000`
    
    default:
      return ''
  }
}

/**
 * Download content as file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}
