package com.bny.ace.transformer.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * POJO representing a validation rule for data transformation.
 * This will be embedded in MappingConfiguration document (no separate collection).
 */
public class ValidationRule {

    @NotBlank(message = "Field name is required")
    private String fieldName;

    @NotNull(message = "Rule type is required")
    private RuleType ruleType;

    private String ruleValue;

    private String errorMessage;

    private Boolean isRequired = false;

    private Integer ruleOrder = 0;

    // Enum for validation rule types
    public enum RuleType {
        REQUIRED,           // Field must be present
        NOT_NULL,           // Field must not be null
        NOT_EMPTY,          // Field must not be empty string
        MIN_LENGTH,         // Minimum string length
        MAX_LENGTH,         // Maximum string length
        PATTERN,            // Regex pattern match
        EMAIL,              // Valid email format
        PHONE,              // Valid phone number
        NUMERIC,            // Numeric value
        MIN_VALUE,          // Minimum numeric value
        MAX_VALUE,          // Maximum numeric value
        DATE_FORMAT,        // Valid date format
        ENUM,               // Value must be in enum list
        CUSTOM              // Custom validation rule
    }

    // Constructors
    public ValidationRule() {}

    public ValidationRule(String fieldName, RuleType ruleType) {
        this.fieldName = fieldName;
        this.ruleType = ruleType;
    }

    public ValidationRule(String fieldName, RuleType ruleType, String ruleValue, String errorMessage) {
        this.fieldName = fieldName;
        this.ruleType = ruleType;
        this.ruleValue = ruleValue;
        this.errorMessage = errorMessage;
    }

    // Getters and Setters
    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public RuleType getRuleType() {
        return ruleType;
    }

    public void setRuleType(RuleType ruleType) {
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

    @Override
    public String toString() {
        return "ValidationRule{" +
                "fieldName='" + fieldName + '\'' +
                ", ruleType=" + ruleType +
                ", ruleValue='" + ruleValue + '\'' +
                ", errorMessage='" + errorMessage + '\'' +
                ", isRequired=" + isRequired +
                ", ruleOrder=" + ruleOrder +
                '}';
    }
}
