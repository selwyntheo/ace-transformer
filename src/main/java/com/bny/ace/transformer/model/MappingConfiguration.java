package com.bny.ace.transformer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * MongoDB Document representing a mapping configuration for data transformation.
 * This is the main collection that contains embedded field mappings, validation rules, and filter rules.
 */
@Document(collection = "mapping_configurations")
public class MappingConfiguration {

    @Id
    private String id;

    @NotBlank(message = "Configuration name is required")
    @Indexed(unique = true)
    private String name;

    private String description;

    @NotNull(message = "Source format is required")
    @Indexed
    private DataFormat sourceFormat;

    @NotNull(message = "Target format is required")
    @Indexed
    private DataFormat targetFormat;

    // Embedded documents (no separate collections needed)
    private List<FieldMapping> fieldMappings = new ArrayList<>();
    private List<ValidationRule> validationRules = new ArrayList<>();
    private List<FilterRule> filterRules = new ArrayList<>();

    @Indexed
    private Boolean active = true;

    private Integer version = 1;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;

    // Statistics
    private Integer usageCount = 0;
    private LocalDateTime lastUsedAt;

    // Constructors
    public MappingConfiguration() {}

    public MappingConfiguration(String name, String description, DataFormat sourceFormat, DataFormat targetFormat) {
        this.name = name;
        this.description = description;
        this.sourceFormat = sourceFormat;
        this.targetFormat = targetFormat;
    }

    // Lifecycle methods
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
        if (version == null) {
            version = 1;
        }
    }

    public void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (version != null) {
            version++;
        }
    }

    // Helper methods for managing embedded documents
    public void addFieldMapping(FieldMapping fieldMapping) {
        fieldMappings.add(fieldMapping);
    }

    public void removeFieldMapping(FieldMapping fieldMapping) {
        fieldMappings.remove(fieldMapping);
    }

    public void addValidationRule(ValidationRule validationRule) {
        validationRules.add(validationRule);
    }

    public void removeValidationRule(ValidationRule validationRule) {
        validationRules.remove(validationRule);
    }

    public void addFilterRule(FilterRule filterRule) {
        filterRules.add(filterRule);
    }

    public void removeFilterRule(FilterRule filterRule) {
        filterRules.remove(filterRule);
    }

    public void incrementUsageCount() {
        if (this.usageCount == null) {
            this.usageCount = 0;
        }
        this.usageCount++;
        this.lastUsedAt = LocalDateTime.now();
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

    public List<FieldMapping> getFieldMappings() {
        return fieldMappings;
    }

    public void setFieldMappings(List<FieldMapping> fieldMappings) {
        this.fieldMappings = fieldMappings;
    }

    public List<ValidationRule> getValidationRules() {
        return validationRules;
    }

    public void setValidationRules(List<ValidationRule> validationRules) {
        this.validationRules = validationRules;
    }

    public List<FilterRule> getFilterRules() {
        return filterRules;
    }

    public void setFilterRules(List<FilterRule> filterRules) {
        this.filterRules = filterRules;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Integer getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }

    public LocalDateTime getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(LocalDateTime lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }

    @Override
    public String toString() {
        return "MappingConfiguration{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", sourceFormat=" + sourceFormat +
                ", targetFormat=" + targetFormat +
                ", active=" + active +
                ", version=" + version +
                ", fieldMappingsCount=" + (fieldMappings != null ? fieldMappings.size() : 0) +
                ", validationRulesCount=" + (validationRules != null ? validationRules.size() : 0) +
                ", filterRulesCount=" + (filterRules != null ? filterRules.size() : 0) +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
