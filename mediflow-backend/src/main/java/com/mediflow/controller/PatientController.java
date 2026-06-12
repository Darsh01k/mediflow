package com.mediflow.controller;

import com.mediflow.config.UserDetailsImpl;
import com.mediflow.dto.PatientDto;
import com.mediflow.dto.TimelineItemDto;
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

    @GetMapping
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<List<PatientDto>> getAllPatients() {
        List<PatientDto> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable Long id) {
        PatientDto patient = patientService.getPatientById(id);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isPrivileged = auth.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equals("ROLE_PLATFORM_ADMIN") || 
                a.getAuthority().equals("ROLE_HOSPITAL_ADMIN") || 
                a.getAuthority().equals("ROLE_DOCTOR"));

        if (!isPrivileged && !patient.getUser().getUsername().equals(currentUsername)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<PatientDto> getPatientByUserId(@PathVariable Long userId) {
        PatientDto patient = patientService.getPatientByUserId(userId);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isPrivileged = auth.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equals("ROLE_PLATFORM_ADMIN") || 
                a.getAuthority().equals("ROLE_HOSPITAL_ADMIN") || 
                a.getAuthority().equals("ROLE_DOCTOR"));

        if (!isPrivileged && !patient.getUser().getUsername().equals(currentUsername)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<List<TimelineItemDto>> getPatientHistory(@PathVariable Long id) {
        PatientDto patient = patientService.getPatientById(id);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isPrivileged = auth.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equals("ROLE_PLATFORM_ADMIN") || 
                a.getAuthority().equals("ROLE_HOSPITAL_ADMIN") || 
                a.getAuthority().equals("ROLE_DOCTOR"));

        if (!isPrivileged && !patient.getUser().getUsername().equals(currentUsername)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<TimelineItemDto> history = patientService.getTimelineHistory(id);
        return ResponseEntity.ok(history);
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
