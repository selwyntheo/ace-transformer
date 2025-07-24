package com.acetransformer.universaldatatransformer.dto;

import com.acetransformer.universaldatatransformer.model.DataFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for transformation requests.
 */
public class TransformationRequest {

    @NotBlank(message = "Input data is required")
    private String inputData;

    @NotNull(message = "Source format is required")
    private DataFormat sourceFormat;

    @NotNull(message = "Target format is required")
    private DataFormat targetFormat;

    private Long mappingConfigurationId;

    // Constructors
    public TransformationRequest() {}

    public TransformationRequest(String inputData, DataFormat sourceFormat, DataFormat targetFormat) {
        this.inputData = inputData;
        this.sourceFormat = sourceFormat;
        this.targetFormat = targetFormat;
    }

    public TransformationRequest(String inputData, DataFormat sourceFormat, DataFormat targetFormat, Long mappingConfigurationId) {
        this.inputData = inputData;
        this.sourceFormat = sourceFormat;
        this.targetFormat = targetFormat;
        this.mappingConfigurationId = mappingConfigurationId;
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

    public Long getMappingConfigurationId() {
        return mappingConfigurationId;
    }

    public void setMappingConfigurationId(Long mappingConfigurationId) {
        this.mappingConfigurationId = mappingConfigurationId;
    }

    @Override
    public String toString() {
        return "TransformationRequest{" +
                "sourceFormat=" + sourceFormat +
                ", targetFormat=" + targetFormat +
                ", mappingConfigurationId=" + mappingConfigurationId +
                ", inputDataLength=" + (inputData != null ? inputData.length() : 0) +
                '}';
    }
}
