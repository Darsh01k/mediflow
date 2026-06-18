package com.mediflow.controller;

import com.mediflow.config.UserDetailsImpl;
import com.mediflow.dto.PrescriptionDto;
import com.mediflow.dto.PrescriptionRequestDto;
import com.mediflow.entity.Role;
import com.mediflow.entity.User;
import com.mediflow.repository.UserRepository;
import com.mediflow.exception.BadRequestException;
import com.mediflow.service.PrescriptionService;
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
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionDto> createPrescription(@Valid @RequestBody PrescriptionRequestDto requestDto) {
        PrescriptionDto created = prescriptionService.createPrescription(requestDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PrescriptionDto>> getPrescriptions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        String roleStr = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        Role role = Role.valueOf(roleStr);

        List<PrescriptionDto> prescriptions = prescriptionService.getPrescriptionsForUser(userPrincipal.getId(), role);
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionDto> getPrescriptionById(@PathVariable Long id) {
        PrescriptionDto dto = prescriptionService.getPrescriptionById(id);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        String roleStr = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        Role role = Role.valueOf(roleStr);

        // Security check: patients can only see their own prescriptions, doctors see their own
        if (role == Role.PATIENT && !dto.getPatient().getUser().getId().equals(userPrincipal.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        } else if (role == Role.DOCTOR && !dto.getDoctor().getUser().getId().equals(userPrincipal.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        } else if (role == Role.HOSPITAL_ADMIN) {
            User admin = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new BadRequestException("Admin not found"));
            if (dto.getHospital() == null || admin.getHospital() == null ||
                    !dto.getHospital().getId().equals(admin.getHospital().getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }

        return ResponseEntity.ok(dto);
    }
}
