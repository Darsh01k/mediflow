package com.mediflow.controller;

import com.mediflow.config.UserDetailsImpl;
import com.mediflow.dto.DoctorDto;
import com.mediflow.dto.HospitalDto;
import com.mediflow.dto.PatientDto;
import com.mediflow.entity.DoctorStatus;
import com.mediflow.entity.User;
import com.mediflow.exception.BadRequestException;
import com.mediflow.repository.UserRepository;
import com.mediflow.service.HospitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {

    @Autowired
    private HospitalService hospitalService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<HospitalDto>> getAllHospitals() {
        List<HospitalDto> hospitals = hospitalService.getAllHospitals();
        return ResponseEntity.ok(hospitals);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<com.mediflow.dto.NearbyHospitalDto>> getNearbyHospitals(
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lng", required = false) Double lng,
            @RequestParam(value = "city", required = false) String city) {
        
        String searchCity = city;
        if (lat == null && lng == null && (searchCity == null || searchCity.trim().isEmpty())) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
                User user = userRepository.findById(userPrincipal.getId()).orElse(null);
                if (user != null) {
                    searchCity = user.getCity();
                }
            }
        }
        
        List<com.mediflow.dto.NearbyHospitalDto> nearby = hospitalService.getNearbyHospitals(lat, lng, searchCity);
        return ResponseEntity.ok(nearby);
    }

    @GetMapping("/search")
    public ResponseEntity<List<HospitalDto>> searchHospitals(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "specialty", required = false) String specialty,
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lng", required = false) Double lng) {
        List<HospitalDto> hospitals = hospitalService.searchHospitals(name, city, state, specialty, lat, lng);
        return ResponseEntity.ok(hospitals);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HospitalDto> getHospitalById(@PathVariable Long id) {
        HospitalDto hospital = hospitalService.getHospitalById(id);
        return ResponseEntity.ok(hospital);
    }

    @GetMapping("/my-hospital")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<HospitalDto> getMyHospital() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User profile not found"));

        if (user.getHospital() == null) {
            throw new BadRequestException("Hospital admin is not associated with any hospital");
        }

        HospitalDto hospital = hospitalService.getHospitalById(user.getHospital().getId());
        return ResponseEntity.ok(hospital);
    }

    @PutMapping("/my-hospital")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<HospitalDto> updateMyHospital(@RequestBody HospitalDto hospitalDto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User profile not found"));

        if (user.getHospital() == null) {
            throw new BadRequestException("Hospital admin is not associated with any hospital");
        }

        HospitalDto updatedHospital = hospitalService.updateHospital(user.getHospital().getId(), hospitalDto);
        return ResponseEntity.ok(updatedHospital);
    }

    @GetMapping("/my-hospital/doctors")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<List<DoctorDto>> getMyHospitalDoctors() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User profile not found"));

        if (user.getHospital() == null) {
            throw new BadRequestException("Hospital admin is not associated with any hospital");
        }

        List<DoctorDto> doctors = hospitalService.getDoctorsByHospital(user.getHospital().getId());
        return ResponseEntity.ok(doctors);
    }

    @PutMapping("/my-hospital/doctors/{doctorId}/status")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<DoctorDto> updateDoctorStatus(
            @PathVariable Long doctorId,
            @RequestParam DoctorStatus status) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User profile not found"));

        if (user.getHospital() == null) {
            throw new BadRequestException("Hospital admin is not associated with any hospital");
        }

        DoctorDto updatedDoctor = hospitalService.updateDoctorStatus(user.getHospital().getId(), doctorId, status);
        return ResponseEntity.ok(updatedDoctor);
    }

    @GetMapping("/my-hospital/patients")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<List<PatientDto>> getMyHospitalPatients() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User profile not found"));

        if (user.getHospital() == null) {
            throw new BadRequestException("Hospital admin is not associated with any hospital");
        }

        List<PatientDto> patients = hospitalService.getPatientsByHospital(user.getHospital().getId());
        return ResponseEntity.ok(patients);
    }
}
