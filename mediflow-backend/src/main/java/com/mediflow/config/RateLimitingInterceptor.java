package com.mediflow.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Component
public class RateLimitingInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitingInterceptor.class);

    private final Map<String, Deque<Long>> requestLogs = new ConcurrentHashMap<>();

    private static final long AUTH_WINDOW_MS = 15 * 60 * 1000;
    private static final int AUTH_MAX_REQUESTS = 5;

    private static final long GENERAL_WINDOW_MS = 60 * 1000;
    private static final int GENERAL_MAX_REQUESTS = 60;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();

        if (!path.startsWith("/api/")) {
            return true;
        }

        String clientIp = getClientIp(request);
        boolean isAuth = path.startsWith("/api/auth/");
        String key = clientIp + ":" + (isAuth ? "auth" : "general");

        long windowMs = isAuth ? AUTH_WINDOW_MS : GENERAL_WINDOW_MS;
        int maxRequests = isAuth ? AUTH_MAX_REQUESTS : GENERAL_MAX_REQUESTS;

        Deque<Long> timestamps = requestLogs.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());

        synchronized (timestamps) {
            long now = System.currentTimeMillis();
            long windowStart = now - windowMs;

            while (!timestamps.isEmpty() && timestamps.peekFirst() < windowStart) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxRequests) {
                long oldest = timestamps.peekFirst();
                long retryAfterMs = windowMs - (now - oldest);
                int retryAfterSec = Math.max(1, (int) (retryAfterMs / 1000));
                if (retryAfterSec > 30) {
                    retryAfterSec = 30;
                }

                logger.warn("Rate limit exceeded for {} from IP {}", path, clientIp);

                response.setStatus(429);
                response.setContentType("application/json");
                response.setHeader("Retry-After", String.valueOf(retryAfterSec));
                response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequests));
                response.setHeader("X-RateLimit-Remaining", "0");
                response.getWriter().write(
                        "{\"message\":\"Too many requests. Please try again in " + retryAfterSec + " seconds.\",\"retryAfter\":"
                                + retryAfterSec + "}"
                );
                return false;
            }

            timestamps.addLast(now);

            int remaining = maxRequests - timestamps.size();
            response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequests));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, remaining)));
        }

        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) {
            return xri.trim();
        }
        return request.getRemoteAddr();
    }
}
