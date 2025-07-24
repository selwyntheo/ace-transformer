import axios from 'axios'

export interface DataFormat {
  JSON: 'JSON'
  XML: 'XML'
  CSV: 'CSV'
  TXT: 'TXT'
}

export type FormatType = keyof DataFormat

export interface TransformRequest {
  inputData: string
  sourceFormat: FormatType
  targetFormat: FormatType
}

export interface TransformResponse {
  outputData: string
  processingTimeMs: number
  success: boolean
  errorMessage?: string
}

export interface FieldMapping {
  sourceField: string
  targetField: string
  transformationRule?: string
}

export interface AdvancedTransformRequest extends TransformRequest {
  mappingRules: FieldMapping[]
}

export interface MappingConfiguration {
  id?: number
  name: string
  description: string
  sourceFormat: FormatType
  targetFormat: FormatType
  fieldMappings: FieldMapping[]
  createdAt?: string
  updatedAt?: string
  active?: boolean
}

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

export class TransformationService {
  /**
   * Simple transformation between formats
   */
  static async transform(request: TransformRequest): Promise<TransformResponse> {
    try {
      const response = await api.post<TransformResponse>('/transform', request)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Transformation failed')
      }
      throw error
    }
  }

  /**
   * Advanced transformation with field mappings
   */
  static async advancedTransform(request: AdvancedTransformRequest): Promise<TransformResponse> {
    try {
      const response = await api.post<TransformResponse>('/transform/advanced', request)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Advanced transformation failed')
      }
      throw error
    }
  }

  /**
   * Get all saved configurations
   */
  static async getConfigurations(): Promise<MappingConfiguration[]> {
    try {
      const response = await api.get<MappingConfiguration[]>('/configurations')
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch configurations')
      }
      throw error
    }
  }

  /**
   * Save a new mapping configuration
   */
  static async saveConfiguration(config: Omit<MappingConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<MappingConfiguration> {
    try {
      const response = await api.post<MappingConfiguration>('/configurations', config)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to save configuration')
      }
      throw error
    }
  }

  /**
   * Delete a configuration
   */
  static async deleteConfiguration(id: number): Promise<void> {
    try {
      await api.delete(`/configurations/${id}`)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete configuration')
      }
      throw error
    }
  }

  /**
   * Get health status
   */
  static async getHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await api.get('/transform/health')
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error('Health check failed')
      }
      throw error
    }
  }
}

export default TransformationService
