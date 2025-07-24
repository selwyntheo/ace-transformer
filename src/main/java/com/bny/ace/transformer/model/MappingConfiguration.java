package com.bny.ace.transformer.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Entity representing a mapping configuration for data transformation.
 */
@Entity
@Table(name = "mapping_configurations")
public class MappingConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Configuration name is required")
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description")
    private String description;

    @NotNull(message = "Source format is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "source_format", nullable = false)
    private DataFormat sourceFormat;

    @NotNull(message = "Target format is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "target_format", nullable = false)
    private DataFormat targetFormat;

    @OneToMany(mappedBy = "mappingConfiguration", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<FieldMapping> fieldMappings = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    // Constructors
    public MappingConfiguration() {}

    public MappingConfiguration(String name, String description, DataFormat sourceFormat, DataFormat targetFormat) {
        this.name = name;
        this.description = description;
        this.sourceFormat = sourceFormat;
        this.targetFormat = targetFormat;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public void addFieldMapping(FieldMapping fieldMapping) {
        fieldMappings.add(fieldMapping);
        fieldMapping.setMappingConfiguration(this);
    }

    public void removeFieldMapping(FieldMapping fieldMapping) {
        fieldMappings.remove(fieldMapping);
        fieldMapping.setMappingConfiguration(null);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    @Override
    public String toString() {
        return "MappingConfiguration{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", sourceFormat=" + sourceFormat +
                ", targetFormat=" + targetFormat +
                ", active=" + active +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
