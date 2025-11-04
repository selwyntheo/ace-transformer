package com.bny.ace.transformer.config;

import com.bny.ace.transformer.model.MappingConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.TextIndexDefinition;
import jakarta.annotation.PostConstruct;

/**
 * MongoDB Configuration for creating indexes.
 */
@Configuration
public class MongoDBConfig {

    private final MongoTemplate mongoTemplate;

    public MongoDBConfig(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @PostConstruct
    public void initIndexes() {
        // Compound index for source and target format
        mongoTemplate.indexOps(MappingConfiguration.class)
                .ensureIndex(new Index()
                        .on("sourceFormat", Sort.Direction.ASC)
                        .on("targetFormat", Sort.Direction.ASC)
                        .named("idx_source_target_format"));

        // Index for field mappings source field
        mongoTemplate.indexOps(MappingConfiguration.class)
                .ensureIndex(new Index()
                        .on("fieldMappings.sourceField", Sort.Direction.ASC)
                        .named("idx_field_mapping_source"));

        // Index for field mappings target field
        mongoTemplate.indexOps(MappingConfiguration.class)
                .ensureIndex(new Index()
                        .on("fieldMappings.targetField", Sort.Direction.ASC)
                        .named("idx_field_mapping_target"));

        // Index for validation rules field name
        mongoTemplate.indexOps(MappingConfiguration.class)
                .ensureIndex(new Index()
                        .on("validationRules.fieldName", Sort.Direction.ASC)
                        .named("idx_validation_field_name"));

        // Index for filter rules field name
        mongoTemplate.indexOps(MappingConfiguration.class)
                .ensureIndex(new Index()
                        .on("filterRules.fieldName", Sort.Direction.ASC)
                        .named("idx_filter_field_name"));

        // Text index for search on name and description
        TextIndexDefinition textIndex = TextIndexDefinition.builder()
                .onField("name")
                .onField("description")
                .named("idx_text_search")
                .build();
        mongoTemplate.indexOps(MappingConfiguration.class).ensureIndex(textIndex);
    }
}
