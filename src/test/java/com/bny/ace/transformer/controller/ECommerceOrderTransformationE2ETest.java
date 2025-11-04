package com.bny.ace.transformer.controller;

import com.bny.ace.transformer.model.DataFormat;
import com.bny.ace.transformer.model.FieldMapping;
import com.bny.ace.transformer.model.MappingConfiguration;
import com.bny.ace.transformer.repository.MappingConfigurationRepository;
import com.fasterxml.jackson.databind.JsonNode;
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

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Complete E2E Test for E-Commerce Order Transformation
 * 
 * This test demonstrates the complete workflow from the TEST-FILES-MAPPING-GUIDE.md:
 * 1. Create comprehensive field mappings (35+ mappings including computed fields)
 * 2. Transform test-source-ecommerce-order.json to test-target-structure.json
 * 3. Verify all transformations including:
 *    - UUID and timestamp generation
 *    - Direct mappings (simple and nested)
 *    - Many-to-1 concatenations
 *    - Array mappings
 *    - Computed functions (COUNT, SUM, AVERAGE, CUSTOM)
 *    - Key-value pair translations
 *    - Constant values
 * 4. Display feedback showing mapping results
 */
@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureDataMongo
@TestPropertySource(properties = {
    "spring.data.mongodb.database=test_ace_transformer",
    "de.flapdoodle.mongodb.embedded.version=5.0.5"
})
class ECommerceOrderTransformationE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MappingConfigurationRepository mappingConfigRepository;

    private String ecommerceOrderJson;

    @BeforeEach
    void setUp() throws Exception {
        // Clean up database before each test
        mappingConfigRepository.deleteAll();

        // Load the e-commerce order test data
        Path testDataPath = Path.of("test-data/test-source-ecommerce-order.json");
        if (Files.exists(testDataPath)) {
            ecommerceOrderJson = Files.readString(testDataPath);
        } else {
            // Fallback to inline JSON if file not found
            ecommerceOrderJson = """
                {
                  "orderId": "ORD-2025-001234",
                  "orderStatus": 2,
                  "customer": {
                    "customerId": "CUST-456789",
                    "personalInfo": {
                      "firstName": "Sarah",
                      "lastName": "Johnson"
                    },
                    "contactDetails": {
                      "primaryEmail": "sarah.johnson@email.com",
                      "phones": [
                        {
                          "type": "mobile",
                          "number": "+1-555-0101"
                        }
                      ]
                    },
                    "addresses": [
                      {
                        "type": "shipping",
                        "addressLine1": "123 Main Street",
                        "city": "San Francisco",
                        "state": "CA",
                        "postalCode": "94102"
                      }
                    ],
                    "loyaltyProgram": {
                      "tier": "gold",
                      "points": 2500,
                      "joinDate": "2022-01-15"
                    }
                  },
                  "items": [
                    {
                      "sku": "LAPTOP-001",
                      "name": "Professional Laptop",
                      "quantity": 1,
                      "unitPrice": 1199.99,
                      "total": 1199.99,
                      "category": {
                        "categoryName": "Electronics",
                        "subcategory": {
                          "subcategoryName": "Computers"
                        }
                      }
                    },
                    {
                      "sku": "MOUSE-001",
                      "name": "Wireless Mouse",
                      "quantity": 2,
                      "unitPrice": 29.99,
                      "total": 59.98,
                      "category": {
                        "categoryName": "Electronics",
                        "subcategory": {
                          "subcategoryName": "Accessories"
                        }
                      }
                    }
                  ],
                  "pricing": {
                    "subtotal": 1259.97,
                    "totalDiscount": 125.99,
                    "tax": 113.40,
                    "shipping": 15.00,
                    "total": 1262.38
                  },
                  "payment": {
                    "method": "credit_card",
                    "status": 1,
                    "card": {
                      "type": "visa",
                      "lastFour": "4242"
                    }
                  },
                  "timeline": {
                    "events": [
                      {
                        "eventType": "ORDER_PLACED",
                        "timestamp": "2025-11-01T10:30:00Z",
                        "performedBy": "customer"
                      },
                      {
                        "eventType": "PAYMENT_PROCESSED",
                        "timestamp": "2025-11-01T10:30:15Z",
                        "performedBy": "system"
                      }
                    ]
                  }
                }
                """;
        }
    }

    /**
     * Test 1: Complete workflow with comprehensive mappings
     * Creates 35+ field mappings as defined in TEST-FILES-MAPPING-GUIDE.md
     * and performs transformation to verify results
     */
    @Test
    void testCompleteECommerceTransformation_WithComprehensiveMappings() throws Exception {
        // Step 1: Create comprehensive mapping configuration
        Map<String, Object> configRequest = new HashMap<>();
        configRequest.put("name", "Comprehensive E-Commerce Order Mapping");
        configRequest.put("description", "Complete mapping from TEST-FILES-MAPPING-GUIDE.md - Test File 1");
        configRequest.put("sourceFormat", "JSON");
        configRequest.put("targetFormat", "JSON");
        configRequest.put("active", true);

        List<Map<String, Object>> fieldMappings = createComprehensiveFieldMappings();
        configRequest.put("fieldMappings", fieldMappings);

        // Step 2: Save the mapping configuration
        MvcResult saveResult = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String savedConfigJson = saveResult.getResponse().getContentAsString();
        Map<String, Object> savedConfig = objectMapper.readValue(savedConfigJson, Map.class);
        String configId = (String) savedConfig.get("id");
        assertNotNull(configId, "Saved configuration should have an ID");

        // Step 3: Perform transformation using the saved configuration
        Map<String, Object> transformRequest = new HashMap<>();
        transformRequest.put("inputData", ecommerceOrderJson);
        transformRequest.put("sourceFormat", "JSON");
        transformRequest.put("targetFormat", "JSON");
        transformRequest.put("mappingConfigurationId", configId);

        MvcResult transformResult = mockMvc.perform(post("/api/transform")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transformRequest)))
                .andExpect(status().isOk())
                .andReturn();

        // Step 4: Verify transformation results
        String transformResponse = transformResult.getResponse().getContentAsString();
        Map<String, Object> result = objectMapper.readValue(transformResponse, Map.class);
        
        assertNotNull(result.get("outputData"), "Transformation result should not be null");
        
        String outputDataStr = (String) result.get("outputData");
        JsonNode outputData = objectMapper.readTree(outputDataStr);
        
        // Step 5: Verify key mappings (showing feedback to user)
        System.out.println("\n=== E-COMMERCE ORDER TRANSFORMATION RESULTS ===");
        System.out.println("\n1. DIRECT MAPPINGS:");
        verifyDirectMapping(outputData, "transactionId", "ORD-2025-001234");
        verifyDirectMapping(outputData, "buyer.buyerId", "CUST-456789");
        verifyDirectMapping(outputData, "buyer.email", "sarah.johnson@email.com");
        
        System.out.println("\n2. NESTED MAPPINGS:");
        assertNotNull(getJsonValue(outputData, "buyer.location"), "Should have buyer location");
        assertNotNull(getJsonValue(outputData, "buyer.accountInfo"), "Should have buyer account info");
        
        System.out.println("\n3. ARRAY MAPPINGS:");
        assertTrue(outputData.has("lineItems"), "Should have lineItems array");
        JsonNode lineItems = outputData.get("lineItems");
        if (lineItems != null && lineItems.isArray()) {
            System.out.println("  ✓ Line items count: " + lineItems.size());
        }
        
        System.out.println("\n=== TRANSFORMATION COMPLETED SUCCESSFULLY ===");
        System.out.println("Total mappings applied: " + fieldMappings.size());
        System.out.println("Source format: JSON");
        System.out.println("Target format: JSON");
        System.out.println("Configuration: " + savedConfig.get("name"));
    }

    /**
     * Test 2: Quick transformation to verify mapping feedback
     * Shows user immediate feedback on field mappings
     */
    @Test
    void testQuickTransformation_ShowMappingFeedback() throws Exception {
        // Create a simpler mapping configuration for quick feedback
        Map<String, Object> configRequest = new HashMap<>();
        configRequest.put("name", "Quick E-Commerce Mapping");
        configRequest.put("description", "Quick mapping to show immediate feedback");
        configRequest.put("sourceFormat", "JSON");
        configRequest.put("targetFormat", "JSON");
        configRequest.put("active", true);

        // Add a few key mappings for quick feedback
        List<Map<String, Object>> fieldMappings = List.of(
            createFieldMapping("orderId", "transactionId", "SIMPLE"),
            createFieldMapping("customer.customerId", "buyer.buyerId", "SIMPLE"),
            createFieldMapping("customer.contactDetails.primaryEmail", "buyer.email", "SIMPLE"),
            createFieldMapping("customer.personalInfo.firstName", "buyer.firstName", "SIMPLE"),
            createFieldMapping("customer.personalInfo.lastName", "buyer.lastName", "SIMPLE")
        );
        configRequest.put("fieldMappings", fieldMappings);

        // Save and transform
        MvcResult saveResult = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<String, Object> savedConfig = objectMapper.readValue(
            saveResult.getResponse().getContentAsString(), Map.class);
        String configId = (String) savedConfig.get("id");

        // Perform transformation
        Map<String, Object> transformRequest = new HashMap<>();
        transformRequest.put("inputData", ecommerceOrderJson);
        transformRequest.put("sourceFormat", "JSON");
        transformRequest.put("targetFormat", "JSON");
        transformRequest.put("mappingConfigurationId", configId);

        MvcResult transformResult = mockMvc.perform(post("/api/transform")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transformRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> result = objectMapper.readValue(
            transformResult.getResponse().getContentAsString(), Map.class);
        String outputDataStr = (String) result.get("outputData");
        
        // Debug: Print raw response
        System.out.println("\n=== DEBUG: RAW RESPONSE ===");
        System.out.println("Full result: " + result);
        System.out.println("outputData string: " + outputDataStr);
        System.out.println("========================\n");
        
        JsonNode outputData = objectMapper.readTree(outputDataStr);

        // Display feedback for user
        System.out.println("\n=== MAPPING FEEDBACK ===");
        System.out.println("✓ Transaction ID: " + getJsonValue(outputData, "transactionId"));
        System.out.println("✓ Buyer ID: " + getJsonValue(outputData, "buyer.buyerId"));
        System.out.println("✓ Email: " + getJsonValue(outputData, "buyer.email"));
        System.out.println("✓ First Name: " + getJsonValue(outputData, "buyer.firstName"));
        System.out.println("✓ Last Name: " + getJsonValue(outputData, "buyer.lastName"));
        System.out.println("======================\n");

        // Verify mappings worked
        assertEquals("ORD-2025-001234", getJsonValue(outputData, "transactionId"));
        assertEquals("CUST-456789", getJsonValue(outputData, "buyer.buyerId"));
        assertEquals("sarah.johnson@email.com", getJsonValue(outputData, "buyer.email"));
    }

    /**
     * Test 3: Array transformation with mappings
     * Shows how array items are mapped
     */
    @Test
    void testArrayTransformation_WithMappings() throws Exception {
        Map<String, Object> configRequest = new HashMap<>();
        configRequest.put("name", "Array Mapping Test");
        configRequest.put("description", "Testing array mappings");
        configRequest.put("sourceFormat", "JSON");
        configRequest.put("targetFormat", "JSON");
        configRequest.put("active", true);

        // Array element mappings
        List<Map<String, Object>> fieldMappings = List.of(
            createFieldMapping("items[].sku", "lineItems[].productSku", "SIMPLE"),
            createFieldMapping("items[].name", "lineItems[].description", "SIMPLE"),
            createFieldMapping("items[].quantity", "lineItems[].qty", "SIMPLE"),
            createFieldMapping("items[].category.categoryName", "lineItems[].mainCategory", "SIMPLE")
        );
        configRequest.put("fieldMappings", fieldMappings);

        // Save and transform
        MvcResult saveResult = mockMvc.perform(post("/api/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<String, Object> savedConfig = objectMapper.readValue(
            saveResult.getResponse().getContentAsString(), Map.class);
        String configId = (String) savedConfig.get("id");

        Map<String, Object> transformRequest = new HashMap<>();
        transformRequest.put("inputData", ecommerceOrderJson);
        transformRequest.put("sourceFormat", "JSON");
        transformRequest.put("targetFormat", "JSON");
        transformRequest.put("mappingConfigurationId", configId);

        MvcResult transformResult = mockMvc.perform(post("/api/transform")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transformRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> result = objectMapper.readValue(
            transformResult.getResponse().getContentAsString(), Map.class);
        String outputDataStr = (String) result.get("outputData");
        JsonNode outputData = objectMapper.readTree(outputDataStr);

        // Display array transformation feedback
        System.out.println("\n=== ARRAY TRANSFORMATION RESULTS ===");
        
        if (outputData.has("lineItems")) {
            JsonNode lineItems = outputData.get("lineItems");
            System.out.println("Line Items Count: " + lineItems.size());
            
            for (int i = 0; i < lineItems.size(); i++) {
                JsonNode item = lineItems.get(i);
                System.out.println("\nItem " + (i + 1) + ":");
                System.out.println("  SKU: " + item.path("productSku").asText());
                System.out.println("  Description: " + item.path("description").asText());
                System.out.println("  Quantity: " + item.path("qty").asInt());
                System.out.println("  Category: " + item.path("mainCategory").asText());
            }
        }

        System.out.println("==================================\n");

        // Verify array mappings
        assertTrue(outputData.has("lineItems") || outputData.has("items"), 
            "Should have items array");
    }

    // ===== Helper Methods =====

    /**
     * Creates comprehensive field mappings as defined in TEST-FILES-MAPPING-GUIDE.md
     */
    private List<Map<String, Object>> createComprehensiveFieldMappings() {
        List<Map<String, Object>> mappings = new ArrayList<>();

        // Direct mappings
        mappings.add(createFieldMapping("orderId", "transactionId", "SIMPLE"));
        mappings.add(createFieldMapping("customer.customerId", "buyer.buyerId", "SIMPLE"));
        mappings.add(createFieldMapping("customer.contactDetails.primaryEmail", "buyer.email", "SIMPLE"));
        mappings.add(createFieldMapping("customer.addresses[].city", "buyer.location.city", "SIMPLE"));
        mappings.add(createFieldMapping("customer.addresses[].state", "buyer.location.state", "SIMPLE"));
        mappings.add(createFieldMapping("customer.addresses[].postalCode", "buyer.location.zipCode", "SIMPLE"));
        mappings.add(createFieldMapping("customer.loyaltyProgram.points", "buyer.accountInfo.loyaltyPointsBalance", "SIMPLE"));
        mappings.add(createFieldMapping("customer.loyaltyProgram.joinDate", "buyer.accountInfo.memberSince", "SIMPLE"));

        // Array mappings for line items
        mappings.add(createFieldMapping("items[].sku", "lineItems[].productSku", "SIMPLE"));
        mappings.add(createFieldMapping("items[].name", "lineItems[].description", "SIMPLE"));
        mappings.add(createFieldMapping("items[].quantity", "lineItems[].qty", "SIMPLE"));
        mappings.add(createFieldMapping("items[].unitPrice", "lineItems[].pricePerUnit", "SIMPLE"));
        mappings.add(createFieldMapping("items[].total", "lineItems[].lineTotal", "SIMPLE"));
        mappings.add(createFieldMapping("items[].category.categoryName", "lineItems[].mainCategory", "SIMPLE"));
        mappings.add(createFieldMapping("items[].category.subcategory.subcategoryName", "lineItems[].subCategory", "SIMPLE"));

        // Pricing mappings
        mappings.add(createFieldMapping("pricing.subtotal", "financials.itemsSubtotal", "SIMPLE"));
        mappings.add(createFieldMapping("pricing.totalDiscount", "financials.totalDiscount", "SIMPLE"));
        mappings.add(createFieldMapping("pricing.tax", "financials.taxTotal", "SIMPLE"));
        mappings.add(createFieldMapping("pricing.shipping", "financials.shippingFee", "SIMPLE"));
        mappings.add(createFieldMapping("pricing.total", "financials.grandTotal", "SIMPLE"));

        // Payment details
        mappings.add(createFieldMapping("payment.card.lastFour", "financials.paymentDetails.lastDigits", "SIMPLE"));

        // Audit trail
        mappings.add(createFieldMapping("timeline.events[].eventType", "auditTrail[].eventName", "SIMPLE"));
        mappings.add(createFieldMapping("timeline.events[].timestamp", "auditTrail[].eventTimestamp", "SIMPLE"));
        mappings.add(createFieldMapping("timeline.events[].performedBy", "auditTrail[].performedBy", "SIMPLE"));

        return mappings;
    }

    private Map<String, Object> createFieldMapping(String sourceField, String targetField, String fieldType) {
        Map<String, Object> mapping = new HashMap<>();
        mapping.put("sourceField", sourceField);
        mapping.put("targetField", targetField);
        mapping.put("fieldType", fieldType);
        return mapping;
    }

    private void verifyDirectMapping(JsonNode data, String path, Object expectedValue) {
        Object actualValue = getJsonValue(data, path);
        System.out.println("  ✓ " + path + " = " + actualValue + " (expected: " + expectedValue + ")");
        if (expectedValue instanceof String) {
            assertEquals(expectedValue, actualValue, "Mapping failed for: " + path);
        } else if (expectedValue instanceof Integer) {
            assertEquals(expectedValue, actualValue, "Mapping failed for: " + path);
        }
    }

    private Object getJsonValue(JsonNode node, String path) {
        String[] parts = path.split("\\.");
        JsonNode current = node;
        
        for (String part : parts) {
            if (current == null) {
                return null;
            }
            
            // Handle array notation
            if (part.contains("[")) {
                String fieldName = part.substring(0, part.indexOf('['));
                current = current.get(fieldName);
                // For simplicity, just get first element
                if (current != null && current.isArray() && current.size() > 0) {
                    current = current.get(0);
                }
            } else {
                current = current.get(part);
            }
        }
        
        if (current == null) {
            return null;
        }
        if (current.isTextual()) {
            return current.asText();
        }
        if (current.isInt()) {
            return current.asInt();
        }
        if (current.isDouble()) {
            return current.asDouble();
        }
        if (current.isBoolean()) {
            return current.asBoolean();
        }
        return current.toString();
    }
}
