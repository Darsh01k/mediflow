package com.mediflow.utils;

import com.mediflow.dto.*;
import com.mediflow.entity.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class DtoMapperTest {

    @Test
    public void testUserToDto() {
        User user = new User("username", "password", "email@example.com", Role.PLATFORM_ADMIN, "First", "Last");
        user.setId(10L);

        UserDto dto = DtoMapper.toDto(user);

        assertNotNull(dto);
        assertEquals(10L, dto.getId());
        assertEquals("username", dto.getUsername());
        assertEquals("email@example.com", dto.getEmail());
        assertEquals(Role.PLATFORM_ADMIN, dto.getRole());
        assertEquals("First", dto.getFirstName());
        assertEquals("Last", dto.getLastName());
    }

    @Test
    public void testDoctorToDto() {
        User user = new User("doc1", "pwd", "doc@example.com", Role.DOCTOR, "Doc", "Name");
        user.setId(5L);
        
        Doctor doctor = new Doctor(user, "Cardiology", "LIC-999", BigDecimal.valueOf(150.00), "Bio text");
        doctor.setId(1L);
        doctor.setCreatedAt(LocalDateTime.now());

        DoctorDto dto = DtoMapper.toDto(doctor);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("Cardiology", dto.getSpecialization());
        assertEquals("LIC-999", dto.getLicenseNumber());
        assertEquals(BigDecimal.valueOf(150.00), dto.getConsultationFee());
        assertEquals("Bio text", dto.getBio());
        
        // Nested user details
        assertNotNull(dto.getUser());
        assertEquals(5L, dto.getUser().getId());
        assertEquals("doc1", dto.getUser().getUsername());
    }

    @Test
    public void testPatientToDto() {
        User user = new User("pat1", "pwd", "pat@example.com", Role.PATIENT, "Pat", "Name");
        user.setId(8L);

        Patient patient = new Patient(user, LocalDate.of(1990, 5, 15), "Male", "123456", "Addr", "Emerg", "O+");
        patient.setId(2L);

        PatientDto dto = DtoMapper.toDto(patient);

        assertNotNull(dto);
        assertEquals(2L, dto.getId());
        assertEquals(LocalDate.of(1990, 5, 15), dto.getDateOfBirth());
        assertEquals("Male", dto.getGender());
        assertEquals("123456", dto.getPhone());
        assertEquals("Addr", dto.getAddress());
        assertEquals("Emerg", dto.getEmergencyContact());
        assertEquals("O+", dto.getBloodType());

        // Nested user details
        assertNotNull(dto.getUser());
        assertEquals(8L, dto.getUser().getId());
    }

    @Test
    public void testNullMappings() {
        assertNull(DtoMapper.toDto((User) null));
        assertNull(DtoMapper.toDto((Doctor) null));
        assertNull(DtoMapper.toDto((Patient) null));
        assertNull(DtoMapper.toDto((Appointment) null));
        assertNull(DtoMapper.toDto((MedicalRecord) null));
    }
}
