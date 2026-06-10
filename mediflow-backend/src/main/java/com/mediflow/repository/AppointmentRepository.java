package com.mediflow.repository;

import com.mediflow.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(Long patientId);
    List<Appointment> findByDoctorIdOrderByAppointmentDateDesc(Long doctorId);
    List<Appointment> findByPatientUserIdOrderByAppointmentDateDesc(Long userId);
    List<Appointment> findByDoctorUserIdOrderByAppointmentDateDesc(Long userId);
    List<Appointment> findAllByOrderByAppointmentDateDesc();
}
