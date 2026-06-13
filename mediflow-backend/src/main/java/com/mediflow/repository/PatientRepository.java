package com.mediflow.repository;

import com.mediflow.entity.Patient;
import com.mediflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUser(User user);
    Optional<Patient> findByUserId(Long userId);

    @Query("SELECT DISTINCT p FROM Patient p WHERE " +
           "p.id IN (SELECT a.patient.id FROM Appointment a WHERE a.doctor.id = :doctorId) OR " +
           "p.id IN (SELECT mr.patient.id FROM MedicalRecord mr WHERE mr.doctor.id = :doctorId) OR " +
           "p.id IN (SELECT pr.patient.id FROM Prescription pr WHERE pr.doctor.id = :doctorId)")
    List<Patient> findPatientsByDoctorId(@Param("doctorId") Long doctorId);
}
