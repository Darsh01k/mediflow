package com.mediflow.service;

import com.mediflow.dto.MedicalRecordDto;
import com.mediflow.dto.MedicalRecordRequestDto;
import com.mediflow.entity.Doctor;
import com.mediflow.entity.MedicalRecord;
import com.mediflow.entity.Patient;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.DoctorRepository;
import com.mediflow.repository.MedicalRecordRepository;
import com.mediflow.repository.PatientRepository;
import com.mediflow.repository.PrescriptionRepository;
import com.mediflow.repository.HospitalRepository;
import com.mediflow.entity.Prescription;
import com.mediflow.entity.Hospital;
import com.mediflow.utils.DtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalRecordService {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private NotificationService notificationService;

    public List<MedicalRecordDto> getRecordsForPatient(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        return medicalRecordRepository.findByPatientIdOrderByVisitDateDesc(patientId).stream()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<MedicalRecordDto> getRecordsForPatientUser(Long userId) {
        return medicalRecordRepository.findByPatientUserIdOrderByVisitDateDesc(userId).stream()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicalRecordDto createRecord(MedicalRecordRequestDto request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId()));

        MedicalRecord record = new MedicalRecord(
                patient,
                doctor,
                request.getDiagnosis(),
                request.getPrescription(),
                request.getTreatmentNotes(),
                LocalDate.now()
        );

        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        // Automatically create Prescription if medicinesJson is provided
        if (request.getMedicinesJson() != null && !request.getMedicinesJson().trim().isEmpty()) {
            Hospital hospital = doctor.getHospital();
            if (hospital == null) {
                hospital = hospitalRepository.findById(1L).orElse(null);
            }
            if (hospital != null) {
                Prescription prescription = new Prescription(
                        patient,
                        doctor,
                        hospital,
                        LocalDate.now(),
                        request.getMedicinesJson(),
                        request.getDosage() != null ? request.getDosage() : "As directed",
                        request.getInstructions() != null ? request.getInstructions() : "As directed",
                        request.getDiagnosis() // Notes
                );
                prescriptionRepository.save(prescription);

                // Notify patient
                String message = String.format("A new prescription has been added by Dr. %s %s (%s).",
                        doctor.getUser().getFirstName(),
                        doctor.getUser().getLastName(),
                        doctor.getSpecialization());
                notificationService.createNotification(patient.getUser(), message);
            }
        }

        return DtoMapper.toDto(savedRecord);
    }
}
