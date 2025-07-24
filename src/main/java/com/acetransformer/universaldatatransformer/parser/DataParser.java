package com.acetransformer.universaldatatransformer.parser;

import java.util.Map;

/**
 * Interface for parsing different data formats into a common Map structure.
 */
public interface DataParser {
    
    /**
     * Parse input data string into a Map representation.
     * @param data the input data string
     * @return Map representation of the parsed data
     * @throws Exception if parsing fails
     */
    Map<String, Object> parse(String data) throws Exception;
    
    /**
     * Check if this parser can handle the given data format.
     * @param data the input data string
     * @return true if this parser can handle the data
     */
    boolean canParse(String data);
}
