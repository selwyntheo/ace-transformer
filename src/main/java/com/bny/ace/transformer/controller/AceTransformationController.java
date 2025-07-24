package com.bny.ace.transformer.controller;

import com.bny.ace.transformer.dto.TransformationRequest;
import com.bny.ace.transformer.dto.AdvancedTransformationRequest;
import com.bny.ace.transformer.dto.TransformationResponse;
import com.bny.ace.transformer.service.AceTransformationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * REST Controller for Ace data transformation operations.
 */
@RestController
@RequestMapping("/api/transform")
@CrossOrigin(origins = "*")
public class AceTransformationController {

    @Autowired
    private AceTransformationService transformationService;

    /**
     * Transform data from one format to another.
     */
    @PostMapping
    public ResponseEntity<TransformationResponse> transform(@Valid @RequestBody TransformationRequest request) {
        TransformationResponse response = transformationService.transform(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Advanced transform data with field-level mapping rules.
     */
    @PostMapping("/advanced")
    public ResponseEntity<TransformationResponse> advancedTransform(@Valid @RequestBody AdvancedTransformationRequest request) {
        TransformationResponse response = transformationService.advancedTransform(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Universal Data Transformer is running");
    }
}
