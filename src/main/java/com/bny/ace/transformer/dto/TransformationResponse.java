package com.bny.ace.transformer.dto;

/**
 * DTO for transformation responses.
 */
public class TransformationResponse {

    private String outputData;
    private boolean success;
    private String errorMessage;
    private long processingTimeMs;

    // Constructors
    public TransformationResponse() {}

    public TransformationResponse(String outputData, boolean success) {
        this.outputData = outputData;
        this.success = success;
    }

    public TransformationResponse(String outputData, boolean success, long processingTimeMs) {
        this.outputData = outputData;
        this.success = success;
        this.processingTimeMs = processingTimeMs;
    }

    public static TransformationResponse success(String outputData, long processingTimeMs) {
        return new TransformationResponse(outputData, true, processingTimeMs);
    }

    public static TransformationResponse error(String errorMessage) {
        TransformationResponse response = new TransformationResponse();
        response.setSuccess(false);
        response.setErrorMessage(errorMessage);
        return response;
    }

    // Getters and Setters
    public String getOutputData() {
        return outputData;
    }

    public void setOutputData(String outputData) {
        this.outputData = outputData;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public long getProcessingTimeMs() {
        return processingTimeMs;
    }

    public void setProcessingTimeMs(long processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }

    @Override
    public String toString() {
        return "TransformationResponse{" +
                "success=" + success +
                ", processingTimeMs=" + processingTimeMs +
                ", outputDataLength=" + (outputData != null ? outputData.length() : 0) +
                ", errorMessage='" + errorMessage + '\'' +
                '}';
    }
}
