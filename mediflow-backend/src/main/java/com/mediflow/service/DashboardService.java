package com.mediflow.service;

import com.mediflow.dto.DashboardStatsDto;
import com.mediflow.entity.*;
import com.mediflow.exception.BadRequestException;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.*;
import com.mediflow.utils.DtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    public DashboardStatsDto getDashboardStats(Long userId, Role role) {
        long totalPatients = 0;
        long totalDoctors = 0;
        long totalAppointments = 0;
        long upcomingAppointments = 0;
        long completedAppointments = 0;
        long cancelledAppointments = 0;
        List<Appointment> recentAppointments;
        List<MedicalRecord> recentRecords;

        if (role == Role.ADMIN) {
            totalPatients = patientRepository.count();
            totalDoctors = doctorRepository.count();
            totalAppointments = appointmentRepository.count();
            
            List<Appointment> allAppointments = appointmentRepository.findAllByOrderByAppointmentDateDesc();
            recentAppointments = allAppointments.stream().limit(5).collect(Collectors.toList());
            
            upcomingAppointments = allAppointments.stream()
                    .filter(a -> a.getAppointmentDate().isAfter(LocalDateTime.now()) && a.getStatus() == AppointmentStatus.SCHEDULED)
                    .count();
            completedAppointments = allAppointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                    .count();
            cancelledAppointments = allAppointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED)
                    .count();

            recentRecords = medicalRecordRepository.findAll().stream()
                    .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                    .limit(5)
                    .collect(Collectors.toList());

        } else if (role == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user ID: " + userId));

            List<Appointment> docAppointments = appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctor.getId());
            totalAppointments = docAppointments.size();
            recentAppointments = docAppointments.stream().limit(5).collect(Collectors.toList());
            
            upcomingAppointments = docAppointments.stream()
                    .filter(a -> a.getAppointmentDate().isAfter(LocalDateTime.now()) && a.getStatus() == AppointmentStatus.SCHEDULED)
                    .count();
            completedAppointments = docAppointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                    .count();
            cancelledAppointments = docAppointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED)
                    .count();

            // Distinct patients treated by this doctor
            totalPatients = docAppointments.stream()
                    .map(a -> a.getPatient().getId())
                    .distinct()
                    .count();

            totalDoctors = doctorRepository.count(); // Still show system doctor count

            recentRecords = medicalRecordRepository.findByDoctorIdOrderByVisitDateDesc(doctor.getId()).stream()
                    .limit(5)
                    .collect(Collectors.toList());

        } else if (role == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user ID: " + userId));

            List<Appointment> patAppointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patient.getId());
            totalAppointments = patAppointments.size();
            recentAppointments = patAppointments.stream().limit(5).collect(Collectors.toList());
            
            upcomingAppointments = patAppointments.stream()
                    .filter(a -> a.getAppointmentDate().isAfter(LocalDateTime.now()) && a.getStatus() == AppointmentStatus.SCHEDULED)
                    .count();
            completedAppointments = patAppointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                    .count();
            cancelledAppointments = patAppointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED)
                    .count();

            totalDoctors = doctorRepository.count();
            totalPatients = 1; // Self

            recentRecords = medicalRecordRepository.findByPatientIdOrderByVisitDateDesc(patient.getId()).stream()
                    .limit(5)
                    .collect(Collectors.toList());
        } else {
            throw new BadRequestException("Unsupported role for statistics");
        }

        return new DashboardStatsDto(
                totalPatients,
                totalDoctors,
                totalAppointments,
                upcomingAppointments,
                completedAppointments,
                cancelledAppointments,
                recentAppointments.stream().map(DtoMapper::toDto).collect(Collectors.toList()),
                recentRecords.stream().map(DtoMapper::toDto).collect(Collectors.toList())
        );
    }
}
