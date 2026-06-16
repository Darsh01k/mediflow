package com.mediflow.controller;

import com.mediflow.config.JwtUtils;
import com.mediflow.config.UserDetailsImpl;
import com.mediflow.dto.UserSessionDto;
import com.mediflow.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    private Long getCurrentUserId() {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userPrincipal.getId();
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            Long userId = getCurrentUserId();
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            String confirmPassword = request.get("confirmPassword");

            if (currentPassword == null || newPassword == null || confirmPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "All password fields are required."));
            }

            if (!newPassword.equals(confirmPassword)) {
                return ResponseEntity.badRequest().body(Map.of("message", "New passwords do not match."));
            }

            userService.changePassword(userId, currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        } catch (com.mediflow.exception.BadRequestException e) {
            logger.warn("Password change validation failed: {}", e.getMessage());
            String msg = e.getMessage();
            if ("Current password does not match.".equals(msg)) {
                msg = "Current password incorrect";
            }
            return ResponseEntity.badRequest().body(Map.of("message", msg));
        } catch (Exception e) {
            logger.error("FULL ERROR during password change", e);
            return ResponseEntity.badRequest().body(Map.of("message", "An internal error occurred."));
        }
    }

    @PostMapping("/request-email-change")
    public ResponseEntity<?> requestEmailChange(@RequestBody Map<String, String> request) {
        try {
            Long userId = getCurrentUserId();
            String newEmail = request.get("newEmail");

            if (newEmail == null || newEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "New email address is required."));
            }

            // Email format validation
            if (!newEmail.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid email format."));
            }

            userService.requestEmailChange(userId, newEmail);
            return ResponseEntity.ok(Map.of("message", "For security, a verification code has been sent to your current registered email address."));
        } catch (com.mediflow.exception.BadRequestException e) {
            logger.warn("Email change request validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("FULL ERROR during email change request", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Failed to request email change."));
        }
    }

    @PostMapping("/verify-email-change")
    public ResponseEntity<?> verifyEmailChange(@RequestBody Map<String, String> request) {
        try {
            Long userId = getCurrentUserId();
            String newEmail = request.get("newEmail");
            String otp = request.get("otp");

            if (newEmail == null || newEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "New email address is required."));
            }
            if (otp == null || otp.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Verification code (OTP) is required."));
            }

            userService.verifyEmailChange(userId, otp, newEmail);
            return ResponseEntity.ok(Map.of("message", "Email address updated successfully."));
        } catch (com.mediflow.exception.BadRequestException e) {
            logger.warn("Email change verification validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("FULL ERROR during email change verification", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Failed to verify email change."));
        }
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getActiveSessions(HttpServletRequest request) {
        try {
            Long userId = getCurrentUserId();
            String jwt = parseJwt(request);
            String currentSessionToken = jwt != null ? jwtUtils.getSessionTokenFromJwtToken(jwt) : null;
            
            List<UserSessionDto> sessions = userService.getUserSessions(userId, currentSessionToken);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            logger.error("FULL ERROR in getActiveSessions", e);
            return ResponseEntity.ok(List.of());
        }
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<?> logoutSession(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        userService.logoutSession(userId, id);
        return ResponseEntity.ok(Map.of("message", "Session revoked successfully."));
    }

    @PostMapping("/sessions/logout-all")
    public ResponseEntity<?> logoutAllSessions() {
        Long userId = getCurrentUserId();
        userService.logoutAllSessions(userId);
        return ResponseEntity.ok(Map.of("message", "Signed out of all devices successfully."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) throws Exception {
        try {
            String jwt = parseJwt(request);
            if (jwt != null) {
                String sessionToken = jwtUtils.getSessionTokenFromJwtToken(jwt);
                userService.logoutSessionByToken(sessionToken);
            }
            return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
        } catch (Exception e) {
            logger.error("FULL ERROR during logout", e);
            throw e;
        }
    }
}
