package com.mediflow.repository;

import com.mediflow.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientIdOrderByPrescriptionDateDesc(Long patientId);
    List<Prescription> findByDoctorIdOrderByPrescriptionDateDesc(Long doctorId);
    List<Prescription> findByHospitalIdOrderByPrescriptionDateDesc(Long hospitalId);
    List<Prescription> findByPatientUserIdOrderByPrescriptionDateDesc(Long userId);
    List<Prescription> findByDoctorUserIdOrderByPrescriptionDateDesc(Long userId);
}
