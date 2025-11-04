package com.bny.ace.transformer.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

/**
 * DTO for field mapping requests with enhanced support for nested fields,
 * computed fields, and key/value pairs.
 */
public class FieldMappingRequest {

    // Source field is optional for COMPUTED and NESTED_OBJECT types
    private String sourceField;

    @NotBlank(message = "Target field is required")
    private String targetField;

    private String transformationRule;
    
    // Enhanced field metadata
    private FieldType fieldType = FieldType.SIMPLE;
    private ComputedFieldType computedType;
    private boolean isNested = false;
    private String parentField;
    private Integer nestingLevel = 0;
    private boolean isKeyValuePair = false;
    private String keyFieldName;
    private String valueFieldName;
    
    // For nested objects - children fields
    private List<FieldMappingRequest> children;
    
    // Enums for field types
    public enum FieldType {
        SIMPLE,          // Regular field mapping
        NESTED_OBJECT,   // Nested object with children
        COMPUTED,        // Computed/generated field
        KEY_VALUE_PAIR   // Key-value pair structure
    }
    
    public enum ComputedFieldType {
        UUID,            // Generate UUID
        TIMESTAMP,       // Current timestamp
        TIMESTAMP_ISO,   // ISO 8601 timestamp
        DATE,            // Current date
        COUNT,           // Count of array items
        INCREMENT,       // Auto-increment counter
        CONSTANT,        // Constant value from transformationRule
        RANDOM_STRING,   // Random string
        RANDOM_NUMBER    // Random number
    }

    // Constructors
    public FieldMappingRequest() {}

    public FieldMappingRequest(String sourceField, String targetField) {
        this.sourceField = sourceField;
        this.targetField = targetField;
    }

    public FieldMappingRequest(String sourceField, String targetField, String transformationRule) {
        this.sourceField = sourceField;
        this.targetField = targetField;
        this.transformationRule = transformationRule;
    }

    // Getters and Setters
    public String getSourceField() {
        return sourceField;
    }

    public void setSourceField(String sourceField) {
        this.sourceField = sourceField;
    }

    public String getTargetField() {
        return targetField;
    }

    public void setTargetField(String targetField) {
        this.targetField = targetField;
    }

    public String getTransformationRule() {
        return transformationRule;
    }

    public void setTransformationRule(String transformationRule) {
        this.transformationRule = transformationRule;
    }

    public FieldType getFieldType() {
        return fieldType;
    }

    public void setFieldType(FieldType fieldType) {
        this.fieldType = fieldType;
    }

    public ComputedFieldType getComputedType() {
        return computedType;
    }

    public void setComputedType(ComputedFieldType computedType) {
        this.computedType = computedType;
    }

    public boolean isNested() {
        return isNested;
    }

    public void setNested(boolean nested) {
        isNested = nested;
    }

    public String getParentField() {
        return parentField;
    }

    public void setParentField(String parentField) {
        this.parentField = parentField;
    }

    public Integer getNestingLevel() {
        return nestingLevel;
    }

    public void setNestingLevel(Integer nestingLevel) {
        this.nestingLevel = nestingLevel;
    }

    public boolean isKeyValuePair() {
        return isKeyValuePair;
    }

    public void setKeyValuePair(boolean keyValuePair) {
        isKeyValuePair = keyValuePair;
    }

    public String getKeyFieldName() {
        return keyFieldName;
    }

    public void setKeyFieldName(String keyFieldName) {
        this.keyFieldName = keyFieldName;
    }

    public String getValueFieldName() {
        return valueFieldName;
    }

    public void setValueFieldName(String valueFieldName) {
        this.valueFieldName = valueFieldName;
    }

    public List<FieldMappingRequest> getChildren() {
        return children;
    }

    public void setChildren(List<FieldMappingRequest> children) {
        this.children = children;
    }
}
