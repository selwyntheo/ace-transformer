package com.bny.ace.transformer.config;

import com.bny.ace.transformer.model.MappingConfiguration;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.stereotype.Component;

/**
 * MongoDB event listener to handle lifecycle events for MappingConfiguration.
 * Automatically calls onCreate() for new documents and onUpdate() for existing documents.
 */
@Component
public class MappingConfigurationEventListener extends AbstractMongoEventListener<MappingConfiguration> {

    @Override
    public void onBeforeConvert(BeforeConvertEvent<MappingConfiguration> event) {
        super.onBeforeConvert(event);
        MappingConfiguration config = event.getSource();
        
        if (config.getId() == null) {
            // New document - call onCreate
            config.onCreate();
        } else {
            // Existing document - call onUpdate
            config.onUpdate();
        }
    }
}
