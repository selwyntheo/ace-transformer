package com.acetransformer.universaldatatransformer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for the Universal Data Transformer.
 * This Spring Boot application provides universal data transformation capabilities
 * between JSON, XML, CSV, and TXT formats with configurable field mappings.
 */
@SpringBootApplication
public class UniversalDataTransformerApplication {

    public static void main(String[] args) {
        SpringApplication.run(UniversalDataTransformerApplication.class, args);
    }
}
