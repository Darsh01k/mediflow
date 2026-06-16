package com.mediflow.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;



public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitingFilter.class);

    private final Map<String, RateLimitEntry> requestCounts = new ConcurrentHashMap<>();

    @Value("\")
    private int requestsPerMinute;

    @Value("\")
    private boolean authEndpointsEnabled;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        // Apply rate limiting to auth endpoints (login, register, google auth)
        boolean isAuthEndpoint = requestURI.startsWith("/api/auth/");

        if (isAuthEndpoint && authEndpointsEnabled) {
            String clientIp = getClientIp(request);
            String key = clientIp + ":" + requestURI;

            RateLimitEntry entry = requestCounts.computeIfAbsent(key, k -> new RateLimitEntry());

            if (!entry.allowRequest(requestsPerMinute)) {
                logger.warn("Rate limit exceeded for IP: {} on endpoint: {}", clientIp, requestURI);
                response.setStatus(429);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                String jsonResponse = String.format(
                        "{\"timestamp\":\"%s\",\"status\":429,\"message\":\"Too many requests. Please try again later.\",\"details\":\"Rate limit exceeded for %s\"}",
                        java.time.LocalDateTime.now(), requestURI
                );
                response.getWriter().write(jsonResponse);
                return;
            }
        }

        // Apply a lighter rate limit to all other API endpoints
        if (!isAuthEndpoint && requestURI.startsWith("/api/")) {
            String clientIp = getClientIp(request);
            String key = clientIp + ":global";

            RateLimitEntry entry = requestCounts.computeIfAbsent(key, k -> new RateLimitEntry());

            // Global API limit: 100 requests per minute per IP
            if (!entry.allowRequest(100)) {
                logger.warn("Global rate limit exceeded for IP: {} on endpoint: {}", clientIp, requestURI);
                response.setStatus(429);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                String jsonResponse = String.format(
                        "{\"timestamp\":\"%s\",\"status\":429,\"message\":\"Too many requests. Please slow down.\",\"details\":\"Global rate limit exceeded\"}",
                        java.time.LocalDateTime.now()
                );
                response.getWriter().write(jsonResponse);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private static class RateLimitEntry {
        private final AtomicInteger counter = new AtomicInteger(0);
        private volatile long windowStart = System.currentTimeMillis();

        boolean allowRequest(int maxRequestsPerMinute) {
            long now = System.currentTimeMillis();
            long windowDuration = 60_000L; // 1 minute

            // Reset if window has expired
            if (now - windowStart > windowDuration) {
                synchronized (this) {
                    if (now - windowStart > windowDuration) {
                        counter.set(0);
                        windowStart = now;
                    }
                }
            }

            int currentCount = counter.incrementAndGet();
            return currentCount <= maxRequestsPerMinute;
        }
    }
}
