package com.mediflow.controller;

import com.mediflow.config.UserDetailsImpl;
import com.mediflow.dto.MedicalRecordDto;
import com.mediflow.dto.MedicalRecordRequestDto;
import com.mediflow.dto.PatientDto;
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

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    @Autowired
    private PatientService patientService;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<List<MedicalRecordDto>> getRecordsForPatient(@PathVariable Long patientId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isPrivileged = auth.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equals("ROLE_PLATFORM_ADMIN") || 
                a.getAuthority().equals("ROLE_HOSPITAL_ADMIN") || 
                a.getAuthority().equals("ROLE_DOCTOR"));

        if (!isPrivileged) {
            PatientDto patient = patientService.getPatientById(patientId);
            if (!patient.getUser().getUsername().equals(currentUsername)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }

        List<MedicalRecordDto> records = medicalRecordService.getRecordsForPatient(patientId);
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
