package com.mediflow.utils;

import java.util.regex.Pattern;

/**
 * Utility for sanitizing user input to prevent XSS and injection attacks.
 * Strips dangerous HTML tags, attributes, and script content from strings.
 */
public final class HtmlSanitizer {

    private static final Pattern SCRIPT_PATTERN = Pattern.compile(
            "<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    private static final Pattern EVENT_HANDLER_PATTERN = Pattern.compile(
            "\\s(on\\w+)\\s*=\\s*\"[^\"]*\"|\\s(on\\w+)\\s*=\\s*'[^']*'",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern HTML_TAG_PATTERN = Pattern.compile(
            "<[^>]*>"
    );

    private static final Pattern JAVASCRIPT_URI_PATTERN = Pattern.compile(
            "javascript\\s*:", Pattern.CASE_INSENSITIVE
    );

    private static final Pattern VB_SCRIPT_URI_PATTERN = Pattern.compile(
            "vbscript\\s*:", Pattern.CASE_INSENSITIVE
    );

    private static final Pattern NULL_BYTE_PATTERN = Pattern.compile("\\x00");

    private HtmlSanitizer() {
        // Utility class - prevent instantiation
    }

    /**
     * Sanitizes a string input by removing dangerous content.
     * This is a defense-in-depth measure; validation should still occur at the service layer.
     *
     * @param input the raw input string
     * @return sanitized string with HTML tags and event handlers removed
     */
    public static String sanitize(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }

        String sanitized = input;

        // Remove null bytes
        sanitized = NULL_BYTE_PATTERN.matcher(sanitized).replaceAll("");

        // Remove script tags and their contents
        sanitized = SCRIPT_PATTERN.matcher(sanitized).replaceAll("");

        // Remove event handler attributes (onclick, onload, etc.)
        sanitized = EVENT_HANDLER_PATTERN.matcher(sanitized).replaceAll("");

        // Remove javascript: and vbscript: URIs
        sanitized = JAVASCRIPT_URI_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = VB_SCRIPT_URI_PATTERN.matcher(sanitized).replaceAll("");

        // Remove all remaining HTML tags
        sanitized = HTML_TAG_PATTERN.matcher(sanitized).replaceAll("");

        // Trim whitespace
        sanitized = sanitized.trim();

        return sanitized;
    }

    /**
     * Sanitizes all string fields in an object by applying {@link #sanitize(String)}.
     * Uses reflection to recursively process string fields.
     *
     * @param obj the object to sanitize (can be a DTO, entity, etc.)
     * @param <T> the type of the object
     * @return the sanitized object (same instance, fields modified in-place)
     */
    @SuppressWarnings("unchecked")
    public static <T> T sanitizeObject(T obj) {
        if (obj == null) {
            return null;
        }

        // If it's a string, sanitize it directly
        if (obj instanceof String) {
            return (T) sanitize((String) obj);
        }

        // Use reflection to sanitize string fields
        try {
            Class<?> clazz = obj.getClass();
            for (java.lang.reflect.Field field : clazz.getDeclaredFields()) {
                if (field.getType() == String.class) {
                    boolean wasAccessible = field.canAccess(obj);
                    field.setAccessible(true);
                    Object value = field.get(obj);
                    if (value instanceof String) {
                        field.set(obj, sanitize((String) value));
                    }
                    field.setAccessible(wasAccessible);
                }
            }
        } catch (Exception e) {
            // Log and continue - sanitization is best-effort
            java.util.logging.Logger.getLogger(HtmlSanitizer.class.getName())
                    .warning("Failed to sanitize object fields: " + e.getMessage());
        }

        return obj;
    }
}
