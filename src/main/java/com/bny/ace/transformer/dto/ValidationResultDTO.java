package com.bny.ace.transformer.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for validation results.
 */
public class ValidationResultDTO {

    private Boolean isValid;
    private List<ValidationError> errors = new ArrayList<>();
    private String summary;

    public ValidationResultDTO() {}

    public ValidationResultDTO(Boolean isValid) {
        this.isValid = isValid;
    }

    public Boolean getIsValid() {
        return isValid;
    }

    public void setIsValid(Boolean isValid) {
        this.isValid = isValid;
    }

    public List<ValidationError> getErrors() {
        return errors;
    }

    public void setErrors(List<ValidationError> errors) {
        this.errors = errors;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public void addError(String fieldName, String message, String ruleType) {
        errors.add(new ValidationError(fieldName, message, ruleType));
    }

    public static class ValidationError {
        private String fieldName;
        private String message;
        private String ruleType;

        public ValidationError() {}

        public ValidationError(String fieldName, String message, String ruleType) {
            this.fieldName = fieldName;
            this.message = message;
            this.ruleType = ruleType;
        }

        public String getFieldName() {
            return fieldName;
        }

        public void setFieldName(String fieldName) {
            this.fieldName = fieldName;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getRuleType() {
            return ruleType;
        }

        public void setRuleType(String ruleType) {
            this.ruleType = ruleType;
        }
    }
}
