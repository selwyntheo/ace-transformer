package com.bny.ace.transformer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for filter rule within a configuration.
 */
public class FilterRuleDTO {

    private Long id;
    
    @NotBlank(message = "Field name is required")
    private String fieldName;
    
    @NotNull(message = "Filter type is required")
    private String filterType;
    
    private String filterValue;
    
    private String logicalOperator = "AND";
    
    private Integer filterOrder = 0;

    // Constructors
    public FilterRuleDTO() {}

    public FilterRuleDTO(String fieldName, String filterType) {
        this.fieldName = fieldName;
        this.filterType = filterType;
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

    public String getFilterType() {
        return filterType;
    }

    public void setFilterType(String filterType) {
        this.filterType = filterType;
    }

    public String getFilterValue() {
        return filterValue;
    }

    public void setFilterValue(String filterValue) {
        this.filterValue = filterValue;
    }

    public String getLogicalOperator() {
        return logicalOperator;
    }

    public void setLogicalOperator(String logicalOperator) {
        this.logicalOperator = logicalOperator;
    }

    public Integer getFilterOrder() {
        return filterOrder;
    }

    public void setFilterOrder(Integer filterOrder) {
        this.filterOrder = filterOrder;
    }
}
