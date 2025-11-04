package com.bny.ace.transformer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for creating or updating a complete mapping configuration.
 */
public class MappingConfigurationDTO {

    private String id;

    @NotBlank(message = "Configuration name is required")
    private String name;

    private String description;

    @NotBlank(message = "Source format is required")
    private String sourceFormat;

    @NotBlank(message = "Target format is required")
    private String targetFormat;

    private List<FieldMappingDTO> fieldMappings = new ArrayList<>();
    
    private List<ValidationRuleDTO> validationRules = new ArrayList<>();
    
    private List<FilterRuleDTO> filterRules = new ArrayList<>();

    private Boolean active = true;

    // Constructors
    public MappingConfigurationDTO() {}

    public MappingConfigurationDTO(String name, String sourceFormat, String targetFormat) {
        this.name = name;
        this.sourceFormat = sourceFormat;
        this.targetFormat = targetFormat;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSourceFormat() {
        return sourceFormat;
    }

    public void setSourceFormat(String sourceFormat) {
        this.sourceFormat = sourceFormat;
    }

    public String getTargetFormat() {
        return targetFormat;
    }

    public void setTargetFormat(String targetFormat) {
        this.targetFormat = targetFormat;
    }

    public List<FieldMappingDTO> getFieldMappings() {
        return fieldMappings;
    }

    public void setFieldMappings(List<FieldMappingDTO> fieldMappings) {
        this.fieldMappings = fieldMappings;
    }

    public List<ValidationRuleDTO> getValidationRules() {
        return validationRules;
    }

    public void setValidationRules(List<ValidationRuleDTO> validationRules) {
        this.validationRules = validationRules;
    }

    public List<FilterRuleDTO> getFilterRules() {
        return filterRules;
    }

    public void setFilterRules(List<FilterRuleDTO> filterRules) {
        this.filterRules = filterRules;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
