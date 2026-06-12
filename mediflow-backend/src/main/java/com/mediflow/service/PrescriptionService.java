package com.mediflow.service;

import com.mediflow.dto.PrescriptionDto;
import com.mediflow.dto.PrescriptionRequestDto;
import com.mediflow.entity.*;
import com.mediflow.exception.BadRequestException;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.*;
import com.mediflow.utils.DtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public PrescriptionDto createPrescription(PrescriptionRequestDto request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + request.getPatientId()));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + request.getDoctorId()));

        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with ID: " + request.getHospitalId()));

        Prescription prescription = new Prescription(
                patient,
                doctor,
                hospital,
                request.getPrescriptionDate(),
                request.getMedicinesJson(),
                request.getDosage(),
                request.getInstructions(),
                request.getNotes()
        );

        Prescription saved = prescriptionRepository.save(prescription);

        // Notify patient
        String message = String.format("A new prescription has been added by Dr. %s %s (%s).",
                doctor.getUser().getFirstName(),
                doctor.getUser().getLastName(),
                doctor.getSpecialization());
        notificationService.createNotification(patient.getUser(), message);

        return DtoMapper.toDto(saved);
    }

    public PrescriptionDto getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + id));
        return DtoMapper.toDto(prescription);
    }

    public List<PrescriptionDto> getPrescriptionsForUser(Long userId, Role role) {
        if (role == Role.PLATFORM_ADMIN) {
            return prescriptionRepository.findAll().stream()
                    .map(DtoMapper::toDto)
                    .collect(Collectors.toList());
        } else if (role == Role.HOSPITAL_ADMIN) {
            User admin = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Hospital Admin user not found with ID: " + userId));
            if (admin.getHospital() == null) {
                throw new BadRequestException("Hospital admin is not associated with any hospital");
            }
            return prescriptionRepository.findByHospitalIdOrderByPrescriptionDateDesc(admin.getHospital().getId()).stream()
                    .map(DtoMapper::toDto)
                    .collect(Collectors.toList());
        } else if (role == Role.DOCTOR) {
            return prescriptionRepository.findByDoctorUserIdOrderByPrescriptionDateDesc(userId).stream()
                    .map(DtoMapper::toDto)
                    .collect(Collectors.toList());
        } else if (role == Role.PATIENT) {
            return prescriptionRepository.findByPatientUserIdOrderByPrescriptionDateDesc(userId).stream()
                    .map(DtoMapper::toDto)
                    .collect(Collectors.toList());
        }
        throw new BadRequestException("Invalid role provided for retrieving prescriptions");
    }
}
