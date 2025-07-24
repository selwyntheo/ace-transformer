import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import {
  transformData,
  getAvailableFormats,
  getTransformationHistory,
  getFieldMapping,
  validateTransformation,
  type TransformRequest,
  type TransformResponse,
  type FieldMapping,
  type MappingConfiguration
} from '../../services/api'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('transformData', () => {
    it('should successfully transform JSON to XML', async () => {
      const mockRequest: TransformRequest = {
        sourceFormat: 'JSON',
        targetFormat: 'XML',
        data: '{"name": "John", "age": 30}',
        mappingConfiguration: {
          fieldMappings: [],
          preserveStructure: true,
          handleMissingFields: 'ignore'
        }
      }

      const mockResponse: TransformResponse = {
        transformedData: '<root><name>John</name><age>30</age></root>',
        sourceFormat: 'JSON',
        targetFormat: 'XML',
        timestamp: '2025-07-23T10:00:00Z',
        metadata: {
          sourceFields: ['name', 'age'],
          targetFields: ['name', 'age'],
          transformationRules: [],
          statistics: {
            recordsProcessed: 1,
            fieldsTransformed: 2,
            duration: 100
          }
        }
      }

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse })

      const result = await transformData(mockRequest)

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/transform', mockRequest)
      expect(result).toEqual(mockResponse)
    })

    it('should successfully transform CSV to JSON', async () => {
      const mockRequest: TransformRequest = {
        sourceFormat: 'CSV',
        targetFormat: 'JSON',
        data: 'name,age\nJohn,30\nJane,25',
        mappingConfiguration: {
          fieldMappings: [],
          preserveStructure: true,
          handleMissingFields: 'ignore'
        }
      }

      const mockResponse: TransformResponse = {
        transformedData: '[{"name":"John","age":"30"},{"name":"Jane","age":"25"}]',
        sourceFormat: 'CSV',
        targetFormat: 'JSON',
        timestamp: '2025-07-23T10:00:00Z',
        metadata: {
          sourceFields: ['name', 'age'],
          targetFields: ['name', 'age'],
          transformationRules: [],
          statistics: {
            recordsProcessed: 2,
            fieldsTransformed: 4,
            duration: 150
          }
        }
      }

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse })

      const result = await transformData(mockRequest)

      expect(result.transformedData).toContain('John')
      expect(result.transformedData).toContain('Jane')
      expect(result.metadata.statistics.recordsProcessed).toBe(2)
    })

    it('should handle transformation with field mappings', async () => {
      const fieldMappings: FieldMapping[] = [
        {
          sourceField: 'first_name',
          targetField: 'firstName',
          transformationType: 'direct',
          required: true
        },
        {
          sourceField: 'last_name',
          targetField: 'lastName',
          transformationType: 'direct',
          required: true
        }
      ]

      const mockRequest: TransformRequest = {
        sourceFormat: 'JSON',
        targetFormat: 'JSON',
        data: '{"first_name": "John", "last_name": "Doe"}',
        mappingConfiguration: {
          fieldMappings,
          preserveStructure: false,
          handleMissingFields: 'error'
        }
      }

      const mockResponse: TransformResponse = {
        transformedData: '{"firstName": "John", "lastName": "Doe"}',
        sourceFormat: 'JSON',
        targetFormat: 'JSON',
        timestamp: '2025-07-23T10:00:00Z',
        metadata: {
          sourceFields: ['first_name', 'last_name'],
          targetFields: ['firstName', 'lastName'],
          transformationRules: fieldMappings,
          statistics: {
            recordsProcessed: 1,
            fieldsTransformed: 2,
            duration: 120
          }
        }
      }

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse })

      const result = await transformData(mockRequest)

      expect(result.transformedData).toContain('firstName')
      expect(result.transformedData).toContain('lastName')
      expect(result.metadata.transformationRules).toEqual(fieldMappings)
    })

    it('should handle API errors gracefully', async () => {
      const mockRequest: TransformRequest = {
        sourceFormat: 'JSON',
        targetFormat: 'XML',
        data: 'invalid json',
        mappingConfiguration: {
          fieldMappings: [],
          preserveStructure: true,
          handleMissingFields: 'ignore'
        }
      }

      const errorResponse = {
        response: {
          status: 400,
          data: {
            error: 'Invalid JSON format',
            message: 'The provided data is not valid JSON'
          }
        }
      }

      mockedAxios.post.mockRejectedValueOnce(errorResponse)

      await expect(transformData(mockRequest)).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      const mockRequest: TransformRequest = {
        sourceFormat: 'JSON',
        targetFormat: 'XML',
        data: '{"test": true}',
        mappingConfiguration: {
          fieldMappings: [],
          preserveStructure: true,
          handleMissingFields: 'ignore'
        }
      }

      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'))

      await expect(transformData(mockRequest)).rejects.toThrow('Network Error')
    })
  })

  describe('getAvailableFormats', () => {
    it('should return list of supported formats', async () => {
      const mockFormats = {
        sourceFormats: ['JSON', 'XML', 'CSV', 'TXT'],
        targetFormats: ['JSON', 'XML', 'CSV', 'TXT'],
        supportedTransformations: [
          { from: 'JSON', to: 'XML', supported: true },
          { from: 'JSON', to: 'CSV', supported: true },
          { from: 'CSV', to: 'JSON', supported: true },
          { from: 'XML', to: 'JSON', supported: true }
        ]
      }

      mockedAxios.get.mockResolvedValueOnce({ data: mockFormats })

      const result = await getAvailableFormats()

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/formats')
      expect(result.sourceFormats).toContain('JSON')
      expect(result.targetFormats).toContain('XML')
      expect(result.supportedTransformations.length).toBeGreaterThan(0)
    })
  })

  describe('getTransformationHistory', () => {
    it('should return transformation history', async () => {
      const mockHistory = [
        {
          id: '1',
          sourceFormat: 'JSON',
          targetFormat: 'XML',
          timestamp: '2025-07-23T09:00:00Z',
          status: 'success',
          duration: 100
        },
        {
          id: '2',
          sourceFormat: 'CSV',
          targetFormat: 'JSON',
          timestamp: '2025-07-23T09:30:00Z',
          status: 'success',
          duration: 150
        }
      ]

      mockedAxios.get.mockResolvedValueOnce({ data: mockHistory })

      const result = await getTransformationHistory()

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/history')
      expect(result).toHaveLength(2)
      expect(result[0].sourceFormat).toBe('JSON')
      expect(result[1].targetFormat).toBe('JSON')
    })

    it('should handle empty history', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] })

      const result = await getTransformationHistory()

      expect(result).toEqual([])
    })
  })

  describe('getFieldMapping', () => {
    it('should return field mapping suggestions', async () => {
      const mockMapping: MappingConfiguration = {
        fieldMappings: [
          {
            sourceField: 'name',
            targetField: 'fullName',
            transformationType: 'direct',
            required: true
          },
          {
            sourceField: 'age',
            targetField: 'years',
            transformationType: 'direct',
            required: false
          }
        ],
        preserveStructure: true,
        handleMissingFields: 'ignore'
      }

      mockedAxios.post.mockResolvedValueOnce({ data: mockMapping })

      const result = await getFieldMapping('JSON', 'XML', '{"name": "John", "age": 30}')

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/mapping', {
        sourceFormat: 'JSON',
        targetFormat: 'XML',
        sampleData: '{"name": "John", "age": 30}'
      })
      expect(result.fieldMappings).toHaveLength(2)
      expect(result.fieldMappings[0].sourceField).toBe('name')
    })
  })

  describe('validateTransformation', () => {
    it('should validate successful transformation', async () => {
      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
      }

      mockedAxios.post.mockResolvedValueOnce({ data: mockValidation })

      const result = await validateTransformation('JSON', 'XML', '{"name": "John"}')

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/validate', {
        sourceFormat: 'JSON',
        targetFormat: 'XML',
        data: '{"name": "John"}'
      })
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return validation errors for invalid data', async () => {
      const mockValidation = {
        isValid: false,
        errors: ['Invalid JSON syntax at line 1'],
        warnings: ['Field "age" has no mapping'],
        suggestions: ['Consider adding field mapping for "age"']
      }

      mockedAxios.post.mockResolvedValueOnce({ data: mockValidation })

      const result = await validateTransformation('JSON', 'XML', '{invalid json}')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid JSON syntax at line 1')
      expect(result.warnings).toContain('Field "age" has no mapping')
    })
  })

  describe('Error Handling', () => {
    it('should handle 400 Bad Request errors', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { error: 'Bad Request', message: 'Invalid input data' }
        }
      }

      mockedAxios.post.mockRejectedValueOnce(errorResponse)

      const request: TransformRequest = {
        sourceFormat: 'JSON',
        targetFormat: 'XML',
        data: '',
        mappingConfiguration: { fieldMappings: [], preserveStructure: true, handleMissingFields: 'ignore' }
      }

      await expect(transformData(request)).rejects.toThrow()
    })

    it('should handle 500 Internal Server Error', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error', message: 'Something went wrong' }
        }
      }

      mockedAxios.get.mockRejectedValueOnce(errorResponse)

      await expect(getAvailableFormats()).rejects.toThrow()
    })

    it('should handle timeout errors', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      }

      mockedAxios.post.mockRejectedValueOnce(timeoutError)

      const request: TransformRequest = {
        sourceFormat: 'JSON',
        targetFormat: 'XML',
        data: '{"test": true}',
        mappingConfiguration: { fieldMappings: [], preserveStructure: true, handleMissingFields: 'ignore' }
      }

      await expect(transformData(request)).rejects.toThrow()
    })
  })

  describe('Large Data Handling', () => {
    it('should handle large JSON transformations', async () => {
      const largeData = JSON.stringify({
        users: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `User${i}`,
          email: `user${i}@example.com`,
          active: i % 2 === 0
        }))
      })

      const mockResponse: TransformResponse = {
        transformedData: '<users></users>',
        sourceFormat: 'JSON',
        targetFormat: 'XML',
        timestamp: '2025-07-23T10:00:00Z',
        metadata: {
          sourceFields: ['users'],
          targetFields: ['users'],
          transformationRules: [],
          statistics: {
            recordsProcessed: 1000,
            fieldsTransformed: 4000,
            duration: 2000
          }
        }
      }

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse })

      const request: TransformRequest = {
        sourceFormat: 'JSON',
        targetFormat: 'XML',
        data: largeData,
        mappingConfiguration: { fieldMappings: [], preserveStructure: true, handleMissingFields: 'ignore' }
      }

      const result = await transformData(request)

      expect(result.metadata.statistics.recordsProcessed).toBe(1000)
      expect(result.metadata.statistics.duration).toBeGreaterThan(1000)
    })
  })
})
