package com.acetransformer.universaldatatransformer.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for field mapping requests.
 */
public class FieldMappingRequest {

    @NotBlank(message = "Source field is required")
    private String sourceField;

    @NotBlank(message = "Target field is required")
    private String targetField;

    private String transformationRule;

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

    @Override
    public String toString() {
        return "FieldMappingRequest{" +
                "sourceField='" + sourceField + '\'' +
                ", targetField='" + targetField + '\'' +
                ", transformationRule='" + transformationRule + '\'' +
                '}';
    }
}
