package com.mediflow.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${mediflow.jwt.secret}")
    private String jwtSecret;

    @Value("${mediflow.jwt.expiration-ms}")
    private int jwtExpirationMs;

    private SecretKey key() {
        byte[] keyBytes;
        try {
            // 1. Attempt URL-safe Base64 decoding (supports '-' and '_')
            keyBytes = Base64.getUrlDecoder().decode(jwtSecret);
        } catch (IllegalArgumentException e1) {
            try {
                // 2. Fall back to standard Base64 decoding (supports '+' and '/')
                keyBytes = Base64.getDecoder().decode(jwtSecret);
            } catch (IllegalArgumentException e2) {
                // 3. Fall back to raw UTF-8 bytes if it is not Base64 encoded at all
                keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            }
        }

        // If the decoded key is too weak (less than 32 bytes/256 bits),
        // use the raw UTF-8 bytes of the secret key to satisfy HMAC-SHA256 requirements.
        if (keyBytes.length < 32) {
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key())
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key()).build().parseSignedClaims(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }
}

