package com.mediflow.repository;

import com.mediflow.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientIdOrderByVisitDateDesc(Long patientId);
    List<MedicalRecord> findByPatientUserIdOrderByVisitDateDesc(Long userId);
    List<MedicalRecord> findByDoctorIdOrderByVisitDateDesc(Long doctorId);
    List<MedicalRecord> findByDoctorUserIdOrderByVisitDateDesc(Long userId);
    List<MedicalRecord> findByDoctorHospitalIdOrderByVisitDateDesc(Long hospitalId);
}
