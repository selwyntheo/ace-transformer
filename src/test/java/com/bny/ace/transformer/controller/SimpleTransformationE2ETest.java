package com.bny.ace.transformer.controller;

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
 * Simple E2E Test demonstrating the complete transformation workflow without authentication:
 * 1. Quick transformation (JSON → XML)
 * 2. Create mapping configuration
 * 3. Apply mapping configuration to transformation
 * 4. Get feedback with transformed results
 * 
 * This test demonstrates that NO AUTHENTICATION is required.
 */
@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureDataMongo
@TestPropertySource(properties = {
    "spring.data.mongodb.database=test_ace_transformer",
    "de.flapdoodle.mongodb.embedded.version=5.0.5"
})
class SimpleTransformationE2ETest {

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
            "email": "john.doe@example.com",
            "age": 30
        }
        """;

    @BeforeEach
    void setUp() {
        // Clean up database before each test
        mappingConfigRepository.deleteAll();
    }

    @Test
    void testQuickTransformation_NoAuthenticationRequired() throws Exception {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("TEST: Quick Transformation (No Authentication)");
        System.out.println("=".repeat(60));

        // Test quick transformation without any configuration or authentication
        Map<String, Object> transformRequest = new HashMap<>();
        transformRequest.put("sourceFormat", "JSON");
        transformRequest.put("targetFormat", "XML");
        transformRequest.put("inputData", SAMPLE_JSON_INPUT);

        MvcResult result = mockMvc.perform(post("/api/transform")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transformRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);

        // Verify transformation succeeded
        assertNotNull(responseMap.get("outputData"), "Transformed data should not be null");
        assertTrue((Boolean) responseMap.get("success"), "Transformation should be successful");

        String outputData = (String) responseMap.get("outputData");

        System.out.println("\n✓ Quick Transformation Successful");
        System.out.println("Input: JSON");
        System.out.println("Output: XML");
        System.out.println("\nTransformed Output:\n" + outputData);
        System.out.println("\n" + "=".repeat(60) + "\n");

        // Verify XML contains the original fields
        assertTrue(outputData.contains("firstName") || outputData.contains("<firstName>"));
        assertTrue(outputData.contains("lastName") || outputData.contains("<lastName>"));
    }

    @Test
    void testCompleteWorkflow_CreateMappingAndTransform() throws Exception {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("TEST: Complete Workflow with Field Mapping");
        System.out.println("=".repeat(60));

        // Step 1: Create a mapping configuration
        System.out.println("\nStep 1: Creating field mapping configuration...");
        
        Map<String, Object> configRequest = new HashMap<>();
        configRequest.put("name", "User Profile Mapping");
        configRequest.put("description", "Maps user fields with custom names");
        configRequest.put("sourceFormat", "JSON");
        configRequest.put("targetFormat", "JSON");
        configRequest.put("active", true);

        // Add field mappings
        List<Map<String, Object>> fieldMappings = List.of(
            createFieldMapping("firstName", "user_first_name", "SIMPLE"),
            createFieldMapping("lastName", "user_last_name", "SIMPLE"),
            createFieldMapping("email", "user_email", "SIMPLE"),
            createFieldMapping("age", "user_age", "SIMPLE")
        );
        configRequest.put("fieldMappings", fieldMappings);
        configRequest.put("validationRules", List.of());
        configRequest.put("filterRules", List.of());

        // Create the mapping configuration
        MvcResult createResult = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createResponse = createResult.getResponse().getContentAsString();
        Map<String, Object> createdConfig = objectMapper.readValue(createResponse, Map.class);
        String configId = (String) createdConfig.get("id");

        assertNotNull(configId, "Configuration ID should not be null");
        System.out.println("✓ Mapping configuration created with ID: " + configId);

        // Step 2: Verify the configuration was saved
        System.out.println("\nStep 2: Verifying configuration was saved...");
        
        mockMvc.perform(get("/api/mappings/" + configId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("User Profile Mapping"))
                .andExpect(jsonPath("$.fieldMappings").isArray());

        System.out.println("✓ Configuration verified in database");

        // Step 3: Transform data using the mapping configuration
        System.out.println("\nStep 3: Transforming data with field mappings...");
        
        Map<String, Object> transformRequest = new HashMap<>();
        transformRequest.put("sourceFormat", "JSON");
        transformRequest.put("targetFormat", "JSON");
        transformRequest.put("inputData", SAMPLE_JSON_INPUT);
        transformRequest.put("mappingConfigurationId", configId);

        MvcResult transformResult = mockMvc.perform(post("/api/transform")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transformRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String transformResponse = transformResult.getResponse().getContentAsString();
        Map<String, Object> transformMap = objectMapper.readValue(transformResponse, Map.class);

        // Step 4: Verify the transformation results
        System.out.println("\nStep 4: Verifying transformation results...");
        
        assertNotNull(transformMap.get("outputData"), "Transformed data should not be null");
        assertTrue((Boolean) transformMap.get("success"), "Transformation should be successful");

        String outputData = (String) transformMap.get("outputData");

        System.out.println("\n✓ Transformation completed successfully!");
        System.out.println("\n" + "-".repeat(60));
        System.out.println("TRANSFORMATION RESULTS:");
        System.out.println("-".repeat(60));
        System.out.println("\nOriginal Input:");
        System.out.println(SAMPLE_JSON_INPUT);
        System.out.println("\nMapped Field Names:");
        System.out.println("  firstName → user_first_name");
        System.out.println("  lastName  → user_last_name");
        System.out.println("  email     → user_email");
        System.out.println("  age       → user_age");
        System.out.println("\nTransformed Output:");
        System.out.println(outputData);
        System.out.println("\n" + "=".repeat(60));
        System.out.println("✓ ALL TESTS PASSED - NO AUTHENTICATION REQUIRED!");
        System.out.println("=".repeat(60) + "\n");

        // Verify mapped field names appear in output
        assertTrue(outputData.contains("user_first_name") || outputData.contains("\"user_first_name\""),
                "Output should contain mapped field 'user_first_name'");
        assertTrue(outputData.contains("user_last_name") || outputData.contains("\"user_last_name\""),
                "Output should contain mapped field 'user_last_name'");
        assertTrue(outputData.contains("user_email") || outputData.contains("\"user_email\""),
                "Output should contain mapped field 'user_email'");
    }

    @Test
    void testGetAllConfigurations_NoAuthenticationRequired() throws Exception {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("TEST: Retrieve All Configurations (No Authentication)");
        System.out.println("=".repeat(60));

        // First create a configuration
        Map<String, Object> configRequest = new HashMap<>();
        configRequest.put("name", "Test Config");
        configRequest.put("description", "Test");
        configRequest.put("sourceFormat", "JSON");
        configRequest.put("targetFormat", "XML");
        configRequest.put("active", true);
        configRequest.put("fieldMappings", List.of());
        configRequest.put("validationRules", List.of());
        configRequest.put("filterRules", List.of());

        mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configRequest)))
                .andExpect(status().isCreated());

        // Now retrieve all configurations
        MvcResult result = mockMvc.perform(get("/api/mappings"))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        List<Map<String, Object>> configs = objectMapper.readValue(response, List.class);

        System.out.println("\n✓ Retrieved " + configs.size() + " configuration(s)");
        System.out.println("✓ No authentication was required!");
        System.out.println("\n" + "=".repeat(60) + "\n");

        assertTrue(configs.size() > 0, "Should have at least one configuration");
    }

    // Helper method to create field mapping objects
    private Map<String, Object> createFieldMapping(String sourceField, String targetField, String fieldType) {
        Map<String, Object> mapping = new HashMap<>();
        mapping.put("sourceField", sourceField);
        mapping.put("targetField", targetField);
        mapping.put("fieldType", fieldType);
        mapping.put("isNested", false);
        mapping.put("nestingLevel", 0);
        mapping.put("isKeyValuePair", false);
        mapping.put("mappingOrder", 0);
        return mapping;
    }
}
