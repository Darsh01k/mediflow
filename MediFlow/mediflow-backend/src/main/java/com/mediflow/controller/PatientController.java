package com.mediflow.controller;

import com.mediflow.config.UserDetailsImpl;
import com.mediflow.dto.PatientDto;
import com.mediflow.dto.TimelineItemDto;
import com.mediflow.entity.Doctor;
import com.mediflow.entity.Role;
import com.mediflow.entity.User;
import com.mediflow.exception.BadRequestException;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.DoctorRepository;
import com.mediflow.repository.UserRepository;
import com.mediflow.service.HospitalService;
import com.mediflow.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private HospitalService hospitalService;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<List<PatientDto>> getAllPatients() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        String roleStr = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        Role role = Role.valueOf(roleStr);

        if (role == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user ID: " + userPrincipal.getId()));
            List<PatientDto> patients = patientService.getPatientsForDoctor(doctor.getId());
            return ResponseEntity.ok(patients);
        } else if (role == Role.HOSPITAL_ADMIN) {
            User admin = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
            if (admin.getHospital() == null) {
                throw new BadRequestException("Hospital admin is not associated with any hospital");
            }
            List<PatientDto> patients = hospitalService.getPatientsByHospital(admin.getHospital().getId());
            return ResponseEntity.ok(patients);
        } else if (role == Role.PLATFORM_ADMIN) {
            List<PatientDto> patients = patientService.getAllPatients();
            return ResponseEntity.ok(patients);
        }

        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        String roleStr = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        Role role = Role.valueOf(roleStr);

        if (role == Role.PATIENT) {
            PatientDto patient = patientService.getPatientById(id);
            if (!patient.getUser().getId().equals(userPrincipal.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } else if (role == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
            if (!patientService.isPatientOfDoctor(id, doctor.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } else if (role == Role.HOSPITAL_ADMIN) {
            User admin = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
            if (admin.getHospital() == null || !patientService.isPatientOfHospital(id, admin.getHospital().getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }

        PatientDto patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<PatientDto> getPatientByUserId(@PathVariable Long userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        String roleStr = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        Role role = Role.valueOf(roleStr);

        PatientDto patient = patientService.getPatientByUserId(userId);

        if (role == Role.PATIENT) {
            if (!patient.getUser().getId().equals(userPrincipal.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } else if (role == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
            if (!patientService.isPatientOfDoctor(patient.getId(), doctor.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } else if (role == Role.HOSPITAL_ADMIN) {
            User admin = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
            if (admin.getHospital() == null || !patientService.isPatientOfHospital(patient.getId(), admin.getHospital().getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }

        return ResponseEntity.ok(patient);
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<List<TimelineItemDto>> getPatientHistory(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        String roleStr = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        Role role = Role.valueOf(roleStr);

        if (role == Role.PATIENT) {
            PatientDto patient = patientService.getPatientById(id);
            if (!patient.getUser().getId().equals(userPrincipal.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            List<TimelineItemDto> history = patientService.getTimelineHistory(id);
            return ResponseEntity.ok(history);
        } else if (role == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
            if (!patientService.isPatientOfDoctor(id, doctor.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            List<TimelineItemDto> history = patientService.getTimelineHistoryForDoctor(id, doctor.getId());
            return ResponseEntity.ok(history);
        } else if (role == Role.HOSPITAL_ADMIN) {
            User admin = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
            if (admin.getHospital() == null) {
                throw new BadRequestException("Hospital admin is not associated with any hospital");
            }
            if (!patientService.isPatientOfHospital(id, admin.getHospital().getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            List<TimelineItemDto> history = patientService.getTimelineHistoryForHospital(id, admin.getHospital().getId());
            return ResponseEntity.ok(history);
        } else if (role == Role.PLATFORM_ADMIN) {
            List<TimelineItemDto> history = patientService.getTimelineHistory(id);
            return ResponseEntity.ok(history);
        }

        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<TimelineItemDto>> getMyHistory() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        PatientDto patient = patientService.getPatientByUserId(userPrincipal.getId());
        List<TimelineItemDto> history = patientService.getTimelineHistory(patient.getId());
        return ResponseEntity.ok(history);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('PATIENT')")
    public ResponseEntity<PatientDto> updatePatient(@PathVariable Long id, @RequestBody PatientDto patientDto) {
        PatientDto existingPatient = patientService.getPatientById(id);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isPlatformAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PLATFORM_ADMIN"));

        if (!isPlatformAdmin && !existingPatient.getUser().getUsername().equals(currentUsername)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        PatientDto updatedPatient = patientService.updatePatient(id, patientDto);
        return ResponseEntity.ok(updatedPatient);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
}
