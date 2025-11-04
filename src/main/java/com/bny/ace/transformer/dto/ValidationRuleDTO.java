package com.bny.ace.transformer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for validation rule within a configuration.
 */
public class ValidationRuleDTO {

    private Long id;
    
    @NotBlank(message = "Field name is required")
    private String fieldName;
    
    @NotNull(message = "Rule type is required")
    private String ruleType;
    
    private String ruleValue;
    
    private String errorMessage;
    
    private Boolean isRequired = false;
    
    private Integer ruleOrder = 0;

    // Constructors
    public ValidationRuleDTO() {}

    public ValidationRuleDTO(String fieldName, String ruleType) {
        this.fieldName = fieldName;
        this.ruleType = ruleType;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getRuleType() {
        return ruleType;
    }

    public void setRuleType(String ruleType) {
        this.ruleType = ruleType;
    }

    public String getRuleValue() {
        return ruleValue;
    }

    public void setRuleValue(String ruleValue) {
        this.ruleValue = ruleValue;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Boolean getIsRequired() {
        return isRequired;
    }

    public void setIsRequired(Boolean isRequired) {
        this.isRequired = isRequired;
    }

    public Integer getRuleOrder() {
        return ruleOrder;
    }

    public void setRuleOrder(Integer ruleOrder) {
        this.ruleOrder = ruleOrder;
    }
}
