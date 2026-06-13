package com.mediflow.controller;

import com.mediflow.config.UserDetailsImpl;
import com.mediflow.dto.MedicalRecordDto;
import com.mediflow.dto.MedicalRecordRequestDto;
import com.mediflow.dto.PatientDto;
import com.mediflow.entity.Doctor;
import com.mediflow.entity.Role;
import com.mediflow.entity.User;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.DoctorRepository;
import com.mediflow.repository.UserRepository;
import com.mediflow.service.MedicalRecordService;
import com.mediflow.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<List<MedicalRecordDto>> getRecordsForPatient(@PathVariable Long patientId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        String roleStr = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        Role role = Role.valueOf(roleStr);

        if (role == Role.PATIENT) {
            PatientDto patient = patientService.getPatientById(patientId);
            if (!patient.getUser().getId().equals(userPrincipal.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } else if (role == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
            if (!patientService.isPatientOfDoctor(patientId, doctor.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } else if (role == Role.HOSPITAL_ADMIN) {
            User admin = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
            if (admin.getHospital() == null || !patientService.isPatientOfHospital(patientId, admin.getHospital().getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }

        List<MedicalRecordDto> records = medicalRecordService.getRecordsForPatient(patientId);

        if (role == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
            records = records.stream()
                    .filter(r -> r.getDoctor().getId().equals(doctor.getId()))
                    .collect(Collectors.toList());
        } else if (role == Role.HOSPITAL_ADMIN) {
            User admin = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
            Long hospitalId = admin.getHospital().getId();
            records = records.stream()
                    .filter(r -> r.getDoctor().getHospital() != null && r.getDoctor().getHospital().getId().equals(hospitalId))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(records);
    }

    @GetMapping("/my-records")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<MedicalRecordDto>> getMyRecords() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        List<MedicalRecordDto> records = medicalRecordService.getRecordsForPatientUser(userPrincipal.getId());
        return ResponseEntity.ok(records);
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalRecordDto> createRecord(@Valid @RequestBody MedicalRecordRequestDto requestDto) {
        MedicalRecordDto record = medicalRecordService.createRecord(requestDto);
        return new ResponseEntity<>(record, HttpStatus.CREATED);
    }
}
