package com.bny.ace.transformer.controller;

import com.bny.ace.transformer.dto.*;
import com.bny.ace.transformer.repository.MappingConfigurationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.AutoConfigureDataMongo;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * E2E tests for MappingConfiguration REST API with MongoDB.
 */
@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureDataMongo
@TestPropertySource(properties = {
    "spring.data.mongodb.database=test_ace_transformer",
    "spring.mongodb.embedded.version=5.0.5"
})
public class MappingConfigurationE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private MappingConfigurationRepository mappingConfigRepository;

    private MappingConfigurationDTO sampleConfig;

    @BeforeEach
    public void setUp() {
        // Clear database before each test
        mappingConfigRepository.deleteAll();
        
        // Create sample configuration
        sampleConfig = new MappingConfigurationDTO();
        sampleConfig.setName("Test Configuration");
        sampleConfig.setDescription("Test Description");
        sampleConfig.setSourceFormat("JSON");
        sampleConfig.setTargetFormat("XML");
        sampleConfig.setActive(true);

        // Add sample field mapping
        List<FieldMappingDTO> fieldMappings = new ArrayList<>();
        FieldMappingDTO fm = new FieldMappingDTO();
        fm.setSourceField("name");
        fm.setTargetField("fullName");
        fm.setFieldType("SIMPLE");
        fieldMappings.add(fm);
        sampleConfig.setFieldMappings(fieldMappings);
    }

    @Test
    public void testCreateConfiguration() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleConfig)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Test Configuration"))
                .andReturn();

        String response = result.getResponse().getContentAsString();
        MappingConfigurationDTO created = objectMapper.readValue(response, MappingConfigurationDTO.class);
        
        // MongoDB uses String IDs
        assertNotNull(created.getId());
        assertTrue(created.getId() instanceof String);
        assertFalse(created.getId().isEmpty());
    }

    @Test
    public void testGetConfiguration() throws Exception {
        // Create configuration first
        MvcResult createResult = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleConfig)))
                .andExpect(status().isCreated())
                .andReturn();

        MappingConfigurationDTO created = objectMapper.readValue(
            createResult.getResponse().getContentAsString(), 
            MappingConfigurationDTO.class);

        // Get configuration by ID
        mockMvc.perform(get("/api/mappings/" + created.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId()))
                .andExpect(jsonPath("$.name").value("Test Configuration"));
    }

    @Test
    public void testGetConfigurationByName() throws Exception {
        // Create configuration
        mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleConfig)))
                .andExpect(status().isCreated());

        // Get by name
        mockMvc.perform(get("/api/mappings/by-name/Test Configuration"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Configuration"));
    }

    @Test
    public void testGetAllConfigurations() throws Exception {
        // Create two configurations
        mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleConfig)))
                .andExpect(status().isCreated());

        MappingConfigurationDTO config2 = new MappingConfigurationDTO();
        config2.setName("Second Config");
        config2.setSourceFormat("XML");
        config2.setTargetFormat("JSON");
        
        mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(config2)))
                .andExpect(status().isCreated());

        // Get all
        mockMvc.perform(get("/api/mappings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    public void testUpdateConfiguration() throws Exception {
        // Create configuration
        MvcResult createResult = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleConfig)))
                .andExpect(status().isCreated())
                .andReturn();

        MappingConfigurationDTO created = objectMapper.readValue(
            createResult.getResponse().getContentAsString(), 
            MappingConfigurationDTO.class);

        // Update
        created.setDescription("Updated Description");
        
        mockMvc.perform(put("/api/mappings/" + created.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(created)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated Description"));
    }

    @Test
    public void testDeleteConfiguration() throws Exception {
        // Create configuration
        MvcResult createResult = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleConfig)))
                .andExpect(status().isCreated())
                .andReturn();

        MappingConfigurationDTO created = objectMapper.readValue(
            createResult.getResponse().getContentAsString(), 
            MappingConfigurationDTO.class);

        // Delete
        mockMvc.perform(delete("/api/mappings/" + created.getId()))
                .andExpect(status().isNoContent());

        // Verify deleted
        mockMvc.perform(get("/api/mappings/" + created.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testValidateData_Success() throws Exception {
        // Create configuration with validation rules
        MappingConfigurationDTO config = new MappingConfigurationDTO();
        config.setName("Validation Test");
        config.setSourceFormat("JSON");
        config.setTargetFormat("XML");

        List<ValidationRuleDTO> rules = new ArrayList<>();
        ValidationRuleDTO rule = new ValidationRuleDTO();
        rule.setFieldName("email");
        rule.setRuleType("EMAIL");
        rule.setErrorMessage("Invalid email");
        rules.add(rule);
        config.setValidationRules(rules);

        MvcResult createResult = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(config)))
                .andExpect(status().isCreated())
                .andReturn();

        MappingConfigurationDTO created = objectMapper.readValue(
            createResult.getResponse().getContentAsString(), 
            MappingConfigurationDTO.class);

        // Valid data
        String validData = "{\"email\": \"test@example.com\"}";
        
        mockMvc.perform(post("/api/mappings/" + created.getId() + "/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validData))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isValid").value(true));
    }

    @Test
    public void testValidateData_Failure() throws Exception {
        // Create configuration with validation rules
        MappingConfigurationDTO config = new MappingConfigurationDTO();
        config.setName("Validation Failure Test");
        config.setSourceFormat("JSON");
        config.setTargetFormat("XML");

        List<ValidationRuleDTO> rules = new ArrayList<>();
        ValidationRuleDTO rule = new ValidationRuleDTO();
        rule.setFieldName("email");
        rule.setRuleType("EMAIL");
        rule.setErrorMessage("Invalid email");
        rules.add(rule);
        config.setValidationRules(rules);

        MvcResult createResult = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(config)))
                .andExpect(status().isCreated())
                .andReturn();

        MappingConfigurationDTO created = objectMapper.readValue(
            createResult.getResponse().getContentAsString(), 
            MappingConfigurationDTO.class);

        // Invalid data
        String invalidData = "{\"email\": \"not-an-email\"}";
        
        mockMvc.perform(post("/api/mappings/" + created.getId() + "/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidData))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isValid").value(false))
                .andExpect(jsonPath("$.errors", hasSize(greaterThan(0))));
    }

    @Test
    public void testApplyFilters() throws Exception {
        // Create configuration with filter rules
        MappingConfigurationDTO config = new MappingConfigurationDTO();
        config.setName("Filter Test");
        config.setSourceFormat("JSON");
        config.setTargetFormat("XML");

        List<FilterRuleDTO> filters = new ArrayList<>();
        FilterRuleDTO filter = new FilterRuleDTO();
        filter.setFieldName("age");
        filter.setFilterType("GREATER_OR_EQUAL");
        filter.setFilterValue("18");
        filter.setLogicalOperator("AND");
        filters.add(filter);
        config.setFilterRules(filters);

        MvcResult createResult = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(config)))
                .andExpect(status().isCreated())
                .andReturn();

        MappingConfigurationDTO created = objectMapper.readValue(
            createResult.getResponse().getContentAsString(), 
            MappingConfigurationDTO.class);

        // Data that passes filter
        String data = "[{\"name\":\"John\",\"age\":25},{\"name\":\"Jane\",\"age\":15}]";
        
        mockMvc.perform(post("/api/mappings/" + created.getId() + "/filter")
                .contentType(MediaType.APPLICATION_JSON)
                .content(data))
                .andExpect(status().isOk());
    }

    @Test
    public void testComplexFieldMapping() throws Exception {
        MappingConfigurationDTO config = new MappingConfigurationDTO();
        config.setName("Complex Mapping Test");
        config.setSourceFormat("JSON");
        config.setTargetFormat("XML");

        List<FieldMappingDTO> mappings = new ArrayList<>();
        
        // Simple mapping
        FieldMappingDTO fm1 = new FieldMappingDTO();
        fm1.setSourceField("firstName");
        fm1.setTargetField("first_name");
        fm1.setFieldType("SIMPLE");
        mappings.add(fm1);
        
        // Computed field
        FieldMappingDTO fm2 = new FieldMappingDTO();
        fm2.setTargetField("id");
        fm2.setFieldType("COMPUTED");
        fm2.setComputedType("UUID");
        mappings.add(fm2);
        
        config.setFieldMappings(mappings);

        mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(config)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fieldMappings", hasSize(2)));
    }

    @Test
    public void testValidationRuleTypes() throws Exception {
        MappingConfigurationDTO config = new MappingConfigurationDTO();
        config.setName("Validation Rules Test");
        config.setSourceFormat("JSON");
        config.setTargetFormat("XML");

        List<ValidationRuleDTO> rules = new ArrayList<>();
        
        // EMAIL rule
        ValidationRuleDTO emailRule = new ValidationRuleDTO();
        emailRule.setFieldName("email");
        emailRule.setRuleType("EMAIL");
        rules.add(emailRule);
        
        // MIN_LENGTH rule
        ValidationRuleDTO lengthRule = new ValidationRuleDTO();
        lengthRule.setFieldName("name");
        lengthRule.setRuleType("MIN_LENGTH");
        lengthRule.setRuleValue("3");
        rules.add(lengthRule);
        
        // NUMERIC rule
        ValidationRuleDTO numericRule = new ValidationRuleDTO();
        numericRule.setFieldName("age");
        numericRule.setRuleType("NUMERIC");
        rules.add(numericRule);
        
        config.setValidationRules(rules);

        mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(config)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.validationRules", hasSize(3)));
    }

    @Test
    public void testFilterRuleTypes() throws Exception {
        MappingConfigurationDTO config = new MappingConfigurationDTO();
        config.setName("Filter Rules Test");
        config.setSourceFormat("JSON");
        config.setTargetFormat("XML");

        List<FilterRuleDTO> filters = new ArrayList<>();
        
        // EQUALS filter
        FilterRuleDTO equalsFilter = new FilterRuleDTO();
        equalsFilter.setFieldName("status");
        equalsFilter.setFilterType("EQUALS");
        equalsFilter.setFilterValue("active");
        filters.add(equalsFilter);
        
        // GREATER_THAN filter
        FilterRuleDTO gtFilter = new FilterRuleDTO();
        gtFilter.setFieldName("age");
        gtFilter.setFilterType("GREATER_THAN");
        gtFilter.setFilterValue("21");
        filters.add(gtFilter);
        
        config.setFilterRules(filters);

        mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(config)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.filterRules", hasSize(2)));
    }

    @Test
    public void testExecuteRules() throws Exception {
        // Create configuration with both validation and filter rules
        MappingConfigurationDTO config = new MappingConfigurationDTO();
        config.setName("Execute Rules Test");
        config.setSourceFormat("JSON");
        config.setTargetFormat("XML");

        // Validation rules
        List<ValidationRuleDTO> rules = new ArrayList<>();
        ValidationRuleDTO emailRule = new ValidationRuleDTO();
        emailRule.setFieldName("email");
        emailRule.setRuleType("EMAIL");
        rules.add(emailRule);
        config.setValidationRules(rules);

        // Filter rules
        List<FilterRuleDTO> filters = new ArrayList<>();
        FilterRuleDTO ageFilter = new FilterRuleDTO();
        ageFilter.setFieldName("age");
        ageFilter.setFilterType("GREATER_OR_EQUAL");
        ageFilter.setFilterValue("18");
        filters.add(ageFilter);
        config.setFilterRules(filters);

        MvcResult createResult = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(config)))
                .andExpect(status().isCreated())
                .andReturn();

        MappingConfigurationDTO created = objectMapper.readValue(
            createResult.getResponse().getContentAsString(), 
            MappingConfigurationDTO.class);

        // Valid data
        String validData = "[{\"email\":\"test@example.com\",\"age\":25}]";
        
        mockMvc.perform(post("/api/mappings/" + created.getId() + "/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validData))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.validation.isValid").value(true));
    }
}
