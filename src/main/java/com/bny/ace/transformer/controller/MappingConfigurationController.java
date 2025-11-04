package com.bny.ace.transformer.controller;

import com.bny.ace.transformer.dto.MappingConfigurationDTO;
import com.bny.ace.transformer.dto.ValidationResultDTO;
import com.bny.ace.transformer.service.MappingConfigurationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for managing mapping configurations.
 */
@RestController
@RequestMapping("/api/mappings")
@CrossOrigin(origins = "*")
public class MappingConfigurationController {

    @Autowired
    private MappingConfigurationService mappingConfigService;

    /**
     * Create a new mapping configuration.
     */
    @PostMapping
    public ResponseEntity<MappingConfigurationDTO> createConfiguration(
            @Valid @RequestBody MappingConfigurationDTO configDTO) {
        try {
            MappingConfigurationDTO created = mappingConfigService.createConfiguration(configDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update an existing mapping configuration.
     */
    @PutMapping("/{id}")
    public ResponseEntity<MappingConfigurationDTO> updateConfiguration(
            @PathVariable String id,
            @Valid @RequestBody MappingConfigurationDTO configDTO) {
        try {
            MappingConfigurationDTO updated = mappingConfigService.updateConfiguration(id, configDTO);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get a mapping configuration by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MappingConfigurationDTO> getConfiguration(@PathVariable String id) {
        try {
            MappingConfigurationDTO config = mappingConfigService.getConfiguration(id);
            return ResponseEntity.ok(config);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get a mapping configuration by name.
     */
    @GetMapping("/by-name/{name}")
    public ResponseEntity<MappingConfigurationDTO> getConfigurationByName(@PathVariable String name) {
        try {
            MappingConfigurationDTO config = mappingConfigService.getConfigurationByName(name);
            return ResponseEntity.ok(config);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all mapping configurations.
     */
    @GetMapping
    public ResponseEntity<List<MappingConfigurationDTO>> getAllConfigurations(
            @RequestParam(required = false, defaultValue = "false") Boolean activeOnly) {
        List<MappingConfigurationDTO> configs;
        if (activeOnly) {
            configs = mappingConfigService.getActiveConfigurations();
        } else {
            configs = mappingConfigService.getAllConfigurations();
        }
        return ResponseEntity.ok(configs);
    }

    /**
     * Delete a mapping configuration.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfiguration(@PathVariable String id) {
        try {
            mappingConfigService.deleteConfiguration(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Validate data against configuration rules.
     */
    @PostMapping("/{id}/validate")
    public ResponseEntity<ValidationResultDTO> validateData(
            @PathVariable String id,
            @RequestBody String jsonData) {
        try {
            ValidationResultDTO result = mappingConfigService.validateData(id, jsonData);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (JsonProcessingException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON data");
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Apply filter rules to data.
     */
    @PostMapping("/{id}/filter")
    public ResponseEntity<String> applyFilters(
            @PathVariable String id,
            @RequestBody String jsonData) {
        try {
            String filtered = mappingConfigService.applyFilters(id, jsonData);
            return ResponseEntity.ok(filtered);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (JsonProcessingException e) {
            return ResponseEntity.badRequest().body("{\"error\": \"Invalid JSON data\"}");
        }
    }

    /**
     * Execute validation and filtering in sequence.
     */
    @PostMapping("/{id}/execute")
    public ResponseEntity<Map<String, Object>> executeRules(
            @PathVariable String id,
            @RequestBody String jsonData) {
        try {
            // First validate
            ValidationResultDTO validationResult = mappingConfigService.validateData(id, jsonData);
            
            Map<String, Object> response = new HashMap<>();
            response.put("validation", validationResult);

            // If validation passes, apply filters
            if (validationResult.getIsValid()) {
                String filtered = mappingConfigService.applyFilters(id, jsonData);
                response.put("filteredData", filtered);
                response.put("success", true);
            } else {
                response.put("success", false);
                response.put("message", "Validation failed. Filtering skipped.");
            }

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (JsonProcessingException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Invalid JSON data");
            return ResponseEntity.badRequest().body(error);
        }
    }
}
