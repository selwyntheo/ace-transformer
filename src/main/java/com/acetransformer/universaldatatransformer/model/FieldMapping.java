package com.acetransformer.universaldatatransformer.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * JPA Entity representing a field mapping between source and target fields.
 */
@Entity
@Table(name = "field_mappings")
public class FieldMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Source field name is required")
    @Column(name = "source_field", nullable = false)
    private String sourceField;

    @NotBlank(message = "Target field name is required")
    @Column(name = "target_field", nullable = false)
    private String targetField;

    @Column(name = "transformation_rule")
    private String transformationRule;

    @NotNull(message = "Mapping configuration is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mapping_config_id", nullable = false)
    private MappingConfiguration mappingConfiguration;

    // Constructors
    public FieldMapping() {}

    public FieldMapping(String sourceField, String targetField, String transformationRule) {
        this.sourceField = sourceField;
        this.targetField = targetField;
        this.transformationRule = transformationRule;
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

    public MappingConfiguration getMappingConfiguration() {
        return mappingConfiguration;
    }

    public void setMappingConfiguration(MappingConfiguration mappingConfiguration) {
        this.mappingConfiguration = mappingConfiguration;
    }

    @Override
    public String toString() {
        return "FieldMapping{" +
                "id=" + id +
                ", sourceField='" + sourceField + '\'' +
                ", targetField='" + targetField + '\'' +
                ", transformationRule='" + transformationRule + '\'' +
                '}';
    }
}
