package com.mediflow.controller;

import com.mediflow.config.UserDetailsImpl;
import com.mediflow.dto.AuthResponse;
import com.mediflow.dto.GoogleAuthRequest;
import com.mediflow.dto.LoginRequest;
import com.mediflow.dto.RegisterRequest;
import com.mediflow.dto.UserDto;
import com.mediflow.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest, jakarta.servlet.http.HttpServletRequest request) {
        AuthResponse response = userService.authenticate(loginRequest, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterRequest registerRequest) {
        UserDto registeredUser = userService.register(registerRequest);
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@Valid @RequestBody GoogleAuthRequest request) {
        AuthResponse response = userService.authenticateGoogle(request.getIdToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Not authenticated."));
        }
        userService.logout(currentUser.getId());
        return ResponseEntity.ok(java.util.Map.of("message", "Logged out successfully."));
    }
}
