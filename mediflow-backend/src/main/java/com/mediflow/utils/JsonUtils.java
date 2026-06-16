package com.mediflow.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Lightweight JSON serialization utility for WebSocket message delivery.
 * Uses Jackson ObjectMapper (same instance used by Spring MVC).
 */
public final class JsonUtils {

    private static final Logger logger = LoggerFactory.getLogger(JsonUtils.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private JsonUtils() {
        // Utility class
    }

    /**
     * Serializes an object to its JSON string representation.
     *
     * @param obj the object to serialize
     * @return JSON string, or "{}" on failure
     */
    public static String toJson(Object obj) {
        try {
            return OBJECT_MAPPER.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize object to JSON: {}", e.getMessage());
            return "{}";
        }
    }

    /**
     * Deserializes a JSON string to the specified type.
     *
     * @param json  the JSON string
     * @param clazz the target class
     * @param <T>   the target type
     * @return deserialized object, or null on failure
     */
    public static <T> T fromJson(String json, Class<T> clazz) {
        try {
            return OBJECT_MAPPER.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            logger.error("Failed to deserialize JSON to {}: {}", clazz.getSimpleName(), e.getMessage());
            return null;
        }
    }
}
