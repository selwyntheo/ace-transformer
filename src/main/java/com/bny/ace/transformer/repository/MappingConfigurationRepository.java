package com.bny.ace.transformer.repository;

import com.bny.ace.transformer.model.DataFormat;
import com.bny.ace.transformer.model.MappingConfiguration;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * MongoDB Repository for MappingConfiguration documents.
 */
@Repository
public interface MappingConfigurationRepository extends MongoRepository<MappingConfiguration, String> {

    /**
     * Find configuration by unique name.
     */
    Optional<MappingConfiguration> findByName(String name);

    /**
     * Find all active configurations.
     */
    List<MappingConfiguration> findByActiveTrue();

    /**
     * Find configurations by source format.
     */
    List<MappingConfiguration> findBySourceFormat(DataFormat sourceFormat);

    /**
     * Find configurations by target format.
     */
    List<MappingConfiguration> findByTargetFormat(DataFormat targetFormat);

    /**
     * Find configurations by source and target format.
     */
    List<MappingConfiguration> findBySourceFormatAndTargetFormat(DataFormat sourceFormat, DataFormat targetFormat);

    /**
     * Find active configurations by source and target format.
     */
    List<MappingConfiguration> findBySourceFormatAndTargetFormatAndActiveTrue(
            DataFormat sourceFormat, DataFormat targetFormat);

    /**
     * Check if configuration exists by name.
     */
    boolean existsByName(String name);

    /**
     * Find configurations with specific field mapping source field.
     */
    @Query("{ 'fieldMappings.sourceField': ?0 }")
    List<MappingConfiguration> findByFieldMappingSourceField(String sourceField);

    /**
     * Find configurations with specific validation rule type.
     */
    @Query("{ 'validationRules.ruleType': ?0 }")
    List<MappingConfiguration> findByValidationRuleType(String ruleType);

    /**
     * Find configurations with specific filter rule type.
     */
    @Query("{ 'filterRules.filterType': ?0 }")
    List<MappingConfiguration> findByFilterRuleType(String filterType);

    /**
     * Find most used configurations.
     */
    @Query(value = "{}", sort = "{ usageCount: -1 }")
    List<MappingConfiguration> findTopByOrderByUsageCountDesc();

    /**
     * Text search on name and description.
     */
    @Query("{ $text: { $search: ?0 } }")
    List<MappingConfiguration> searchByText(String searchText);
}
