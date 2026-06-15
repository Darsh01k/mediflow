package com.mediflow.controller;

import com.mediflow.config.JwtUtils;
import com.mediflow.config.UserDetailsImpl;
import com.mediflow.dto.UserSessionDto;
import com.mediflow.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
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
    }

    @PostMapping("/update-email")
    public ResponseEntity<?> updateEmail(@RequestBody Map<String, String> request) {
        Long userId = getCurrentUserId();
        String newEmail = request.get("newEmail");

        if (newEmail == null || newEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "New email address is required."));
        }

        userService.updateEmail(userId, newEmail);
        return ResponseEntity.ok(Map.of("message", "Email address updated successfully."));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<UserSessionDto>> getActiveSessions(HttpServletRequest request) {
        Long userId = getCurrentUserId();
        String jwt = parseJwt(request);
        String currentSessionToken = jwt != null ? jwtUtils.getSessionTokenFromJwtToken(jwt) : null;
        
        List<UserSessionDto> sessions = userService.getUserSessions(userId, currentSessionToken);
        return ResponseEntity.ok(sessions);
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
}
