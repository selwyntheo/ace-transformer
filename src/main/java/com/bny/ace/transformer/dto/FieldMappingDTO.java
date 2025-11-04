package com.bny.ace.transformer.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for field mapping within a configuration.
 */
public class FieldMappingDTO {

    private Long id;
    
    private String sourceField;
    
    @NotBlank(message = "Target field is required")
    private String targetField;
    
    private String transformationRule;
    
    private String fieldType = "SIMPLE";
    
    private String computedType;
    
    private Boolean isNested = false;
    
    private String parentField;
    
    private Integer nestingLevel = 0;
    
    private Boolean isKeyValuePair = false;
    
    private String keyFieldName;
    
    private String valueFieldName;
    
    private String aggregationField;
    
    private String groupByFields;
    
    private Integer mappingOrder = 0;

    // Constructors
    public FieldMappingDTO() {}

    public FieldMappingDTO(String sourceField, String targetField) {
        this.sourceField = sourceField;
        this.targetField = targetField;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getFieldType() {
        return fieldType;
    }

    public void setFieldType(String fieldType) {
        this.fieldType = fieldType;
    }

    public String getComputedType() {
        return computedType;
    }

    public void setComputedType(String computedType) {
        this.computedType = computedType;
    }

    public Boolean getIsNested() {
        return isNested;
    }

    public void setIsNested(Boolean isNested) {
        this.isNested = isNested;
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

    public Boolean getIsKeyValuePair() {
        return isKeyValuePair;
    }

    public void setIsKeyValuePair(Boolean isKeyValuePair) {
        this.isKeyValuePair = isKeyValuePair;
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

    public String getAggregationField() {
        return aggregationField;
    }

    public void setAggregationField(String aggregationField) {
        this.aggregationField = aggregationField;
    }

    public String getGroupByFields() {
        return groupByFields;
    }

    public void setGroupByFields(String groupByFields) {
        this.groupByFields = groupByFields;
    }

    public Integer getMappingOrder() {
        return mappingOrder;
    }

    public void setMappingOrder(Integer mappingOrder) {
        this.mappingOrder = mappingOrder;
    }
}
