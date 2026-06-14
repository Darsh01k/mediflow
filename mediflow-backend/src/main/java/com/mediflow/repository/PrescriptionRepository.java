package com.mediflow.repository;

import com.mediflow.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientIdOrderByPrescriptionDateDesc(Long patientId);
    List<Prescription> findByDoctorIdOrderByPrescriptionDateDesc(Long doctorId);
    List<Prescription> findByHospitalIdOrderByPrescriptionDateDesc(Long hospitalId);

    @Query("SELECT p FROM Prescription p WHERE p.patient.user.id = :userId ORDER BY p.prescriptionDate DESC")
    List<Prescription> findByPatientUserIdOrderByPrescriptionDateDesc(@Param("userId") Long userId);

    @Query("SELECT p FROM Prescription p WHERE p.doctor.user.id = :userId ORDER BY p.prescriptionDate DESC")
    List<Prescription> findByDoctorUserIdOrderByPrescriptionDateDesc(@Param("userId") Long userId);
}
