package com.bny.ace.transformer.model;

import jakarta.validation.constraints.NotBlank;

/**
 * POJO representing a field mapping between source and target fields.
 * This will be embedded in MappingConfiguration document (no separate collection).
 */
public class FieldMapping {

    private String sourceField;

    @NotBlank(message = "Target field name is required")
    private String targetField;

    private String transformationRule;

    // Field type metadata
    private FieldType fieldType = FieldType.SIMPLE;

    private ComputedFieldType computedType;

    private Boolean isNested = false;

    private String parentField;

    private Integer nestingLevel = 0;

    // Key-Value Pair support
    private Boolean isKeyValuePair = false;

    private String keyFieldName;

    private String valueFieldName;

    // Many-to-One aggregation support
    private String aggregationField;

    private String[] groupByFields;

    private Integer mappingOrder = 0;

    // Enums
    public enum FieldType {
        SIMPLE,
        NESTED_OBJECT,
        COMPUTED,
        KEY_VALUE_PAIR,
        MANY_TO_ONE
    }

    public enum ComputedFieldType {
        UUID,
        TIMESTAMP,
        TIMESTAMP_ISO,
        DATE,
        COUNT,
        INCREMENT,
        CONSTANT,
        RANDOM_STRING,
        RANDOM_NUMBER
    }

    // Constructors
    public FieldMapping() {}

    public FieldMapping(String sourceField, String targetField) {
        this.sourceField = sourceField;
        this.targetField = targetField;
    }

    public FieldMapping(String sourceField, String targetField, String transformationRule) {
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

    public String[] getGroupByFields() {
        return groupByFields;
    }

    public void setGroupByFields(String[] groupByFields) {
        this.groupByFields = groupByFields;
    }

    public Integer getMappingOrder() {
        return mappingOrder;
    }

    public void setMappingOrder(Integer mappingOrder) {
        this.mappingOrder = mappingOrder;
    }

    @Override
    public String toString() {
        return "FieldMapping{" +
                "sourceField='" + sourceField + '\'' +
                ", targetField='" + targetField + '\'' +
                ", transformationRule='" + transformationRule + '\'' +
                ", fieldType=" + fieldType +
                ", computedType=" + computedType +
                ", isNested=" + isNested +
                ", isKeyValuePair=" + isKeyValuePair +
                ", mappingOrder=" + mappingOrder +
                '}';
    }
}
