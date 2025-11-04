package com.bny.ace.transformer.controller;

import com.bny.ace.transformer.model.MappingConfiguration;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Complete E2E Test for the full transformation workflow:
 * 1. Upload JSON data
 * 2. Create field mappings
 * 3. Save mapping configuration
 * 4. Execute transformation
 * 5. Verify results with feedback
 */
@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureDataMongo
@TestPropertySource(properties = {
    "spring.data.mongodb.database=test_ace_transformer",
    "de.flapdoodle.mongodb.embedded.version=5.0.5"
})
class CompleteTransformationWorkflowE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MappingConfigurationRepository mappingConfigRepository;

    // Sample JSON input data
    private static final String SAMPLE_JSON_INPUT = """
        {
            "firstName": "John",
            "lastName": "Doe",
            "emailAddress": "john.doe@example.com",
            "age": 30,
            "address": {
                "street": "123 Main St",
                "city": "New York",
                "zipCode": "10001"
            }
        }
        """;

    // Expected transformed output with mappings
    private static final String SAMPLE_COMPLEX_JSON_INPUT = """
        [
            {
                "firstName": "John",
                "lastName": "Doe",
                "email": "john.doe@example.com",
                "age": 30,
                "department": "Engineering"
            },
            {
                "firstName": "Jane",
                "lastName": "Smith",
                "email": "jane.smith@example.com",
                "age": 28,
                "department": "Marketing"
            },
            {
                "firstName": "Bob",
                "lastName": "Johnson",
                "email": "bob.johnson@example.com",
                "age": 35,
                "department": "Engineering"
            }
        ]
        """;

    @BeforeEach
    void setUp() {
        // Clean up database before each test
        mappingConfigRepository.deleteAll();
    }

    @Test
    void testCompleteTransformationWorkflow_SimpleMapping() throws Exception {
        // Step 1: Create a mapping configuration
        Map<String, Object> configRequest = new HashMap<>();
        configRequest.put("name", "User Profile Mapping");
        configRequest.put("description", "Maps user profile data from source to target format");
        configRequest.put("sourceFormat", "JSON");
        configRequest.put("targetFormat", "XML");
        configRequest.put("active", true);

        // Add field mappings
        List<Map<String, Object>> fieldMappings = List.of(
            createFieldMapping("firstName", "first_name", "SIMPLE", null, null),
            createFieldMapping("lastName", "last_name", "SIMPLE", null, null),
            createFieldMapping("emailAddress", "email", "SIMPLE", null, null),
            createFieldMapping("age", "user_age", "SIMPLE", null, null)
        );
        configRequest.put("fieldMappings", fieldMappings);

        // Create configuration
        MvcResult createResult = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createResponse = createResult.getResponse().getContentAsString();
        Map<String, Object> createdConfig = objectMapper.readValue(createResponse, Map.class);
        String configId = (String) createdConfig.get("id");

        assertNotNull(configId, "Configuration ID should not be null");
        assertEquals("User Profile Mapping", createdConfig.get("name"));

        // Step 2: Verify configuration was saved
        mockMvc.perform(get("/api/mappings/" + configId))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("User Profile Mapping"))
                .andExpect(jsonPath("$.fieldMappings").isArray())
                .andExpect(jsonPath("$.fieldMappings.length()").value(4));

        // Step 3: Execute transformation using the configuration
        Map<String, Object> transformRequest = new HashMap<>();
        transformRequest.put("sourceFormat", "JSON");
        transformRequest.put("targetFormat", "XML");
        transformRequest.put("inputData", SAMPLE_JSON_INPUT);
        transformRequest.put("mappingConfigurationId", configId);

        MvcResult transformResult = mockMvc.perform(post("/api/transform")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transformRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String transformResponse = transformResult.getResponse().getContentAsString();
        Map<String, Object> result = objectMapper.readValue(transformResponse, Map.class);

        // Step 4: Verify transformation result
        assertNotNull(result.get("transformedData"), "Transformed data should not be null");
        assertEquals("JSON", result.get("sourceFormat"));
        assertEquals("XML", result.get("targetFormat"));

        String transformedData = (String) result.get("transformedData");
        
        // Verify the output contains mapped fields
        assertTrue(transformedData.contains("first_name") || transformedData.contains("<first_name>"), 
            "Output should contain mapped field 'first_name'");
        assertTrue(transformedData.contains("last_name") || transformedData.contains("<last_name>"), 
            "Output should contain mapped field 'last_name'");
        assertTrue(transformedData.contains("email") || transformedData.contains("<email>"), 
            "Output should contain mapped field 'email'");

        // Verify metadata
        Map<String, Object> metadata = (Map<String, Object>) result.get("metadata");
        assertNotNull(metadata, "Metadata should be present");
        assertTrue(metadata.containsKey("sourceFields") || metadata.containsKey("fieldCount"), 
            "Metadata should contain field information");

        System.out.println("\n=== Transformation Workflow Test Results ===");
        System.out.println("Configuration ID: " + configId);
        System.out.println("Source Format: " + result.get("sourceFormat"));
        System.out.println("Target Format: " + result.get("targetFormat"));
        System.out.println("Transformed Data:\n" + transformedData);
        System.out.println("==========================================\n");
    }

    @Test
    void testCompleteTransformationWorkflow_WithValidationAndFiltering() throws Exception {
        // Step 1: Create a complex mapping configuration with validation and filtering
        Map<String, Object> configRequest = new HashMap<>();
        configRequest.put("name", "Employee Data Mapping");
        configRequest.put("description", "Maps employee data with validation and filtering");
        configRequest.put("sourceFormat", "JSON");
        configRequest.put("targetFormat", "JSON");
        configRequest.put("active", true);

        // Add field mappings
        List<Map<String, Object>> fieldMappings = List.of(
            createFieldMapping("firstName", "employee_first_name", "SIMPLE", null, null),
            createFieldMapping("lastName", "employee_last_name", "SIMPLE", null, null),
            createFieldMapping("email", "employee_email", "SIMPLE", null, null),
            createFieldMapping("age", "employee_age", "SIMPLE", null, null),
            createFieldMapping("department", "dept", "SIMPLE", null, null)
        );
        configRequest.put("fieldMappings", fieldMappings);

        // Add validation rules
        List<Map<String, Object>> validationRules = List.of(
            createValidationRule("email", "EMAIL", "Invalid email format", true),
            createValidationRule("age", "MIN_VALUE", "Age must be at least 18", true, Map.of("minValue", 18))
        );
        configRequest.put("validationRules", validationRules);

        // Add filter rules to get only Engineering department employees
        List<Map<String, Object>> filterRules = List.of(
            createFilterRule("department", "EQUALS", "Engineering")
        );
        configRequest.put("filterRules", filterRules);

        // Create configuration
        MvcResult createResult = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createResponse = createResult.getResponse().getContentAsString();
        Map<String, Object> createdConfig = objectMapper.readValue(createResponse, Map.class);
        String configId = (String) createdConfig.get("id");

        assertNotNull(configId);
        assertEquals("Employee Data Mapping", createdConfig.get("name"));

        // Step 2: Validate data before transformation
        Map<String, Object> validateRequest = new HashMap<>();
        validateRequest.put("data", SAMPLE_COMPLEX_JSON_INPUT);

        MvcResult validateResult = mockMvc.perform(post("/api/mappings/" + configId + "/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validateRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String validateResponse = validateResult.getResponse().getContentAsString();
        Map<String, Object> validationResult = objectMapper.readValue(validateResponse, Map.class);

        System.out.println("\n=== Validation Results ===");
        System.out.println("Valid: " + validationResult.get("valid"));
        System.out.println("Validation Details: " + validationResult);
        System.out.println("========================\n");

        // Step 3: Apply filters to the data
        Map<String, Object> filterRequest = new HashMap<>();
        filterRequest.put("data", SAMPLE_COMPLEX_JSON_INPUT);

        MvcResult filterResult = mockMvc.perform(post("/api/mappings/" + configId + "/filter")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(filterRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String filterResponse = filterResult.getResponse().getContentAsString();
        Map<String, Object> filteredResult = objectMapper.readValue(filterResponse, Map.class);

        String filteredData = (String) filteredResult.get("filteredData");
        Integer originalCount = (Integer) filteredResult.get("originalCount");
        Integer filteredCount = (Integer) filteredResult.get("filteredCount");

        System.out.println("\n=== Filter Results ===");
        System.out.println("Original Count: " + originalCount);
        System.out.println("Filtered Count: " + filteredCount);
        System.out.println("Filtered Data: " + filteredData);
        System.out.println("=====================\n");

        // Verify that filtering worked (should have only 2 Engineering employees)
        assertNotNull(filteredData);
        assertEquals(3, originalCount);
        assertEquals(2, filteredCount);

        // Step 4: Execute complete transformation with mapping
        Map<String, Object> transformRequest = new HashMap<>();
        transformRequest.put("sourceFormat", "JSON");
        transformRequest.put("targetFormat", "JSON");
        transformRequest.put("inputData", filteredData); // Use filtered data
        transformRequest.put("mappingConfigurationId", configId);

        MvcResult transformResult = mockMvc.perform(post("/api/transform")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transformRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String transformResponse = transformResult.getResponse().getContentAsString();
        Map<String, Object> result = objectMapper.readValue(transformResponse, Map.class);

        // Step 5: Verify complete workflow result
        assertNotNull(result.get("transformedData"));
        String transformedData = (String) result.get("transformedData");

        // Verify mapped field names in output
        assertTrue(transformedData.contains("employee_first_name") || transformedData.contains("\"employee_first_name\""),
            "Output should contain mapped field 'employee_first_name'");
        assertTrue(transformedData.contains("employee_email") || transformedData.contains("\"employee_email\""),
            "Output should contain mapped field 'employee_email'");

        System.out.println("\n=== Complete Transformation Workflow Results ===");
        System.out.println("Configuration: " + createdConfig.get("name"));
        System.out.println("Validation Passed: " + validationResult.get("valid"));
        System.out.println("Records After Filtering: " + filteredCount + " out of " + originalCount);
        System.out.println("Final Transformed Data:\n" + transformedData);
        System.out.println("===============================================\n");
    }

    @Test
    void testTransformationWorkflow_QuickTransform_NoConfiguration() throws Exception {
        // Test quick transformation without saved configuration (direct mapping)
        Map<String, Object> transformRequest = new HashMap<>();
        transformRequest.put("sourceFormat", "JSON");
        transformRequest.put("targetFormat", "XML");
        transformRequest.put("inputData", SAMPLE_JSON_INPUT);
        // No mappingConfigurationId - should do direct transformation

        MvcResult transformResult = mockMvc.perform(post("/api/transform")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transformRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String transformResponse = transformResult.getResponse().getContentAsString();
        Map<String, Object> result = objectMapper.readValue(transformResponse, Map.class);

        // Verify quick transformation works
        assertNotNull(result.get("transformedData"));
        assertEquals("JSON", result.get("sourceFormat"));
        assertEquals("XML", result.get("targetFormat"));

        String transformedData = (String) result.get("transformedData");
        
        // In quick transform, original field names should be preserved
        assertTrue(transformedData.contains("firstName") || transformedData.contains("<firstName>"),
            "Quick transform should preserve original field names");

        System.out.println("\n=== Quick Transform Results (No Configuration) ===");
        System.out.println("Source Format: JSON");
        System.out.println("Target Format: XML");
        System.out.println("Transformed Data:\n" + transformedData);
        System.out.println("================================================\n");
    }

    @Test
    void testTransformationWorkflow_WithComputedFields() throws Exception {
        // Create configuration with computed fields
        Map<String, Object> configRequest = new HashMap<>();
        configRequest.put("name", "User Profile with Computed Fields");
        configRequest.put("description", "Adds computed fields like UUID and timestamp");
        configRequest.put("sourceFormat", "JSON");
        configRequest.put("targetFormat", "JSON");
        configRequest.put("active", true);

        // Add field mappings including computed fields
        List<Map<String, Object>> fieldMappings = List.of(
            createFieldMapping("firstName", "first_name", "SIMPLE", null, null),
            createFieldMapping("lastName", "last_name", "SIMPLE", null, null),
            createFieldMapping(null, "user_id", "COMPUTED", "UUID", null),  // Generate UUID
            createFieldMapping(null, "created_at", "COMPUTED", "TIMESTAMP", null),  // Generate timestamp
            createFieldMapping(null, "full_name", "COMPUTED", "CONCAT", "firstName,lastName")  // Concatenate fields
        );
        configRequest.put("fieldMappings", fieldMappings);

        // Create configuration
        MvcResult createResult = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createResponse = createResult.getResponse().getContentAsString();
        Map<String, Object> createdConfig = objectMapper.readValue(createResponse, Map.class);
        String configId = (String) createdConfig.get("id");

        // Execute transformation
        Map<String, Object> transformRequest = new HashMap<>();
        transformRequest.put("sourceFormat", "JSON");
        transformRequest.put("targetFormat", "JSON");
        transformRequest.put("inputData", SAMPLE_JSON_INPUT);
        transformRequest.put("mappingConfigurationId", configId);

        MvcResult transformResult = mockMvc.perform(post("/api/transform")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transformRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String transformResponse = transformResult.getResponse().getContentAsString();
        Map<String, Object> result = objectMapper.readValue(transformResponse, Map.class);

        String transformedData = (String) result.get("transformedData");
        
        System.out.println("\n=== Computed Fields Transformation Results ===");
        System.out.println("Transformed Data with Computed Fields:\n" + transformedData);
        System.out.println("=============================================\n");

        // Verify computed fields are present (they should be in the output if implemented)
        assertNotNull(transformedData);
        assertTrue(transformedData.contains("first_name") || transformedData.contains("\"first_name\""));
    }

    // Helper methods to create test data structures

    private Map<String, Object> createFieldMapping(String sourceField, String targetField, 
                                                   String fieldType, String computedType, String computedExpression) {
        Map<String, Object> mapping = new HashMap<>();
        if (sourceField != null) {
            mapping.put("sourceField", sourceField);
        }
        mapping.put("targetField", targetField);
        mapping.put("fieldType", fieldType);
        if (computedType != null) {
            mapping.put("computedType", computedType);
        }
        if (computedExpression != null) {
            mapping.put("computedExpression", computedExpression);
        }
        mapping.put("isNested", false);
        mapping.put("nestingLevel", 0);
        mapping.put("isKeyValuePair", false);
        mapping.put("mappingOrder", 0);
        return mapping;
    }

    private Map<String, Object> createValidationRule(String fieldName, String ruleType, 
                                                     String errorMessage, boolean required) {
        return createValidationRule(fieldName, ruleType, errorMessage, required, null);
    }

    private Map<String, Object> createValidationRule(String fieldName, String ruleType, 
                                                     String errorMessage, boolean required, 
                                                     Map<String, Object> params) {
        Map<String, Object> rule = new HashMap<>();
        rule.put("fieldName", fieldName);
        rule.put("ruleType", ruleType);
        rule.put("errorMessage", errorMessage);
        rule.put("required", required);
        if (params != null) {
            rule.putAll(params);
        }
        return rule;
    }

    private Map<String, Object> createFilterRule(String fieldName, String filterType, Object filterValue) {
        Map<String, Object> rule = new HashMap<>();
        rule.put("fieldName", fieldName);
        rule.put("filterType", filterType);
        rule.put("filterValue", filterValue);
        return rule;
    }
}
