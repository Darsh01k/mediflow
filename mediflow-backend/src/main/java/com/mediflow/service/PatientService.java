package com.mediflow.service;

import com.mediflow.dto.PatientDto;
import com.mediflow.dto.TimelineItemDto;
import com.mediflow.dto.UserDto;
import com.mediflow.entity.*;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.*;
import com.mediflow.utils.DtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    public List<PatientDto> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
    }

    public PatientDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        return DtoMapper.toDto(patient);
    }

    public PatientDto getPatientByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found for user id: " + userId));
        return DtoMapper.toDto(patient);
    }

    @Transactional
    public PatientDto updatePatient(Long id, PatientDto patientDto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        // Update Patient fields
        patient.setDateOfBirth(patientDto.getDateOfBirth());
        patient.setGender(patientDto.getGender());
        patient.setPhone(patientDto.getPhone());
        patient.setAddress(patientDto.getAddress());
        patient.setEmergencyContact(patientDto.getEmergencyContact());
        patient.setBloodType(patientDto.getBloodType());
        patient.setMedicalNotes(patientDto.getMedicalNotes());

        // Update nested User fields if provided
        if (patientDto.getUser() != null) {
            User user = patient.getUser();
            UserDto userDto = patientDto.getUser();
            user.setFirstName(userDto.getFirstName());
            user.setLastName(userDto.getLastName());
            user.setEmail(userDto.getEmail());
            if (userDto.getAvatarId() != null) {
                user.setAvatarId(userDto.getAvatarId());
            }
            userRepository.save(user);
        }

        Patient updatedPatient = patientRepository.save(patient);
        return DtoMapper.toDto(updatedPatient);
    }

    public List<TimelineItemDto> getTimelineHistory(Long patientId) {
        List<TimelineItemDto> timeline = new ArrayList<>();

        // 1. Add Appointments
        List<Appointment> appointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId);
        for (Appointment a : appointments) {
            timeline.add(new TimelineItemDto(
                "APPOINTMENT",
                a.getId(),
                a.getAppointmentDate(),
                "Appointment with Dr. " + a.getDoctor().getUser().getFirstName() + " " + a.getDoctor().getUser().getLastName(),
                a.getDoctor().getHospital() != null ? a.getDoctor().getHospital().getName() : "General Hospital",
                a.getReason() + (a.getNotes() != null && !a.getNotes().isBlank() ? " | Notes: " + a.getNotes() : ""),
                a.getStatus().name()
            ));
        }

        // 2. Add Prescriptions
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByPrescriptionDateDesc(patientId);
        for (Prescription p : prescriptions) {
            timeline.add(new TimelineItemDto(
                "PRESCRIPTION",
                p.getId(),
                p.getPrescriptionDate().atStartOfDay(),
                "Prescription from Dr. " + p.getDoctor().getUser().getFirstName() + " " + p.getDoctor().getUser().getLastName(),
                p.getHospital().getName(),
                p.getDosage() != null ? p.getDosage() : "Medicines prescribed",
                null
            ));
        }

        // 3. Add Medical Records (Visits)
        List<MedicalRecord> records = medicalRecordRepository.findByPatientIdOrderByVisitDateDesc(patientId);
        for (MedicalRecord r : records) {
            timeline.add(new TimelineItemDto(
                "VISIT",
                r.getId(),
                r.getVisitDate().atStartOfDay(),
                "Visit: " + r.getDiagnosis(),
                "Dr. " + r.getDoctor().getUser().getFirstName() + " " + r.getDoctor().getUser().getLastName(),
                r.getTreatmentNotes(),
                null
            ));
        }

        // Sort descending by date
        timeline.sort((t1, t2) -> t2.getDate().compareTo(t1.getDate()));

        return timeline;
    }

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        patientRepository.delete(patient);
    }
}
