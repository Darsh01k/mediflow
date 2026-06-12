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

    @Transactional
    public AuthResponse authenticate(LoginRequest loginRequest) {
        logger.info("Attempting login/authentication for username: {}", loginRequest.getUsername());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
            String role = userPrincipal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

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
                User user = userRepository.findById(userPrincipal.getId())
                        .orElseThrow(() -> new BadRequestException("User profile not found"));
                if (user.getHospital() != null) {
                    profileId = user.getHospital().getId();
                }
            } else if (Role.PLATFORM_ADMIN.name().equals(role)) {
                profileId = userPrincipal.getId();
            }

            logger.info("User {} successfully authenticated with role: {}", loginRequest.getUsername(), role);
            return new AuthResponse(
                    jwt,
                    userPrincipal.getId(),
                    userPrincipal.getUsername(),
                    userPrincipal.getEmail(),
                    role,
                    profileId
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
}
