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
        return DtoMapper.toDto(savedRecord);
    }
}
