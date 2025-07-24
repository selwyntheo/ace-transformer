#!/bin/bash

# Create target directories
mkdir -p src/main/java/com/bny/ace/transformer/{dto,service,controller,parser,model}
mkdir -p src/test/java/com/bny/ace/transformer

# Copy and update DTO files
for file in src/main/java/com/acetransformer/universaldatatransformer/dto/*.java; do
    filename=$(basename "$file")
    sed 's/package com\.acetransformer\.universaldatatransformer\.dto;/package com.bny.ace.transformer.dto;/g; s/import com\.acetransformer\.universaldatatransformer\./import com.bny.ace.transformer./g' "$file" > "src/main/java/com/bny/ace/transformer/dto/$filename"
done

# Copy and update Service files
for file in src/main/java/com/acetransformer/universaldatatransformer/service/*.java; do
    filename=$(basename "$file")
    sed 's/package com\.acetransformer\.universaldatatransformer\.service;/package com.bny.ace.transformer.service;/g; s/import com\.acetransformer\.universaldatatransformer\./import com.bny.ace.transformer./g' "$file" > "src/main/java/com/bny/ace/transformer/service/$filename"
done

# Copy and update Controller files
for file in src/main/java/com/acetransformer/universaldatatransformer/controller/*.java; do
    filename=$(basename "$file")
    sed 's/package com\.acetransformer\.universaldatatransformer\.controller;/package com.bny.ace.transformer.controller;/g; s/import com\.acetransformer\.universaldatatransformer\./import com.bny.ace.transformer./g' "$file" > "src/main/java/com/bny/ace/transformer/controller/$filename"
done

# Copy and update Parser files
for file in src/main/java/com/acetransformer/universaldatatransformer/parser/*.java; do
    filename=$(basename "$file")
    sed 's/package com\.acetransformer\.universaldatatransformer\.parser;/package com.bny.ace.transformer.parser;/g; s/import com\.acetransformer\.universaldatatransformer\./import com.bny.ace.transformer./g' "$file" > "src/main/java/com/bny/ace/transformer/parser/$filename"
done

# Update the main application file name and content
sed 's/package com\.acetransformer\.universaldatatransformer;/package com.bny.ace.transformer;/g; s/UniversalDataTransformerApplication/AceTransformerApplication/g; s/Universal Data Transformer/Ace Transformer/g' src/main/java/com/acetransformer/universaldatatransformer/UniversalDataTransformerApplication.java > src/main/java/com/bny/ace/transformer/AceTransformerApplication.java

# Update test files
for file in src/test/java/com/acetransformer/*.java; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        sed 's/package com\.acetransformer;/package com.bny.ace.transformer;/g; s/import com\.acetransformer\./import com.bny.ace.transformer./g' "$file" > "src/test/java/com/bny/ace/transformer/$filename"
    fi
done

echo "All files moved and updated successfully!"
