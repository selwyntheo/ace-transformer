import { describe, it, expect } from 'vitest'
import {
  detectFormatFromFileName,
  detectFormatFromContent,
  formatFileSize,
  isValidFileType,
  extractJsonFields,
  extractCsvFields,
  extractXmlFields,
  extractFields,
  generateSampleData,
  SUPPORTED_FORMATS,
  FORMAT_EXTENSIONS,
  FORMAT_DESCRIPTIONS,
} from '../../utils/formatUtils'

describe('formatUtils', () => {
  describe('detectFormatFromFileName', () => {
    it('should detect JSON format from .json extension', () => {
      expect(detectFormatFromFileName('data.json')).toBe('JSON')
      expect(detectFormatFromFileName('complex.file.name.json')).toBe('JSON')
    })

    it('should detect XML format from .xml extension', () => {
      expect(detectFormatFromFileName('data.xml')).toBe('XML')
      expect(detectFormatFromFileName('DATA.XML')).toBe('XML')
    })

    it('should detect CSV format from .csv extension', () => {
      expect(detectFormatFromFileName('data.csv')).toBe('CSV')
      expect(detectFormatFromFileName('spreadsheet.CSV')).toBe('CSV')
    })

    it('should detect TXT format from .txt extension', () => {
      expect(detectFormatFromFileName('data.txt')).toBe('TXT')
      expect(detectFormatFromFileName('notes.TXT')).toBe('TXT')
    })

    it('should return null for unknown extensions', () => {
      expect(detectFormatFromFileName('data.pdf')).toBeNull()
      expect(detectFormatFromFileName('data.doc')).toBeNull()
      expect(detectFormatFromFileName('data')).toBeNull()
    })
  })

  describe('detectFormatFromContent', () => {
    it('should detect JSON from valid JSON content', () => {
      expect(detectFormatFromContent('{"name": "test"}')).toBe('JSON')
      expect(detectFormatFromContent('[1, 2, 3]')).toBe('JSON')
      expect(detectFormatFromContent('  {"formatted": true}  ')).toBe('JSON')
    })

    it('should detect XML from XML content', () => {
      expect(detectFormatFromContent('<?xml version="1.0"?><root></root>')).toBe('XML')
      expect(detectFormatFromContent('<root><child>content</child></root>')).toBe('XML')
    })

    it('should detect CSV from comma-separated content', () => {
      expect(detectFormatFromContent('name,age,city\nJohn,30,NYC')).toBe('CSV')
      expect(detectFormatFromContent('a,b,c\n1,2,3')).toBe('CSV')
    })

    it('should default to TXT for plain text', () => {
      expect(detectFormatFromContent('This is plain text')).toBe('TXT')
      expect(detectFormatFromContent('Multiple\nlines\nof\ntext')).toBe('TXT')
    })

    it('should handle invalid JSON gracefully', () => {
      expect(detectFormatFromContent('{invalid json}')).toBe('TXT')
      expect(detectFormatFromContent('{"unclosed": true')).toBe('TXT')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(500)).toBe('500 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2097152)).toBe('2 MB')
    })
  })

  describe('isValidFileType', () => {
    it('should validate supported file types', () => {
      expect(isValidFileType(new File([''], 'test.json'))).toBe(true)
      expect(isValidFileType(new File([''], 'test.xml'))).toBe(true)
      expect(isValidFileType(new File([''], 'test.csv'))).toBe(true)
      expect(isValidFileType(new File([''], 'test.txt'))).toBe(true)
    })

    it('should reject unsupported file types', () => {
      expect(isValidFileType(new File([''], 'test.pdf'))).toBe(false)
      expect(isValidFileType(new File([''], 'test.doc'))).toBe(false)
      expect(isValidFileType(new File([''], 'test'))).toBe(false)
    })
  })

  describe('extractJsonFields', () => {
    it('should extract flat JSON fields', () => {
      const data = { name: 'John', age: 30, city: 'NYC' }
      const fields = extractJsonFields(data)
      expect(fields).toEqual(['name', 'age', 'city'])
    })

    it('should extract nested JSON fields', () => {
      const data = {
        user: {
          profile: {
            name: 'John',
            age: 30
          },
          address: {
            city: 'NYC',
            state: 'NY'
          }
        }
      }
      const fields = extractJsonFields(data)
      expect(fields).toEqual([
        'user.profile.name',
        'user.profile.age',
        'user.address.city',
        'user.address.state'
      ])
    })

    it('should handle arrays in JSON', () => {
      const data = { name: 'John', hobbies: ['reading', 'coding'] }
      const fields = extractJsonFields(data)
      expect(fields).toEqual(['name', 'hobbies'])
    })
  })

  describe('extractCsvFields', () => {
    it('should extract CSV headers', () => {
      const csv = 'name,age,city\nJohn,30,NYC\nJane,25,LA'
      const fields = extractCsvFields(csv)
      expect(fields).toEqual(['name', 'age', 'city'])
    })

    it('should handle quoted headers', () => {
      const csv = '"first name","last name","age"\n"John","Doe","30"'
      const fields = extractCsvFields(csv)
      expect(fields).toEqual(['first name', 'last name', 'age'])
    })

    it('should handle empty CSV', () => {
      expect(extractCsvFields('')).toEqual([])
    })
  })

  describe('extractXmlFields', () => {
    it('should extract XML tag names', () => {
      const xml = '<root><name>John</name><age>30</age><city>NYC</city></root>'
      const fields = extractXmlFields(xml)
      expect(fields).toContain('root')
      expect(fields).toContain('name')
      expect(fields).toContain('age')
      expect(fields).toContain('city')
    })

    it('should handle XML with attributes', () => {
      const xml = '<user id="1"><name type="full">John Doe</name></user>'
      const fields = extractXmlFields(xml)
      expect(fields).toContain('user')
      expect(fields).toContain('name')
    })

    it('should ignore XML declarations and comments', () => {
      const xml = '<?xml version="1.0"?><!-- comment --><root></root>'
      const fields = extractXmlFields(xml)
      expect(fields).toContain('root')
      expect(fields).not.toContain('?xml')
      expect(fields).not.toContain('!--')
    })
  })

  describe('extractFields', () => {
    it('should extract fields based on format', () => {
      const jsonData = '{"name": "John", "age": 30}'
      const jsonFields = extractFields(jsonData, 'JSON')
      expect(jsonFields).toEqual(['name', 'age'])

      const csvData = 'name,age\nJohn,30'
      const csvFields = extractFields(csvData, 'CSV')
      expect(csvFields).toEqual(['name', 'age'])

      const txtFields = extractFields('some text', 'TXT')
      expect(txtFields).toEqual(['line', 'content'])
    })

    it('should handle invalid data gracefully', () => {
      const fields = extractFields('invalid json', 'JSON')
      expect(fields).toEqual([])
    })
  })

  describe('generateSampleData', () => {
    it('should generate valid sample data for each format', () => {
      (['JSON', 'XML', 'CSV', 'TXT'] as const).forEach((format) => {
        const sample = generateSampleData(format)
        expect(sample).toBeTruthy()
        expect(typeof sample).toBe('string')
      })
    })

    it('should generate valid JSON sample', () => {
      const jsonSample = generateSampleData('JSON')
      expect(() => JSON.parse(jsonSample)).not.toThrow()
    })

    it('should generate CSV with headers', () => {
      const csvSample = generateSampleData('CSV')
      const lines = csvSample.split('\n')
      expect(lines.length).toBeGreaterThan(1)
      expect(lines[0]).toContain(',')
    })
  })

  describe('constants', () => {
    it('should have all required constants defined', () => {
      expect(SUPPORTED_FORMATS).toEqual(['JSON', 'XML', 'CSV', 'TXT'])
      expect(Object.keys(FORMAT_EXTENSIONS)).toEqual(SUPPORTED_FORMATS)
      expect(Object.keys(FORMAT_DESCRIPTIONS)).toEqual(SUPPORTED_FORMATS)
    })

    it('should have valid format extensions', () => {
      Object.values(FORMAT_EXTENSIONS).forEach((extensions: string[]) => {
        expect(Array.isArray(extensions)).toBe(true)
        expect(extensions.length).toBeGreaterThan(0)
        extensions.forEach((ext: string) => {
          expect(ext.startsWith('.')).toBe(true)
        })
      })
    })
  })
})
