package com.mediflow.service;

import com.mediflow.config.JwtUtils;
import com.mediflow.config.UserDetailsImpl;
import com.mediflow.dto.AuthResponse;
import com.mediflow.dto.LoginRequest;
import com.mediflow.dto.RegisterRequest;
import com.mediflow.dto.UserDto;
import com.mediflow.entity.*;
import com.mediflow.exception.BadRequestException;
import com.mediflow.repository.DoctorRepository;
import com.mediflow.repository.HospitalRepository;
import com.mediflow.repository.PatientRepository;
import com.mediflow.repository.UserRepository;
import com.mediflow.utils.DtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private com.mediflow.repository.UserSessionRepository userSessionRepository;

    @Autowired
    private com.mediflow.repository.PasswordResetTokenRepository passwordResetTokenRepository;

    public AuthResponse authenticate(LoginRequest loginRequest) {
        return authenticate(loginRequest, null);
    }

    @Transactional
    public AuthResponse authenticate(LoginRequest loginRequest, jakarta.servlet.http.HttpServletRequest request) {
        logger.info("Attempting login/authentication for username: {}", loginRequest.getUsername());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
            String role = userPrincipal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new BadRequestException("User profile not found"));

            // Log new UserSession
            String sessionToken = java.util.UUID.randomUUID().toString();
            String userAgent = request != null ? request.getHeader("User-Agent") : "Unknown";
            String browserInfo = parseBrowser(userAgent);
            String deviceInfo = parseDevice(userAgent);
            
            UserSession userSession = new UserSession(sessionToken, user, java.time.LocalDateTime.now(), deviceInfo, browserInfo);
            userSessionRepository.save(userSession);

            String jwt = jwtUtils.generateJwtToken(authentication, sessionToken);

            Long profileId = null;
            if (Role.DOCTOR.name().equals(role)) {
                Optional<Doctor> doctor = doctorRepository.findByUserId(userPrincipal.getId());
                if (doctor.isPresent()) {
                    Doctor d = doctor.get();
                    if (d.getStatus() != DoctorStatus.APPROVED) {
                        logger.warn("Authentication failed: Doctor profile status is {} for username: {}", d.getStatus(), loginRequest.getUsername());
                        if (d.getStatus() == DoctorStatus.PENDING) {
                            throw new BadRequestException("Your doctor registration is pending approval by the selected hospital.");
                        } else if (d.getStatus() == DoctorStatus.REJECTED) {
                            throw new BadRequestException("Your doctor registration request has been rejected.");
                        } else if (d.getStatus() == DoctorStatus.SUSPENDED) {
                            throw new BadRequestException("Your doctor account has been suspended.");
                        }
                    }
                    profileId = d.getId();
                }
            } else if (Role.PATIENT.name().equals(role)) {
                Optional<Patient> patient = patientRepository.findByUserId(userPrincipal.getId());
                if (patient.isPresent()) {
                    profileId = patient.get().getId();
                }
            } else if (Role.HOSPITAL_ADMIN.name().equals(role)) {
                if (user.getHospital() != null) {
                    profileId = user.getHospital().getId();
                }
            } else if (Role.PLATFORM_ADMIN.name().equals(role)) {
                profileId = userPrincipal.getId();
            }

            String firstName = user.getFirstName();
            String lastName = user.getLastName();
            String avatarId = user.getAvatarId();

            if (Role.HOSPITAL_ADMIN.name().equals(role) && user.getHospital() != null) {
                firstName = user.getHospital().getName();
                lastName = "";
                avatarId = user.getHospital().getLogoAvatar() != null ? user.getHospital().getLogoAvatar() : "hospital_1";
            }

            logger.info("User {} successfully authenticated with role: {}", loginRequest.getUsername(), role);
            return new AuthResponse(
                    jwt,
                    userPrincipal.getId(),
                    userPrincipal.getUsername(),
                    userPrincipal.getEmail(),
                    role,
                    profileId,
                    firstName,
                    lastName,
                    avatarId,
                    user.getCity(),
                    user.getState(),
                    user.getCountry()
            );
        } catch (Exception e) {
            logger.error("Authentication exception for user {}: {}", loginRequest.getUsername(), e.getMessage());
            throw e;
        }
    }

    @Transactional
    public UserDto register(RegisterRequest registerRequest) {
        logger.info("Attempting registration for username: {}, email: {}, role: {}", 
                registerRequest.getUsername(), registerRequest.getEmail(), registerRequest.getRole());

        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            logger.warn("Registration failed: Username {} is already taken", registerRequest.getUsername());
            throw new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            logger.warn("Registration failed: Email {} is already registered", registerRequest.getEmail());
            throw new BadRequestException("Email is already registered");
        }

        User user = new User(
                registerRequest.getUsername(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getEmail(),
                registerRequest.getRole(),
                registerRequest.getFirstName(),
                registerRequest.getLastName()
        );
        user.setCity(registerRequest.getCity());
        user.setState(registerRequest.getState());
        user.setCountry(registerRequest.getCountry());
        
        // Save avatar ID
        if (registerRequest.getAvatarId() != null) {
            user.setAvatarId(registerRequest.getAvatarId());
        } else {
            user.setAvatarId("avatar_1"); // Default avatar
        }

        user = userRepository.save(user);

        if (registerRequest.getRole() == Role.PATIENT) {
            if (registerRequest.getDateOfBirth() == null || registerRequest.getGender() == null ||
                registerRequest.getPhone() == null || registerRequest.getEmergencyContact() == null) {
                logger.warn("Registration failed: Missing patient profile fields for username: {}", registerRequest.getUsername());
                throw new BadRequestException("All patient profile fields (except address) are required");
            }

            Patient patient = new Patient(
                    user,
                    registerRequest.getDateOfBirth(),
                    registerRequest.getGender(),
                    registerRequest.getPhone(),
                    registerRequest.getAddress(), // optional Address
                    registerRequest.getEmergencyContact(),
                    registerRequest.getBloodType()
            );

            patientRepository.save(patient);
            logger.info("Registered patient profile for username: {}", registerRequest.getUsername());
        } else if (registerRequest.getRole() == Role.DOCTOR) {
            if (registerRequest.getSpecialization() == null || registerRequest.getLicenseNumber() == null ||
                registerRequest.getConsultationFee() == null || registerRequest.getHospitalId() == null ||
                registerRequest.getQualification() == null || registerRequest.getExperience() == null ||
                registerRequest.getPhone() == null) {
                logger.warn("Registration failed: Missing doctor profile fields for username: {}", registerRequest.getUsername());
                throw new BadRequestException("All doctor profile fields are required");
            }

            if (doctorRepository.existsByLicenseNumber(registerRequest.getLicenseNumber())) {
                logger.warn("Registration failed: License number {} is already registered", registerRequest.getLicenseNumber());
                throw new BadRequestException("License number is already registered");
            }

            Hospital hospital = hospitalRepository.findById(registerRequest.getHospitalId())
                    .orElseThrow(() -> {
                        logger.error("Registration failed: Selected hospital with ID {} not found", registerRequest.getHospitalId());
                        return new BadRequestException("Selected hospital not found");
                    });

            Doctor doctor = new Doctor(
                    user,
                    registerRequest.getSpecialization(),
                    registerRequest.getLicenseNumber(),
                    registerRequest.getConsultationFee(),
                    registerRequest.getBio()
            );
            doctor.setPhone(registerRequest.getPhone());
            doctor.setQualification(registerRequest.getQualification());
            doctor.setExperience(registerRequest.getExperience());
            doctor.setLanguages(registerRequest.getLanguages());
            doctor.setHospital(hospital);
            doctor.setStatus(DoctorStatus.PENDING); // Begins as pending

            doctorRepository.save(doctor);
            logger.info("Registered doctor profile for username: {} (status: PENDING)", registerRequest.getUsername());
        } else if (registerRequest.getRole() == Role.HOSPITAL_ADMIN) {
            Hospital hospital = null;
            if (registerRequest.getHospitalId() != null) {
                hospital = hospitalRepository.findById(registerRequest.getHospitalId())
                        .orElseThrow(() -> {
                            logger.error("Registration failed: Selected hospital with ID {} not found", registerRequest.getHospitalId());
                            return new BadRequestException("Selected hospital not found");
                        });
            } else {
                if (registerRequest.getHospitalName() == null || registerRequest.getHospitalAddress() == null) {
                    logger.warn("Registration failed: Missing hospital name or address for username: {}", registerRequest.getUsername());
                    throw new BadRequestException("Hospital name and address are required to create a new hospital profile");
                }
                hospital = new Hospital(
                        registerRequest.getHospitalName(),
                        registerRequest.getHospitalEmail(),
                        registerRequest.getHospitalPhone(),
                        registerRequest.getHospitalAddress(),
                        registerRequest.getHospitalCity(),
                        registerRequest.getHospitalState(),
                        registerRequest.getHospitalPincode(),
                        registerRequest.getHospitalLatitude(),
                        registerRequest.getHospitalLongitude(),
                        registerRequest.getHospitalLicenseNumber(),
                        registerRequest.getHospitalDescription(),
                        registerRequest.getHospitalLogoAvatar()
                );
                hospital = hospitalRepository.save(hospital);
                logger.info("Created new hospital: {} during registration", hospital.getName());
            }
            user.setHospital(hospital);
            userRepository.save(user);
            logger.info("Registered hospital admin profile for username: {}", registerRequest.getUsername());
        }

        return DtoMapper.toDto(user);
    }

    // User-Agent helpers
    private String parseBrowser(String userAgent) {
        if (userAgent == null) return "Unknown";
        String ua = userAgent.toLowerCase();
        if (ua.contains("edg/")) return "Edge";
        if (ua.contains("chrome/") && !ua.contains("chromium/")) return "Chrome";
        if (ua.contains("safari/") && !ua.contains("chrome/")) return "Safari";
        if (ua.contains("firefox/")) return "Firefox";
        if (ua.contains("opr/") || ua.contains("opera/")) return "Opera";
        return "Browser";
    }

    private String parseDevice(String userAgent) {
        if (userAgent == null) return "Unknown";
        String ua = userAgent.toLowerCase();
        if (ua.contains("iphone")) return "iPhone";
        if (ua.contains("ipad")) return "iPad";
        if (ua.contains("android")) return "Android Device";
        if (ua.contains("windows")) return "Windows PC";
        if (ua.contains("macintosh")) return "MacBook";
        if (ua.contains("linux")) return "Linux PC";
        return "Device";
    }

    // Password Reset Flow
    @Transactional
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No account found with this email address."));

        String rawToken = java.util.UUID.randomUUID().toString();
        String hashedToken = hashToken(rawToken);

        PasswordResetToken tokenEntity = new PasswordResetToken(
                hashedToken,
                user,
                java.time.LocalDateTime.now().plusMinutes(15)
        );
        passwordResetTokenRepository.save(tokenEntity);

        String resetLink = "http://localhost:5173/reset-password?token=" + rawToken;

        // Render and log professional HTML email template
        String emailContent = 
            "========================================================================\n" +
            "Subject: Reset Your MediFlow Password\n" +
            "------------------------------------------------------------------------\n" +
            "Hello " + user.getFirstName() + " " + user.getLastName() + ",\n\n" +
            "We received a request to reset your password for your MediFlow account.\n" +
            "Please click the link below to set a new password:\n\n" +
            "👉 RESET PASSWORD LINK:\n" +
            "   " + resetLink + "\n\n" +
            "⚠️ EXPIRATION WARNING:\n" +
            "   This link is valid for 15 minutes only (until " + tokenEntity.getExpiryDate().toString() + ") and can only be used once.\n\n" +
            "🔒 SECURITY NOTICE:\n" +
            "   If you did not request this password reset, please ignore this email or contact support if you suspect unauthorized access.\n" +
            "========================================================================";
            
        logger.info("\n[EMAIL OUTBOX]\n{}", emailContent);

        return rawToken;
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        String hashedToken = hashToken(rawToken);
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(hashedToken)
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset link."));

        if (resetToken.isUsed()) {
            throw new BadRequestException("This reset link has already been used.");
        }

        if (resetToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("This reset link has expired (15-minute limit).");
        }

        validatePasswordStrength(newPassword);

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        logger.info("Successfully updated password for user: {}", user.getUsername());
    }

    // Account Security settings
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found."));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password does not match.");
        }

        validatePasswordStrength(newPassword);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logger.info("Password updated successfully inside profile settings for user: {}", user.getUsername());
    }

    @Transactional
    public void updateEmail(Long userId, String newEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found."));

        if (user.getEmail().equalsIgnoreCase(newEmail)) {
            return; // no change needed
        }

        if (userRepository.existsByEmail(newEmail)) {
            throw new BadRequestException("Email is already taken by another account.");
        }

        user.setEmail(newEmail);
        userRepository.save(user);
        logger.info("Email updated successfully inside profile settings to: {} for user: {}", newEmail, user.getUsername());
    }

    @Transactional(readOnly = true)
    public java.util.List<com.mediflow.dto.UserSessionDto> getUserSessions(Long userId, String currentPrincipalToken) {
        java.util.List<UserSession> sessions = userSessionRepository.findByUserIdAndIsActiveTrue(userId);
        java.util.List<com.mediflow.dto.UserSessionDto> dtoList = new java.util.ArrayList<>();
        for (UserSession session : sessions) {
            boolean isCurrent = session.getToken().equals(currentPrincipalToken);
            dtoList.add(new com.mediflow.dto.UserSessionDto(
                session.getId(),
                session.getLoginTime(),
                session.getDeviceInfo(),
                session.getBrowserInfo(),
                isCurrent
            ));
        }
        return dtoList;
    }

    @Transactional
    public void logoutSession(Long userId, Long sessionId) {
        UserSession session = userSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Session not found."));

        if (!session.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to revoke session.");
        }

        session.setActive(false);
        userSessionRepository.save(session);
        logger.info("Revoked active session ID: {} for user ID: {}", sessionId, userId);
    }

    @Transactional
    public void logoutAllSessions(Long userId) {
        java.util.List<UserSession> activeSessions = userSessionRepository.findByUserIdAndIsActiveTrue(userId);
        for (UserSession s : activeSessions) {
            s.setActive(false);
        }
        userSessionRepository.saveAll(activeSessions);
        logger.info("Revoked all active sessions for user ID: {}", userId);
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long.");
        }
        boolean hasUppercase = false;
        boolean hasLowercase = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;
        String specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
        
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUppercase = true;
            else if (Character.isLowerCase(c)) hasLowercase = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else if (specialChars.indexOf(c) >= 0) hasSpecial = true;
        }
        
        if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecial) {
            throw new BadRequestException("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        }
    }

    private String hashToken(String rawToken) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }
}
