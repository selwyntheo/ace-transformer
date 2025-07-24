package com.acetransformer.universaldatatransformer.service;

import com.acetransformer.universaldatatransformer.dto.TransformationRequest;
import com.acetransformer.universaldatatransformer.dto.AdvancedTransformationRequest;
import com.acetransformer.universaldatatransformer.dto.FieldMappingRequest;
import com.acetransformer.universaldatatransformer.dto.TransformationResponse;
import com.acetransformer.universaldatatransformer.model.DataFormat;
import com.acetransformer.universaldatatransformer.model.MappingConfiguration;
import com.acetransformer.universaldatatransformer.parser.JsonDataParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Main service for universal data transformation.
 */
@Service
public class UniversalTransformationService {

    @Autowired
    private JsonDataParser jsonDataParser;

    @Autowired
    private MappingConfigurationService mappingConfigurationService;

    /**
     * Transform data from one format to another.
     */
    public TransformationResponse transform(TransformationRequest request) {
        long startTime = System.currentTimeMillis();
        
        try {
            // Parse input data
            Map<String, Object> parsedData = parseData(request.getInputData(), request.getSourceFormat());
            
            // Apply field mappings if configuration is provided
            if (request.getMappingConfigurationId() != null) {
                MappingConfiguration config = mappingConfigurationService.findById(request.getMappingConfigurationId());
                if (config != null) {
                    parsedData = applyFieldMappings(parsedData, config);
                }
            }
            
            // Serialize to target format
            String outputData = serializeData(parsedData, request.getTargetFormat());
            
            long processingTime = System.currentTimeMillis() - startTime;
            return TransformationResponse.success(outputData, processingTime);
            
        } catch (Exception e) {
            return TransformationResponse.error("Transformation failed: " + e.getMessage());
        }
    }

    /**
     * Advanced transform data with field-level mapping rules.
     */
    public TransformationResponse advancedTransform(AdvancedTransformationRequest request) {
        long startTime = System.currentTimeMillis();
        
        try {
            // Parse input data
            Map<String, Object> parsedData = parseData(request.getInputData(), request.getSourceFormat());
            
            // Apply field mappings directly from request
            Map<String, Object> mappedData = applyDirectFieldMappings(parsedData, request.getMappingRules());
            
            // Serialize to target format
            String outputData = serializeData(mappedData, request.getTargetFormat());
            
            long processingTime = System.currentTimeMillis() - startTime;
            return TransformationResponse.success(outputData, processingTime);
            
        } catch (Exception e) {
            return TransformationResponse.error("Advanced transformation failed: " + e.getMessage());
        }
    }

    private Map<String, Object> parseData(String data, DataFormat format) throws Exception {
        switch (format) {
            case JSON:
                return jsonDataParser.parse(data);
            case XML:
                // For now, simple XML parsing - could be enhanced
                Map<String, Object> xmlResult = new HashMap<>();
                xmlResult.put("xmlData", data);
                return xmlResult;
            case CSV:
                // For now, simple CSV parsing - could be enhanced  
                Map<String, Object> csvResult = new HashMap<>();
                csvResult.put("csvData", data);
                return csvResult;
            case TXT:
                Map<String, Object> txtResult = new HashMap<>();
                txtResult.put("textData", data);
                return txtResult;
            default:
                throw new IllegalArgumentException("Unsupported source format: " + format);
        }
    }

    private Map<String, Object> applyFieldMappings(Map<String, Object> data, MappingConfiguration config) {
        Map<String, Object> mappedData = new HashMap<>();
        
        config.getFieldMappings().forEach(mapping -> {
            Object sourceValue = data.get(mapping.getSourceField());
            if (sourceValue != null) {
                // Apply transformation rule if specified
                Object transformedValue = sourceValue;
                if (mapping.getTransformationRule() != null && !mapping.getTransformationRule().isEmpty()) {
                    transformedValue = applyTransformationRule(sourceValue, mapping.getTransformationRule());
                }
                mappedData.put(mapping.getTargetField(), transformedValue);
            }
        });
        
        return mappedData;
    }

    private Map<String, Object> applyDirectFieldMappings(Map<String, Object> data, java.util.List<FieldMappingRequest> mappingRules) {
        Map<String, Object> mappedData = new HashMap<>();
        
        if (mappingRules != null) {
            mappingRules.forEach(mapping -> {
                Object sourceValue = getNestedValue(data, mapping.getSourceField());
                if (sourceValue != null) {
                    // Apply transformation rule if specified
                    Object transformedValue = sourceValue;
                    if (mapping.getTransformationRule() != null && !mapping.getTransformationRule().isEmpty()) {
                        transformedValue = applyTransformationRule(sourceValue, mapping.getTransformationRule());
                    }
                    setNestedValue(mappedData, mapping.getTargetField(), transformedValue);
                }
            });
        }
        
        return mappedData;
    }

    private Object getNestedValue(Map<String, Object> data, String fieldPath) {
        String[] parts = fieldPath.split("\\.");
        Object current = data;
        
        for (int i = 0; i < parts.length; i++) {
            String part = parts[i];
            
            if (part.contains("[]")) {
                // Handle array notation like "users[]"
                String arrayKey = part.replace("[]", "");
                if (current instanceof Map) {
                    current = ((Map<?, ?>) current).get(arrayKey);
                    if (current instanceof java.util.List) {
                        java.util.List<?> list = (java.util.List<?>) current;
                        
                        // If this is the last part, return the list
                        if (i == parts.length - 1) {
                            return current;
                        }
                        
                        // Continue processing with remaining path on each list item
                        java.util.List<Object> results = new java.util.ArrayList<>();
                        String remainingPath = String.join(".", java.util.Arrays.copyOfRange(parts, i + 1, parts.length));
                        
                        for (Object item : list) {
                            if (item instanceof Map) {
                                Object value = getNestedValueFromMap((Map<?, ?>) item, remainingPath);
                                if (value != null) {
                                    results.add(value);
                                }
                            }
                        }
                        return results.isEmpty() ? null : results;
                    }
                } else {
                    return null;
                }
            } else if (current instanceof Map) {
                current = ((Map<?, ?>) current).get(part);
            } else if (current instanceof java.util.List) {
                // If we're trying to access a field on a list, collect from all items
                java.util.List<?> list = (java.util.List<?>) current;
                java.util.List<Object> results = new java.util.ArrayList<>();
                for (Object item : list) {
                    if (item instanceof Map) {
                        Object value = ((Map<?, ?>) item).get(part);
                        if (value != null) {
                            results.add(value);
                        }
                    }
                }
                return results.isEmpty() ? null : results;
            } else {
                return null;
            }
        }
        
        return current;
    }
    
    private Object getNestedValueFromMap(Map<?, ?> map, String fieldPath) {
        String[] parts = fieldPath.split("\\.");
        Object current = map;
        
        for (String part : parts) {
            if (current instanceof Map) {
                current = ((Map<?, ?>) current).get(part);
            } else {
                return null;
            }
        }
        
        return current;
    }

    @SuppressWarnings("unchecked")
    private void setNestedValue(Map<String, Object> data, String fieldPath, Object value) {
        String[] parts = fieldPath.split("\\.");
        Map<String, Object> current = data;
        
        for (int i = 0; i < parts.length - 1; i++) {
            String part = parts[i];
            if (!current.containsKey(part) || !(current.get(part) instanceof Map)) {
                current.put(part, new HashMap<String, Object>());
            }
            current = (Map<String, Object>) current.get(part);
        }
        
        String finalPart = parts[parts.length - 1];
        
        // Handle array values - if the value is a list, we might want to process it
        if (value instanceof java.util.List) {
            java.util.List<?> listValue = (java.util.List<?>) value;
            if (listValue.size() == 1) {
                // If it's a single item list from array extraction, unwrap it
                current.put(finalPart, listValue.get(0));
            } else {
                // Keep as list for multiple items
                current.put(finalPart, value);
            }
        } else {
            current.put(finalPart, value);
        }
    }

    private Object applyTransformationRule(Object value, String rule) {
        // Simple transformation rules - could be enhanced
        switch (rule.toLowerCase()) {
            case "uppercase":
                return value.toString().toUpperCase();
            case "lowercase":
                return value.toString().toLowerCase();
            case "trim":
                return value.toString().trim();
            default:
                return value;
        }
    }

    private String serializeData(Map<String, Object> data, DataFormat format) throws Exception {
        switch (format) {
            case JSON:
                return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(data);
            case XML:
                // Simple XML serialization - could be enhanced
                StringBuilder xml = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<root>\n");
                data.forEach((key, value) -> xml.append("  <").append(key).append(">").append(value).append("</").append(key).append(">\n"));
                xml.append("</root>");
                return xml.toString();
            case CSV:
                // Simple CSV serialization - could be enhanced
                StringBuilder csv = new StringBuilder();
                csv.append(String.join(",", data.keySet())).append("\n");
                csv.append(String.join(",", data.values().stream().map(Object::toString).toArray(String[]::new)));
                return csv.toString();
            case TXT:
                return data.toString();
            default:
                throw new IllegalArgumentException("Unsupported target format: " + format);
        }
    }
}
