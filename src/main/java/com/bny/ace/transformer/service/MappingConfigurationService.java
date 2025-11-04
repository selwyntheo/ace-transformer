package com.bny.ace.transformer.service;

import com.bny.ace.transformer.dto.*;
import com.bny.ace.transformer.model.*;
import com.bny.ace.transformer.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service for managing mapping configurations with validation and filtering.
 * Updated for MongoDB - no need for separate ValidationRuleRepository and FilterRuleRepository
 * as they are now embedded documents.
 */
@Service
public class MappingConfigurationService {

    @Autowired
    private MappingConfigurationRepository mappingConfigRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Create a new mapping configuration.
     */
    public MappingConfigurationDTO createConfiguration(MappingConfigurationDTO dto) {
        if (mappingConfigRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Configuration with name '" + dto.getName() + "' already exists");
        }

        MappingConfiguration config = new MappingConfiguration();
        config.setName(dto.getName());
        config.setDescription(dto.getDescription());
        config.setSourceFormat(DataFormat.valueOf(dto.getSourceFormat()));
        config.setTargetFormat(DataFormat.valueOf(dto.getTargetFormat()));
        config.setActive(dto.getActive());

        // Add field mappings
        if (dto.getFieldMappings() != null) {
            for (FieldMappingDTO fmDto : dto.getFieldMappings()) {
                FieldMapping fm = convertToFieldMapping(fmDto);
                config.addFieldMapping(fm);
            }
        }

        // Add validation rules
        if (dto.getValidationRules() != null) {
            for (ValidationRuleDTO vrDto : dto.getValidationRules()) {
                ValidationRule vr = convertToValidationRule(vrDto);
                config.addValidationRule(vr);
            }
        }

        // Add filter rules
        if (dto.getFilterRules() != null) {
            for (FilterRuleDTO frDto : dto.getFilterRules()) {
                FilterRule fr = convertToFilterRule(frDto);
                config.addFilterRule(fr);
            }
        }

        // Lifecycle methods will be called automatically by MongoDB event listener
        
        config = mappingConfigRepository.save(config);
        return convertToDTO(config);
    }

    /**
     * Update an existing mapping configuration.
     */
    public MappingConfigurationDTO updateConfiguration(String id, MappingConfigurationDTO dto) {
        MappingConfiguration config = mappingConfigRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Configuration not found with id: " + id));

        // Check if name is being changed and if it conflicts
        if (!config.getName().equals(dto.getName()) && mappingConfigRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Configuration with name '" + dto.getName() + "' already exists");
        }

        config.setName(dto.getName());
        config.setDescription(dto.getDescription());
        config.setSourceFormat(DataFormat.valueOf(dto.getSourceFormat()));
        config.setTargetFormat(DataFormat.valueOf(dto.getTargetFormat()));
        config.setActive(dto.getActive());

        // Clear and re-add field mappings
        config.getFieldMappings().clear();
        if (dto.getFieldMappings() != null) {
            for (FieldMappingDTO fmDto : dto.getFieldMappings()) {
                FieldMapping fm = convertToFieldMapping(fmDto);
                config.addFieldMapping(fm);
            }
        }

        // Clear and re-add validation rules
        config.getValidationRules().clear();
        if (dto.getValidationRules() != null) {
            for (ValidationRuleDTO vrDto : dto.getValidationRules()) {
                ValidationRule vr = convertToValidationRule(vrDto);
                config.addValidationRule(vr);
            }
        }

        // Clear and re-add filter rules
        config.getFilterRules().clear();
        if (dto.getFilterRules() != null) {
            for (FilterRuleDTO frDto : dto.getFilterRules()) {
                FilterRule fr = convertToFilterRule(frDto);
                config.addFilterRule(fr);
            }
        }

        // Call lifecycle method before save
        config.onUpdate();
        
        config = mappingConfigRepository.save(config);
        return convertToDTO(config);
    }

    /**
     * Get configuration by ID.
     */
    public MappingConfigurationDTO getConfiguration(String id) {
        MappingConfiguration config = mappingConfigRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Configuration not found with id: " + id));
        return convertToDTO(config);
    }

    /**
     * Get configuration by name.
     */
    public MappingConfigurationDTO getConfigurationByName(String name) {
        MappingConfiguration config = mappingConfigRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Configuration not found with name: " + name));
        return convertToDTO(config);
    }

    /**
     * Get all configurations.
     */
    public List<MappingConfigurationDTO> getAllConfigurations() {
        return mappingConfigRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get active configurations.
     */
    public List<MappingConfigurationDTO> getActiveConfigurations() {
        return mappingConfigRepository.findByActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Delete configuration.
     */
    public void deleteConfiguration(String id) {
        if (!mappingConfigRepository.existsById(id)) {
            throw new IllegalArgumentException("Configuration not found with id: " + id);
        }
        mappingConfigRepository.deleteById(id);
    }

    /**
     * Validate data against validation rules.
     */
    public ValidationResultDTO validateData(String configId, String jsonData) throws JsonProcessingException {
        MappingConfiguration config = mappingConfigRepository.findById(configId)
                .orElseThrow(() -> new IllegalArgumentException("Configuration not found with id: " + configId));

        JsonNode dataNode = objectMapper.readTree(jsonData);
        ValidationResultDTO result = new ValidationResultDTO(true);

        List<ValidationRule> rules = config.getValidationRules();
        for (ValidationRule rule : rules) {
            validateField(dataNode, rule, result);
        }

        result.setSummary(result.getIsValid() 
            ? "Validation passed" 
            : String.format("Validation failed with %d error(s)", result.getErrors().size()));

        return result;
    }

    /**
     * Apply filter rules to data.
     */
    public String applyFilters(String configId, String jsonData) throws JsonProcessingException {
        MappingConfiguration config = mappingConfigRepository.findById(configId)
                .orElseThrow(() -> new IllegalArgumentException("Configuration not found with id: " + configId));

        JsonNode dataNode = objectMapper.readTree(jsonData);
        List<FilterRule> rules = config.getFilterRules();

        if (rules.isEmpty()) {
            return jsonData;
        }

        // Apply filters
        if (dataNode.isArray()) {
            ArrayNode filteredArray = objectMapper.createArrayNode();
            for (JsonNode item : dataNode) {
                if (matchesFilters(item, rules)) {
                    filteredArray.add(item);
                }
            }
            return objectMapper.writeValueAsString(filteredArray);
        } else {
            // Single object
            if (matchesFilters(dataNode, rules)) {
                return jsonData;
            } else {
                return "{}";
            }
        }
    }

    // Private helper methods

    private FieldMapping convertToFieldMapping(FieldMappingDTO dto) {
        FieldMapping fm = new FieldMapping();
        fm.setSourceField(dto.getSourceField());
        fm.setTargetField(dto.getTargetField());
        fm.setTransformationRule(dto.getTransformationRule());
        fm.setFieldType(FieldMapping.FieldType.valueOf(dto.getFieldType()));
        
        if (dto.getComputedType() != null && !dto.getComputedType().isEmpty()) {
            fm.setComputedType(FieldMapping.ComputedFieldType.valueOf(dto.getComputedType()));
        }
        
        fm.setIsNested(dto.getIsNested());
        fm.setParentField(dto.getParentField());
        fm.setNestingLevel(dto.getNestingLevel());
        fm.setIsKeyValuePair(dto.getIsKeyValuePair());
        fm.setKeyFieldName(dto.getKeyFieldName());
        fm.setValueFieldName(dto.getValueFieldName());
        fm.setAggregationField(dto.getAggregationField());
        // Convert comma-separated String to String[]
        if (dto.getGroupByFields() != null && !dto.getGroupByFields().isEmpty()) {
            fm.setGroupByFields(dto.getGroupByFields().split(","));
        }
        fm.setMappingOrder(dto.getMappingOrder());
        
        return fm;
    }

    private ValidationRule convertToValidationRule(ValidationRuleDTO dto) {
        ValidationRule vr = new ValidationRule();
        vr.setFieldName(dto.getFieldName());
        vr.setRuleType(ValidationRule.RuleType.valueOf(dto.getRuleType()));
        vr.setRuleValue(dto.getRuleValue());
        vr.setErrorMessage(dto.getErrorMessage());
        vr.setIsRequired(dto.getIsRequired());
        vr.setRuleOrder(dto.getRuleOrder());
        return vr;
    }

    private FilterRule convertToFilterRule(FilterRuleDTO dto) {
        FilterRule fr = new FilterRule();
        fr.setFieldName(dto.getFieldName());
        fr.setFilterType(FilterRule.FilterType.valueOf(dto.getFilterType()));
        fr.setFilterValue(dto.getFilterValue());
        fr.setLogicalOperator(FilterRule.LogicalOperator.valueOf(dto.getLogicalOperator()));
        fr.setFilterOrder(dto.getFilterOrder());
        return fr;
    }

    private MappingConfigurationDTO convertToDTO(MappingConfiguration config) {
        MappingConfigurationDTO dto = new MappingConfigurationDTO();
        dto.setId(config.getId());
        dto.setName(config.getName());
        dto.setDescription(config.getDescription());
        dto.setSourceFormat(config.getSourceFormat().name());
        dto.setTargetFormat(config.getTargetFormat().name());
        dto.setActive(config.getActive());

        // Convert field mappings
        if (config.getFieldMappings() != null) {
            dto.setFieldMappings(config.getFieldMappings().stream()
                    .map(this::convertFieldMappingToDTO)
                    .collect(Collectors.toList()));
        }

        // Convert validation rules
        if (config.getValidationRules() != null) {
            dto.setValidationRules(config.getValidationRules().stream()
                    .map(this::convertValidationRuleToDTO)
                    .collect(Collectors.toList()));
        }

        // Convert filter rules
        if (config.getFilterRules() != null) {
            dto.setFilterRules(config.getFilterRules().stream()
                    .map(this::convertFilterRuleToDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private FieldMappingDTO convertFieldMappingToDTO(FieldMapping fm) {
        FieldMappingDTO dto = new FieldMappingDTO();
        // No ID for embedded documents
        dto.setSourceField(fm.getSourceField());
        dto.setTargetField(fm.getTargetField());
        dto.setTransformationRule(fm.getTransformationRule());
        dto.setFieldType(fm.getFieldType().name());
        dto.setComputedType(fm.getComputedType() != null ? fm.getComputedType().name() : null);
        dto.setIsNested(fm.getIsNested());
        dto.setParentField(fm.getParentField());
        dto.setNestingLevel(fm.getNestingLevel());
        dto.setIsKeyValuePair(fm.getIsKeyValuePair());
        dto.setKeyFieldName(fm.getKeyFieldName());
        dto.setValueFieldName(fm.getValueFieldName());
        dto.setAggregationField(fm.getAggregationField());
        // Convert String[] to comma-separated String
        dto.setGroupByFields(fm.getGroupByFields() != null ? String.join(",", fm.getGroupByFields()) : null);
        dto.setMappingOrder(fm.getMappingOrder());
        return dto;
    }

    private ValidationRuleDTO convertValidationRuleToDTO(ValidationRule vr) {
        ValidationRuleDTO dto = new ValidationRuleDTO();
        // No ID for embedded documents
        dto.setFieldName(vr.getFieldName());
        dto.setRuleType(vr.getRuleType().name());
        dto.setRuleValue(vr.getRuleValue());
        dto.setErrorMessage(vr.getErrorMessage());
        dto.setIsRequired(vr.getIsRequired());
        dto.setRuleOrder(vr.getRuleOrder());
        return dto;
    }

    private FilterRuleDTO convertFilterRuleToDTO(FilterRule fr) {
        FilterRuleDTO dto = new FilterRuleDTO();
        // No ID for embedded documents
        dto.setFieldName(fr.getFieldName());
        dto.setFilterType(fr.getFilterType().name());
        dto.setFilterValue(fr.getFilterValue());
        dto.setLogicalOperator(fr.getLogicalOperator().name());
        dto.setFilterOrder(fr.getFilterOrder());
        return dto;
    }

    private void validateField(JsonNode dataNode, ValidationRule rule, ValidationResultDTO result) {
        JsonNode fieldNode = dataNode.get(rule.getFieldName());
        String fieldValue = fieldNode != null && !fieldNode.isNull() ? fieldNode.asText() : null;

        boolean isValid = true;
        String errorMsg = rule.getErrorMessage() != null ? rule.getErrorMessage() : "Validation failed";

        switch (rule.getRuleType()) {
            case REQUIRED:
            case NOT_NULL:
                if (fieldNode == null || fieldNode.isNull()) {
                    isValid = false;
                    errorMsg = String.format("Field '%s' is required", rule.getFieldName());
                }
                break;
            case NOT_EMPTY:
                if (fieldValue == null || fieldValue.trim().isEmpty()) {
                    isValid = false;
                    errorMsg = String.format("Field '%s' cannot be empty", rule.getFieldName());
                }
                break;
            case MIN_LENGTH:
                if (fieldValue != null && fieldValue.length() < Integer.parseInt(rule.getRuleValue())) {
                    isValid = false;
                    errorMsg = String.format("Field '%s' must be at least %s characters", rule.getFieldName(), rule.getRuleValue());
                }
                break;
            case MAX_LENGTH:
                if (fieldValue != null && fieldValue.length() > Integer.parseInt(rule.getRuleValue())) {
                    isValid = false;
                    errorMsg = String.format("Field '%s' must not exceed %s characters", rule.getFieldName(), rule.getRuleValue());
                }
                break;
            case PATTERN:
                if (fieldValue != null && !Pattern.matches(rule.getRuleValue(), fieldValue)) {
                    isValid = false;
                    errorMsg = String.format("Field '%s' does not match required pattern", rule.getFieldName());
                }
                break;
            case EMAIL:
                if (fieldValue != null && !Pattern.matches("^[A-Za-z0-9+_.-]+@(.+)$", fieldValue)) {
                    isValid = false;
                    errorMsg = String.format("Field '%s' must be a valid email", rule.getFieldName());
                }
                break;
            case NUMERIC:
                if (fieldValue != null) {
                    try {
                        Double.parseDouble(fieldValue);
                    } catch (NumberFormatException e) {
                        isValid = false;
                        errorMsg = String.format("Field '%s' must be numeric", rule.getFieldName());
                    }
                }
                break;
            case MIN_VALUE:
                if (fieldValue != null) {
                    try {
                        double value = Double.parseDouble(fieldValue);
                        double minValue = Double.parseDouble(rule.getRuleValue());
                        if (value < minValue) {
                            isValid = false;
                            errorMsg = String.format("Field '%s' must be at least %s", rule.getFieldName(), rule.getRuleValue());
                        }
                    } catch (NumberFormatException e) {
                        isValid = false;
                        errorMsg = String.format("Field '%s' must be numeric", rule.getFieldName());
                    }
                }
                break;
            case MAX_VALUE:
                if (fieldValue != null) {
                    try {
                        double value = Double.parseDouble(fieldValue);
                        double maxValue = Double.parseDouble(rule.getRuleValue());
                        if (value > maxValue) {
                            isValid = false;
                            errorMsg = String.format("Field '%s' must not exceed %s", rule.getFieldName(), rule.getRuleValue());
                        }
                    } catch (NumberFormatException e) {
                        isValid = false;
                        errorMsg = String.format("Field '%s' must be numeric", rule.getFieldName());
                    }
                }
                break;
            case ENUM:
                if (fieldValue != null) {
                    List<String> allowedValues = Arrays.asList(rule.getRuleValue().split(","));
                    if (!allowedValues.contains(fieldValue)) {
                        isValid = false;
                        errorMsg = String.format("Field '%s' must be one of: %s", rule.getFieldName(), rule.getRuleValue());
                    }
                }
                break;
            case PHONE:
                if (fieldValue != null && !Pattern.matches("^[+]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[0-9]{1,9}$", fieldValue)) {
                    isValid = false;
                    errorMsg = String.format("Field '%s' must be a valid phone number", rule.getFieldName());
                }
                break;
            case DATE_FORMAT:
                // Basic ISO date format validation
                if (fieldValue != null && !Pattern.matches("^\\d{4}-\\d{2}-\\d{2}.*$", fieldValue)) {
                    isValid = false;
                    errorMsg = String.format("Field '%s' must be a valid date format", rule.getFieldName());
                }
                break;
            case CUSTOM:
                // Custom validation would need additional implementation
                break;
        }

        if (!isValid) {
            result.setIsValid(false);
            result.addError(rule.getFieldName(), errorMsg, rule.getRuleType().name());
        }
    }

    private boolean matchesFilters(JsonNode dataNode, List<FilterRule> rules) {
        boolean result = true;
        FilterRule.LogicalOperator currentOperator = FilterRule.LogicalOperator.AND;

        for (FilterRule rule : rules) {
            boolean ruleMatches = evaluateFilter(dataNode, rule);

            if (currentOperator == FilterRule.LogicalOperator.AND) {
                result = result && ruleMatches;
            } else {
                result = result || ruleMatches;
            }

            currentOperator = rule.getLogicalOperator();
        }

        return result;
    }

    private boolean evaluateFilter(JsonNode dataNode, FilterRule rule) {
        JsonNode fieldNode = dataNode.get(rule.getFieldName());
        String fieldValue = fieldNode != null && !fieldNode.isNull() ? fieldNode.asText() : null;
        String filterValue = rule.getFilterValue();

        switch (rule.getFilterType()) {
            case EQUALS:
                return fieldValue != null && fieldValue.equals(filterValue);
            case NOT_EQUALS:
                return fieldValue == null || !fieldValue.equals(filterValue);
            case CONTAINS:
                return fieldValue != null && fieldValue.contains(filterValue);
            case NOT_CONTAINS:
                return fieldValue == null || !fieldValue.contains(filterValue);
            case STARTS_WITH:
                return fieldValue != null && fieldValue.startsWith(filterValue);
            case ENDS_WITH:
                return fieldValue != null && fieldValue.endsWith(filterValue);
            case GREATER_THAN:
                try {
                    return fieldValue != null && Double.parseDouble(fieldValue) > Double.parseDouble(filterValue);
                } catch (NumberFormatException e) {
                    return false;
                }
            case LESS_THAN:
                try {
                    return fieldValue != null && Double.parseDouble(fieldValue) < Double.parseDouble(filterValue);
                } catch (NumberFormatException e) {
                    return false;
                }
            case GREATER_OR_EQUAL:
                try {
                    return fieldValue != null && Double.parseDouble(fieldValue) >= Double.parseDouble(filterValue);
                } catch (NumberFormatException e) {
                    return false;
                }
            case LESS_OR_EQUAL:
                try {
                    return fieldValue != null && Double.parseDouble(fieldValue) <= Double.parseDouble(filterValue);
                } catch (NumberFormatException e) {
                    return false;
                }
            case IN:
                List<String> values = Arrays.asList(filterValue.split(","));
                return fieldValue != null && values.contains(fieldValue);
            case NOT_IN:
                List<String> notInValues = Arrays.asList(filterValue.split(","));
                return fieldValue == null || !notInValues.contains(fieldValue);
            case IS_NULL:
                return fieldNode == null || fieldNode.isNull();
            case IS_NOT_NULL:
                return fieldNode != null && !fieldNode.isNull();
            case REGEX:
                return fieldValue != null && Pattern.matches(filterValue, fieldValue);
            default:
                return true;
        }
    }
}
