package com.bny.ace.transformer.dto;

import com.bny.ace.transformer.model.DataFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.Valid;
import java.util.List;

/**
 * DTO for advanced transformation requests with field mappings.
 */
public class AdvancedTransformationRequest {

    @NotBlank(message = "Input data is required")
    private String inputData;

    @NotNull(message = "Source format is required")
    private DataFormat sourceFormat;

    @NotNull(message = "Target format is required")
    private DataFormat targetFormat;

    @Valid
    private List<FieldMappingRequest> mappingRules;

    // Constructors
    public AdvancedTransformationRequest() {}

    public AdvancedTransformationRequest(String inputData, DataFormat sourceFormat, DataFormat targetFormat, List<FieldMappingRequest> mappingRules) {
        this.inputData = inputData;
        this.sourceFormat = sourceFormat;
        this.targetFormat = targetFormat;
        this.mappingRules = mappingRules;
    }

    // Getters and Setters
    public String getInputData() {
        return inputData;
    }

    public void setInputData(String inputData) {
        this.inputData = inputData;
    }

    public DataFormat getSourceFormat() {
        return sourceFormat;
    }

    public void setSourceFormat(DataFormat sourceFormat) {
        this.sourceFormat = sourceFormat;
    }

    public DataFormat getTargetFormat() {
        return targetFormat;
    }

    public void setTargetFormat(DataFormat targetFormat) {
        this.targetFormat = targetFormat;
    }

    public List<FieldMappingRequest> getMappingRules() {
        return mappingRules;
    }

    public void setMappingRules(List<FieldMappingRequest> mappingRules) {
        this.mappingRules = mappingRules;
    }

    @Override
    public String toString() {
        return "AdvancedTransformationRequest{" +
                "sourceFormat=" + sourceFormat +
                ", targetFormat=" + targetFormat +
                ", mappingRulesCount=" + (mappingRules != null ? mappingRules.size() : 0) +
                ", inputDataLength=" + (inputData != null ? inputData.length() : 0) +
                '}';
    }
}
