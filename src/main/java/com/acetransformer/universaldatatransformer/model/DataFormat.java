package com.acetransformer.universaldatatransformer.model;

/**
 * Enumeration of supported data formats for transformation.
 */
public enum DataFormat {
    JSON("json", "application/json", new String[]{".json"}),
    XML("xml", "application/xml", new String[]{".xml"}),
    CSV("csv", "text/csv", new String[]{".csv"}),
    TXT("txt", "text/plain", new String[]{".txt"});

    private final String name;
    private final String mimeType;
    private final String[] fileExtensions;

    DataFormat(String name, String mimeType, String[] fileExtensions) {
        this.name = name;
        this.mimeType = mimeType;
        this.fileExtensions = fileExtensions;
    }

    public String getName() {
        return name;
    }

    public String getMimeType() {
        return mimeType;
    }

    public String[] getFileExtensions() {
        return fileExtensions;
    }

    /**
     * Get DataFormat from file extension.
     * @param extension file extension (with or without dot)
     * @return DataFormat or null if not found
     */
    public static DataFormat fromExtension(String extension) {
        String ext = extension.toLowerCase();
        if (!ext.startsWith(".")) {
            ext = "." + ext;
        }
        
        for (DataFormat format : values()) {
            for (String fileExt : format.fileExtensions) {
                if (fileExt.equals(ext)) {
                    return format;
                }
            }
        }
        return null;
    }

    /**
     * Get DataFormat from name.
     * @param name format name
     * @return DataFormat or null if not found
     */
    public static DataFormat fromName(String name) {
        for (DataFormat format : values()) {
            if (format.name.equalsIgnoreCase(name)) {
                return format;
            }
        }
        return null;
    }
}
