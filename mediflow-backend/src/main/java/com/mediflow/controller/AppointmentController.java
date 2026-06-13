package com.mediflow.controller;

import com.mediflow.config.UserDetailsImpl;
import com.mediflow.dto.AppointmentDto;
import com.mediflow.dto.AppointmentRequestDto;
import com.mediflow.entity.AppointmentStatus;
import com.mediflow.entity.Role;
import com.mediflow.entity.User;
import com.mediflow.repository.UserRepository;
import com.mediflow.exception.BadRequestException;
import com.mediflow.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<AppointmentDto>> getAppointments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        String roleStr = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        Role role = Role.valueOf(roleStr);

        List<AppointmentDto> appointments = appointmentService.getAppointmentsForUser(userPrincipal.getId(), role);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDto> getAppointmentById(@PathVariable Long id) {
        AppointmentDto appointment = appointmentService.getAppointmentById(id);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        String roleStr = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        Role role = Role.valueOf(roleStr);

        if (role == Role.DOCTOR) {
            if (!appointment.getDoctor().getUser().getId().equals(userPrincipal.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } else if (role == Role.HOSPITAL_ADMIN) {
            User admin = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new BadRequestException("Admin not found"));
            if (admin.getHospital() == null || appointment.getDoctor().getHospital() == null ||
                    !admin.getHospital().getId().equals(appointment.getDoctor().getHospital().getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } else if (role == Role.PATIENT) {
            if (!appointment.getPatient().getUser().getId().equals(userPrincipal.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } else if (role != Role.PLATFORM_ADMIN) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        return ResponseEntity.ok(appointment);
    }

    @PostMapping
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('PATIENT')")
    public ResponseEntity<AppointmentDto> bookAppointment(@Valid @RequestBody AppointmentRequestDto requestDto) {
        AppointmentDto appointment = appointmentService.bookAppointment(requestDto);
        return new ResponseEntity<>(appointment, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('PLATFORM_ADMIN') or hasRole('PATIENT')")
    public ResponseEntity<AppointmentDto> rescheduleAppointment(
            @PathVariable Long id,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime newDate) {
        
        AppointmentDto appointment = appointmentService.getAppointmentById(id);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isPlatformAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PLATFORM_ADMIN"));

        if (!isPlatformAdmin && !appointment.getPatient().getUser().getUsername().equals(currentUsername)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        AppointmentDto updated = appointmentService.rescheduleAppointment(id, newDate);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AppointmentDto> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") AppointmentStatus status,
            @RequestParam(value = "notes", required = false) String notes) {
        
        AppointmentDto appointment = appointmentService.getAppointmentById(id);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        
        boolean isPrivileged = auth.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equals("ROLE_PLATFORM_ADMIN") || 
                a.getAuthority().equals("ROLE_HOSPITAL_ADMIN") || 
                a.getAuthority().equals("ROLE_DOCTOR"));
        
        boolean isPatientSelf = appointment.getPatient().getUser().getUsername().equals(currentUsername);

        // Patients can only cancel their appointments
        if (isPatientSelf) {
            if (status != AppointmentStatus.CANCELLED) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } else if (!isPrivileged) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        // For Doctor role
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
            if (!appointment.getDoctor().getUser().getUsername().equals(currentUsername)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }

        // For Hospital Admin role
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_HOSPITAL_ADMIN"))) {
            User admin = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new BadRequestException("Admin not found"));
            if (admin.getHospital() == null || appointment.getDoctor().getHospital() == null ||
                    !admin.getHospital().getId().equals(appointment.getDoctor().getHospital().getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }

        AppointmentDto updated = appointmentService.updateStatus(id, status, notes);
        return ResponseEntity.ok(updated);
    }
}
