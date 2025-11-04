package com.bny.ace.transformer.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * POJO representing a filter rule for data transformation.
 * This will be embedded in MappingConfiguration document (no separate collection).
 */
public class FilterRule {

    @NotBlank(message = "Field name is required")
    private String fieldName;

    @NotNull(message = "Filter type is required")
    private FilterType filterType;

    private String filterValue;

    private LogicalOperator logicalOperator = LogicalOperator.AND;

    private Integer filterOrder = 0;

    // Enum for filter types
    public enum FilterType {
        EQUALS,
        NOT_EQUALS,
        CONTAINS,
        NOT_CONTAINS,
        STARTS_WITH,
        ENDS_WITH,
        GREATER_THAN,
        LESS_THAN,
        GREATER_OR_EQUAL,
        LESS_OR_EQUAL,
        IN,
        NOT_IN,
        IS_NULL,
        IS_NOT_NULL,
        REGEX,
        DATE_RANGE,
        CUSTOM
    }

    // Enum for logical operators
    public enum LogicalOperator {
        AND,
        OR
    }

    // Constructors
    public FilterRule() {}

    public FilterRule(String fieldName, FilterType filterType, String filterValue) {
        this.fieldName = fieldName;
        this.filterType = filterType;
        this.filterValue = filterValue;
    }

    public FilterRule(String fieldName, FilterType filterType, String filterValue, LogicalOperator logicalOperator) {
        this.fieldName = fieldName;
        this.filterType = filterType;
        this.filterValue = filterValue;
        this.logicalOperator = logicalOperator;
    }

    // Getters and Setters
    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public FilterType getFilterType() {
        return filterType;
    }

    public void setFilterType(FilterType filterType) {
        this.filterType = filterType;
    }

    public String getFilterValue() {
        return filterValue;
    }

    public void setFilterValue(String filterValue) {
        this.filterValue = filterValue;
    }

    public LogicalOperator getLogicalOperator() {
        return logicalOperator;
    }

    public void setLogicalOperator(LogicalOperator logicalOperator) {
        this.logicalOperator = logicalOperator;
    }

    public Integer getFilterOrder() {
        return filterOrder;
    }

    public void setFilterOrder(Integer filterOrder) {
        this.filterOrder = filterOrder;
    }

    @Override
    public String toString() {
        return "FilterRule{" +
                "fieldName='" + fieldName + '\'' +
                ", filterType=" + filterType +
                ", filterValue='" + filterValue + '\'' +
                ", logicalOperator=" + logicalOperator +
                ", filterOrder=" + filterOrder +
                '}';
    }
}
