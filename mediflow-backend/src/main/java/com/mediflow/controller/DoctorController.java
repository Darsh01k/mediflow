package com.mediflow.controller;

import com.mediflow.dto.DoctorDto;
import com.mediflow.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<DoctorDto>> getAllDoctors() {
        List<DoctorDto> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/search")
    public ResponseEntity<List<DoctorDto>> searchDoctors(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "specialization", required = false) String specialization,
            @RequestParam(value = "hospital", required = false) String hospital,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "experience", required = false) Integer experience) {
        List<DoctorDto> doctors = doctorService.searchDoctors(name, specialization, hospital, city, experience);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorDto> getDoctorById(@PathVariable Long id) {
        DoctorDto doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<DoctorDto> getDoctorByUserId(@PathVariable Long userId) {
        DoctorDto doctor = doctorService.getDoctorByUserId(userId);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isPrivileged = auth.getAuthorities().stream().anyMatch(a -> 
                a.getAuthority().equals("ROLE_PLATFORM_ADMIN") || 
                a.getAuthority().equals("ROLE_HOSPITAL_ADMIN"));

        if (!isPrivileged && !doctor.getUser().getUsername().equals(currentUsername)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        return ResponseEntity.ok(doctor);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<DoctorDto> updateDoctor(@PathVariable Long id, @RequestBody DoctorDto doctorDto) {
        DoctorDto existingDoctor = doctorService.getDoctorById(id);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isPrivileged = auth.getAuthorities().stream().anyMatch(a -> 
                a.getAuthority().equals("ROLE_PLATFORM_ADMIN") || 
                a.getAuthority().equals("ROLE_HOSPITAL_ADMIN"));

        if (!isPrivileged && !existingDoctor.getUser().getUsername().equals(currentUsername)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        DoctorDto updatedDoctor = doctorService.updateDoctor(id, doctorDto);
        return ResponseEntity.ok(updatedDoctor);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/specializations")
    public ResponseEntity<List<String>> getSpecializations() {
        List<String> specs = doctorService.getSpecializations();
        return ResponseEntity.ok(specs);
    }
}
