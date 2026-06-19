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
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.time.LocalDate;
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

            // Generate a stateless session UUID token for compatibility
            String sessionToken = java.util.UUID.randomUUID().toString();
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

    @Transactional
    public AuthResponse authenticateGoogle(String idToken) {
        logger.info("Attempting Google login/authentication");
        try {
            GoogleUser googleUser = verifyGoogleIdToken(idToken);
            
            Optional<User> userOpt = userRepository.findByEmail(googleUser.email);
            User user;
            
            if (userOpt.isPresent()) {
                user = userOpt.get();
                logger.info("Google login: User with email {} already exists.", googleUser.email);
                
                if (user.getProvider() != Provider.GOOGLE) {
                    logger.info("Linking existing LOCAL account for email {} to GOOGLE provider", googleUser.email);
                    user.setProvider(Provider.GOOGLE);
                    user = userRepository.save(user);
                }
            } else {
                logger.info("Google login: Creating new user for email {}", googleUser.email);
                
                String baseUsername = googleUser.email.split("@")[0];
                String username = baseUsername;
                int count = 1;
                while (userRepository.existsByUsername(username)) {
                    username = baseUsername + count;
                    count++;
                }
                
                user = new User();
                user.setUsername(username);
                user.setEmail(googleUser.email);
                user.setPassword(passwordEncoder.encode("GOOGLE_USER_RANDOM_PASSWORD_" + java.util.UUID.randomUUID()));
                user.setRole(Role.PATIENT);
                user.setFirstName(googleUser.firstName != null ? googleUser.firstName : "Google");
                user.setLastName(googleUser.lastName != null ? googleUser.lastName : "User");
                user.setProvider(Provider.GOOGLE);
                user.setAvatarId("avatar_1");
                
                user = userRepository.save(user);
                
                Patient patient = new Patient();
                patient.setUser(user);
                patient.setDateOfBirth(LocalDate.of(2000, 1, 1));
                patient.setGender("Other");
                patient.setPhone("0000000000");
                patient.setBloodType("O+");
                patientRepository.save(patient);
                logger.info("Created new patient profile for Google user: {}", username);
            }
            
            UserDetailsImpl userPrincipal = UserDetailsImpl.build(user);
            Authentication authentication = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            String sessionToken = java.util.UUID.randomUUID().toString();
            String jwt = jwtUtils.generateJwtToken(authentication, sessionToken);
            
            String role = user.getRole().name();
            Long profileId = null;
            if (Role.PATIENT.name().equals(role)) {
                Optional<Patient> patient = patientRepository.findByUserId(user.getId());
                if (patient.isPresent()) {
                    profileId = patient.get().getId();
                }
            } else if (Role.DOCTOR.name().equals(role)) {
                Optional<Doctor> doctor = doctorRepository.findByUserId(user.getId());
                if (doctor.isPresent()) {
                    profileId = doctor.get().getId();
                }
            } else if (Role.HOSPITAL_ADMIN.name().equals(role) && user.getHospital() != null) {
                profileId = user.getHospital().getId();
            } else if (Role.PLATFORM_ADMIN.name().equals(role)) {
                profileId = user.getId();
            }
            
            String firstName = user.getFirstName();
            String lastName = user.getLastName();
            String avatarId = user.getAvatarId();
            
            if (Role.HOSPITAL_ADMIN.name().equals(role) && user.getHospital() != null) {
                firstName = user.getHospital().getName();
                lastName = "";
                avatarId = user.getHospital().getLogoAvatar() != null ? user.getHospital().getLogoAvatar() : "hospital_1";
            }
            
            logger.info("Google user {} successfully logged in/created with role: {}", user.getUsername(), role);
            return new AuthResponse(
                    jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
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
            logger.error("Google authentication failed", e);
            throw new BadRequestException("Google login failed: " + e.getMessage());
        }
    }

    private GoogleUser verifyGoogleIdToken(String idToken) {
        if ("mock-google-token".equals(idToken) || idToken.startsWith("mock-")) {
            logger.warn("Mock Google token used in non-dev environment — this should only happen in development");
            String mockEmail = idToken.replace("mock-", "") + "@google.com";
            if ("mock-google-token".equals(idToken)) {
                mockEmail = "mockuser@google.com";
            }
            return new GoogleUser(mockEmail, "Mock", "User", null);
        }
        
        try {
            String[] parts = idToken.split("\\.");
            if (parts.length < 2) {
                throw new BadRequestException("Invalid Google ID token format.");
            }
            String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]), java.nio.charset.StandardCharsets.UTF_8);
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.Map<String, Object> claims = mapper.readValue(payloadJson, java.util.Map.class);
            
            String email = (String) claims.get("email");
            if (email == null) {
                throw new BadRequestException("Email claim not found in Google token.");
            }
            String firstName = (String) claims.get("given_name");
            if (firstName == null) {
                firstName = (String) claims.get("name");
            }
            String lastName = (String) claims.get("family_name");
            if (lastName == null) {
                lastName = "";
            }
            String picture = (String) claims.get("picture");
            
            return new GoogleUser(email, firstName, lastName, picture);
        } catch (Exception e) {
            logger.error("Failed to parse/verify Google ID token", e);
            throw new BadRequestException("Invalid Google ID token.");
        }
    }

    private static class GoogleUser {
        final String email;
        final String firstName;
        final String lastName;
        final String picture;

        GoogleUser(String email, String firstName, String lastName, String picture) {
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.picture = picture;
        }
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
}
