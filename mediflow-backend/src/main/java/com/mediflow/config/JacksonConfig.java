package com.mediflow.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.mediflow.utils.HtmlSanitizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

/**
 * Jackson module that automatically sanitizes all incoming String fields
 * to prevent XSS and HTML injection attacks.
 *
 * Registered globally so every @RequestBody deserialization runs through
 * the HTML sanitizer before reaching controllers.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Module htmlSanitizerModule() {
        SimpleModule module = new SimpleModule("HtmlSanitizerModule");

        module.addDeserializer(String.class, new JsonDeserializer<String>() {
            @Override
            public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
                String raw = p.getValueAsString();
                return HtmlSanitizer.sanitize(raw);
            }
        });

        return module;
    }
}
