package com.bny.ace.transformer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for the Ace Transformer.
 * This Spring Boot application provides universal data transformation capabilities
 * between JSON, XML, CSV, and TXT formats with configurable field mappings.
 */
@SpringBootApplication
public class AceTransformerApplication {

    public static void main(String[] args) {
        SpringApplication.run(AceTransformerApplication.class, args);
    }
}
