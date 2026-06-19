package com.mediflow;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class MediFlowApplication {

    private static final Logger logger = LoggerFactory.getLogger(MediFlowApplication.class);

    @Autowired
    private Environment env;

    public static void main(String[] args) {
        SpringApplication.run(MediFlowApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void checkDefaultSecrets() {
        String jwtSecret = env.getProperty("mediflow.jwt.secret");
        String defaultSecret = "bWVkaWZsb3ctc2VjcmV0LWtleS1mb3Itand0LXRva2VuLWdlbmVyYXRpb24tc2VjdXJlLTI1Ni1iaXQ=";
        if (defaultSecret.equals(jwtSecret)) {
            logger.warn("========================================");
            logger.warn("SECURITY WARNING: Default JWT secret is in use!");
            logger.warn("Set the JWT_SECRET environment variable to a unique value.");
            logger.warn("Current default secret is publicly known and insecure.");
            logger.warn("========================================");
        }

        String dbPassword = env.getProperty("spring.datasource.password");
        if ("postgres".equals(dbPassword)) {
            logger.warn("========================================");
            logger.warn("SECURITY WARNING: Default database password is in use!");
            logger.warn("Set the SPRING_DATASOURCE_PASSWORD environment variable.");
            logger.warn("========================================");
        }

        String googleId = env.getProperty("spring.security.oauth2.client.registration.google.client-id");
        if ("dummy-id".equals(googleId)) {
            logger.warn("========================================");
            logger.warn("SECURITY WARNING: Default Google OAuth credentials are in use!");
            logger.warn("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.");
            logger.warn("Google login will not work until these are configured.");
            logger.warn("========================================");
        }
    }
}
