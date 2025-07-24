package com.acetransformer.universaldatatransformer.service;

import com.acetransformer.universaldatatransformer.model.MappingConfiguration;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing mapping configurations.
 * Note: This is a simplified implementation. In a real application,
 * this would use JPA repositories for database persistence.
 */
@Service
public class MappingConfigurationService {

    // Simple in-memory storage for demonstration
    private List<MappingConfiguration> configurations = new ArrayList<>();
    private Long nextId = 1L;

    public List<MappingConfiguration> findAll() {
        return new ArrayList<>(configurations);
    }

    public MappingConfiguration findById(Long id) {
        return configurations.stream()
                .filter(config -> config.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public MappingConfiguration save(MappingConfiguration configuration) {
        if (configuration.getId() == null) {
            configuration.setId(nextId++);
            configurations.add(configuration);
        } else {
            // Update existing
            Optional<MappingConfiguration> existing = configurations.stream()
                    .filter(config -> config.getId().equals(configuration.getId()))
                    .findFirst();
            if (existing.isPresent()) {
                int index = configurations.indexOf(existing.get());
                configurations.set(index, configuration);
            }
        }
        return configuration;
    }

    public void deleteById(Long id) {
        configurations.removeIf(config -> config.getId().equals(id));
    }
}
