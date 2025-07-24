package com.bny.ace.transformer.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * JSON data parser implementation for Ace Transformer.
 */
@Component
public class AceJsonDataParser implements DataParser {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Map<String, Object> parse(String data) throws Exception {
        return objectMapper.readValue(data, Map.class);
    }

    @Override
    public boolean canParse(String data) {
        if (data == null || data.trim().isEmpty()) {
            return false;
        }
        
        String trimmed = data.trim();
        return (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
               (trimmed.startsWith("[") && trimmed.endsWith("]"));
    }
}
