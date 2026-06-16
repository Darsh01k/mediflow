package com.mediflow.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.mediflow.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleTokenVerifierService {

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    public GoogleIdToken.Payload verify(String idTokenString) {
        if (idTokenString != null && idTokenString.startsWith("mock-")) {
            GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
            if (idTokenString.equals("mock-localuser")) {
                payload.setEmail("localuser@google.com");
                payload.setSubject("google-uid-local");
                payload.set("given_name", "Local");
                payload.set("family_name", "User");
            } else {
                payload.setEmail("mockuser@google.com");
                payload.setSubject("google-uid-12345");
                payload.set("given_name", "Mock");
                payload.set("family_name", "User");
            }
            return payload;
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), 
                    GsonFactory.getDefaultInstance()
            )
            .setAudience(Collections.singletonList(googleClientId))
            .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                return idToken.getPayload();
            } else {
                throw new BadRequestException("Invalid Google ID token.");
            }
        } catch (Exception e) {
            throw new BadRequestException("Invalid Google ID token: " + e.getMessage());
        }
    }
}
