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

    @org.springframework.beans.factory.annotation.Value("${mediflow.jwt.expiration-ms}")
    private int jwtExpirationMs;

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
            String deviceFingerprint = generateDeviceFingerprint(userAgent);
            
            logger.info("Checking session duplication for userId={}, browserInfo={}, deviceFingerprint={}", user.getId(), browserInfo, deviceFingerprint);
            Optional<UserSession> existingSessionOpt = userSessionRepository.findByUserIdAndBrowserInfoAndDeviceFingerprintAndIsActiveTrue(user.getId(), browserInfo, deviceFingerprint);
            if (existingSessionOpt.isPresent()) {
                UserSession existingSession = existingSessionOpt.get();
                existingSession.setToken(sessionToken);
                existingSession.setLoginTime(java.time.LocalDateTime.now());
                existingSession.setLastActiveAt(java.time.LocalDateTime.now());
                existingSession.setDeviceInfo(deviceInfo);
                userSessionRepository.save(existingSession);
                logger.info("Updated existing active session for user {} and device {} / browser {} with fingerprint {}", user.getUsername(), deviceInfo, browserInfo, deviceFingerprint);
            } else {
                UserSession userSession = new UserSession(sessionToken, user, java.time.LocalDateTime.now(), deviceInfo, browserInfo, deviceFingerprint);
                userSessionRepository.save(userSession);
                logger.info("Created new active session for user {} and device {} / browser {} with fingerprint {}", user.getUsername(), deviceInfo, browserInfo, deviceFingerprint);
            }

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
                registerRequest.getPhone() == null) {
                logger.warn("Registration failed: Missing patient profile fields for username: {}", registerRequest.getUsername());
                throw new BadRequestException("All basic patient profile fields (DOB, Gender, Phone) are required");
            }

            Patient patient = new Patient(
                    user,
                    registerRequest.getDateOfBirth(),
                    registerRequest.getGender(),
                    registerRequest.getPhone(),
                    registerRequest.getAddress(), // optional Address
                    registerRequest.getEmergencyContact(), // optional Emergency Contact
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
            doctor.setAvailability(registerRequest.getAvailability());
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
                hospital.setHospitalType(registerRequest.getHospitalType());
                hospital.setFacilities(registerRequest.getHospitalFacilities());
                hospital.setNumberOfBeds(registerRequest.getHospitalNumberOfBeds());
                hospital.setEmergencyServicesAvailable(
                        registerRequest.getHospitalEmergencyServicesAvailable() != null ? 
                        registerRequest.getHospitalEmergencyServicesAvailable() : false
                );
                hospital.setWebsite(registerRequest.getHospitalWebsite());
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

    private String generateDeviceFingerprint(String userAgent) {
        if (userAgent == null) return "Unknown";
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(userAgent.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            logger.error("Failed to generate device fingerprint for user-agent: {}", userAgent, e);
            return "Fingerprint-" + userAgent.hashCode();
        }
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
        logger.info("Entering changePassword userId={}", userId);
        logger.info("Querying userRepository for userId={}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with ID {}", userId);
                    return new BadRequestException("User not found.");
                });

        logger.info("Validating current password match for user={}", user.getUsername());
        if (currentPassword == null || user.getPassword() == null || !passwordEncoder.matches(currentPassword, user.getPassword())) {
            logger.warn("Password change failed: current password does not match for user={}", user.getUsername());
            throw new BadRequestException("Current password does not match.");
        }

        logger.info("Validating new password strength for user={}", user.getUsername());
        validatePasswordStrength(newPassword);

        logger.info("Saving new password for user ID {}", userId);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logger.info("Password updated successfully inside profile settings for user: {}", user.getUsername());
    }

    // Store email change verification state in memory
    private final java.util.Map<Long, EmailChangeRequest> emailChangeRequests = new java.util.concurrent.ConcurrentHashMap<>();

    public static class EmailChangeRequest {
        private final String newEmail;
        private final String otp;
        private final java.time.LocalDateTime expiryTime;
        private final java.time.LocalDateTime lastRequestedTime;

        public EmailChangeRequest(String newEmail, String otp, java.time.LocalDateTime expiryTime, java.time.LocalDateTime lastRequestedTime) {
            this.newEmail = newEmail;
            this.otp = otp;
            this.expiryTime = expiryTime;
            this.lastRequestedTime = lastRequestedTime;
        }

        public String getNewEmail() {
            return newEmail;
        }

        public String getOtp() {
            return otp;
        }

        public java.time.LocalDateTime getExpiryTime() {
            return expiryTime;
        }

        public java.time.LocalDateTime getLastRequestedTime() {
            return lastRequestedTime;
        }
    }

    public String getPendingEmailChangeOtp(Long userId) {
        EmailChangeRequest req = emailChangeRequests.get(userId);
        return req != null ? req.getOtp() : null;
    }

    @Transactional
    public void requestEmailChange(Long userId, String newEmail) {
        logger.info("Entering requestEmailChange userId={}, newEmail={}", userId, newEmail);
        logger.info("Querying userRepository for userId={}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with ID {}", userId);
                    return new BadRequestException("User not found.");
                });

        if (user.getEmail() != null && user.getEmail().equalsIgnoreCase(newEmail)) {
            logger.warn("requestEmailChange failed: new email is same as current email for user ID {}", userId);
            throw new BadRequestException("New email must be different from current email.");
        }

        logger.info("Checking if new email {} exists in database", newEmail);
        if (userRepository.existsByEmail(newEmail)) {
            logger.warn("requestEmailChange failed: email {} already exists for user ID {}", newEmail, userId);
            throw new BadRequestException("Email is already taken by another account.");
        }

        // Rate limiting: 60 seconds
        EmailChangeRequest existingRequest = emailChangeRequests.get(userId);
        if (existingRequest != null && existingRequest.getLastRequestedTime().isAfter(java.time.LocalDateTime.now().minusSeconds(60))) {
            long secondsLeft = 60 - java.time.Duration.between(existingRequest.getLastRequestedTime(), java.time.LocalDateTime.now()).getSeconds();
            logger.warn("requestEmailChange failed due to rate limit for user ID {}, secondsLeft={}", userId, secondsLeft);
            throw new BadRequestException("Please wait " + secondsLeft + " seconds before requesting another code.");
        }

        // Generate 6 digit OTP
        logger.info("Generating OTP for email change of user ID {}", userId);
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        
        // Store request
        logger.info("Saving OTP state for email change of user ID {}", userId);
        emailChangeRequests.put(userId, new EmailChangeRequest(
                newEmail,
                otp,
                java.time.LocalDateTime.now().plusMinutes(10), // 10 minutes expiry
                java.time.LocalDateTime.now()
        ));

        // Log and print to console (simulated SMTP)
        try {
            String currentEmail = user.getEmail();
            if (currentEmail == null || currentEmail.trim().isEmpty()) {
                throw new RuntimeException("User current email is empty or invalid.");
            }
            logger.info("=================================================");
            logger.info("EMAIL CHANGE OTP FOR USER ID {}: {}", userId, otp);
            logger.info("SENDING OTP TO CURRENT EMAIL: {}", currentEmail);
            logger.info("=================================================");
            System.out.println("=================================================");
            System.out.println("EMAIL CHANGE OTP FOR USER ID " + userId + " (Sent to current email: " + currentEmail + ", target email: " + newEmail + "): " + otp);
            System.out.println("=================================================");
        } catch (Exception e) {
            logger.error("Failed to send verification email for user ID {}", userId, e);
            throw new RuntimeException("Unable to send verification email.");
        }
    }

    @Transactional
    public void verifyEmailChange(Long userId, String otp, String newEmail) {
        logger.info("Entering verifyEmailChange userId={}, otp={}, newEmail={}", userId, otp, newEmail);
        logger.info("Querying userRepository for userId={}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with ID {}", userId);
                    return new BadRequestException("User not found.");
                });

        logger.info("Retrieving pending email change request for userId={}", userId);
        EmailChangeRequest changeRequest = emailChangeRequests.get(userId);
        if (changeRequest == null) {
            logger.warn("verifyEmailChange failed: No pending email change request for user ID {}", userId);
            throw new BadRequestException("No pending email change request found.");
        }

        if (changeRequest.getNewEmail() == null || !changeRequest.getNewEmail().equalsIgnoreCase(newEmail)) {
            logger.warn("verifyEmailChange failed: Target email {} does not match requested email {} for user ID {}", newEmail, changeRequest.getNewEmail(), userId);
            throw new BadRequestException("The target email address does not match your active request.");
        }

        if (changeRequest.getExpiryTime().isBefore(java.time.LocalDateTime.now())) {
            logger.warn("verifyEmailChange failed: OTP expired for user ID {}", userId);
            emailChangeRequests.remove(userId);
            throw new BadRequestException("Verification code has expired. Please request a new one.");
        }

        if (!java.util.Objects.equals(changeRequest.getOtp(), otp)) {
            logger.warn("verifyEmailChange failed: Invalid OTP entered for user ID {}", userId);
            throw new BadRequestException("Invalid verification code. Please try again.");
        }

        logger.info("Checking if new email {} exists before finalizing user ID {}", newEmail, userId);
        if (userRepository.existsByEmail(newEmail)) {
            emailChangeRequests.remove(userId);
            throw new BadRequestException("Email is already taken by another account.");
        }

        // Update database
        logger.info("Saving updated email for user ID {}", userId);
        user.setEmail(newEmail);
        userRepository.save(user);

        // Clear the request
        emailChangeRequests.remove(userId);
        logger.info("Email updated successfully via verified OTP for user ID: {}", userId);
    }

    @Transactional
    public java.util.List<com.mediflow.dto.UserSessionDto> getUserSessions(Long userId, String currentPrincipalToken) {
        try {
            logger.info("Entering getUserSessions userId={}, currentPrincipalToken={}", userId, currentPrincipalToken);
            if (userId == null) {
                logger.warn("getUserSessions failed: userId is null");
                return new java.util.ArrayList<>();
            }
            logger.info("Querying userSessionRepository for active sessions of userId={}", userId);
            java.util.List<UserSession> sessions = userSessionRepository.findByUserIdAndIsActiveTrue(userId);
            java.util.List<com.mediflow.dto.UserSessionDto> dtoList = new java.util.ArrayList<>();
            if (sessions == null) {
                return dtoList;
            }
            
            java.time.LocalDateTime expirationCutoff = java.time.LocalDateTime.now().minus(java.time.Duration.ofMillis(jwtExpirationMs));
            
            for (UserSession session : sessions) {
                if (session == null) continue;
                logger.info("Processing session ID={}, token={}, is_active={}", session.getId(), session.getToken(), session.isActive());
                
                java.time.LocalDateTime loginTime = session.getLoginTime();
                if (loginTime == null) {
                    loginTime = java.time.LocalDateTime.now();
                }
                
                // Auto cleanup for sessions older than JWT expiration time
                if (loginTime.isBefore(expirationCutoff)) {
                    logger.info("Deactivating expired session ID={} (created at {})", session.getId(), loginTime);
                    session.setActive(false);
                    userSessionRepository.save(session);
                    continue;
                }
                
                boolean isCurrent = java.util.Objects.equals(session.getToken(), currentPrincipalToken);
                dtoList.add(new com.mediflow.dto.UserSessionDto(
                    session.getId(),
                    loginTime,
                    session.getDeviceInfo() != null ? session.getDeviceInfo() : "Unknown Device",
                    session.getBrowserInfo() != null ? session.getBrowserInfo() : "Unknown Browser",
                    isCurrent
                ));
            }
            logger.info("Returning {} sessions for userId={}", dtoList.size(), userId);
            return dtoList;
        } catch (Exception e) {
            logger.error("FULL ERROR in getUserSessions for userId={}", userId, e);
            return new java.util.ArrayList<>();
        }
    }

    @Transactional
    public void logoutSessionByToken(String sessionToken) {
        if (sessionToken != null) {
            userSessionRepository.findByToken(sessionToken).ifPresent(session -> {
                session.setActive(false);
                userSessionRepository.save(session);
                logger.info("Successfully revoked session by token: {}", sessionToken);
            });
        }
    }

    @Transactional
    public void logoutSession(Long userId, Long sessionId) {
        UserSession session = userSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Session not found."));

        if (!java.util.Objects.equals(session.getUser().getId(), userId)) {
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
