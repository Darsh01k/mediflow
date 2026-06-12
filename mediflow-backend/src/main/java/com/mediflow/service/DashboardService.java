package com.mediflow.service;

import com.mediflow.dto.DashboardStatsDto;
import com.mediflow.entity.*;
import com.mediflow.exception.BadRequestException;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.*;
import com.mediflow.utils.DtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    public DashboardStatsDto getDashboardStats(Long userId, Role role) {
        long totalPatients = 0;
        long totalDoctors = 0;
        long totalAppointments = 0;
        long upcomingAppointments = 0;
        long completedAppointments = 0;
        long cancelledAppointments = 0;
        long totalPrescriptions = 0;
        long todayAppointments = 0;
        List<Appointment> recentAppointments = new ArrayList<>();
        List<MedicalRecord> recentRecords = new ArrayList<>();

        LocalDate today = LocalDate.now();

        if (role == Role.PLATFORM_ADMIN) {
            totalPatients = patientRepository.count();
            totalDoctors = doctorRepository.count();
            totalAppointments = appointmentRepository.count();
            totalPrescriptions = prescriptionRepository.count();
            
            List<Appointment> allAppointments = appointmentRepository.findAllByOrderByAppointmentDateDesc();
            recentAppointments = allAppointments.stream().limit(5).collect(Collectors.toList());
            
            upcomingAppointments = allAppointments.stream()
                    .filter(a -> a.getAppointmentDate().isAfter(LocalDateTime.now()) && 
                            (a.getStatus() == AppointmentStatus.SCHEDULED || a.getStatus() == AppointmentStatus.PENDING || a.getStatus() == AppointmentStatus.APPROVED))
                    .count();
            completedAppointments = allAppointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                    .count();
            cancelledAppointments = allAppointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED || a.getStatus() == AppointmentStatus.REJECTED)
                    .count();
            todayAppointments = allAppointments.stream()
                    .filter(a -> a.getAppointmentDate().toLocalDate().isEqual(today))
                    .count();

            recentRecords = medicalRecordRepository.findAll().stream()
                    .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                    .limit(5)
                    .collect(Collectors.toList());

        } else if (role == Role.HOSPITAL_ADMIN) {
            User admin = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Admin user not found with ID: " + userId));
            Hospital hospital = admin.getHospital();
            if (hospital == null) {
                throw new BadRequestException("Hospital admin is not associated with any hospital");
            }
            Long hospitalId = hospital.getId();

            totalDoctors = doctorRepository.findByHospitalId(hospitalId).size();
            List<Appointment> hospAppointments = appointmentRepository.findByDoctorHospitalIdOrderByAppointmentDateDesc(hospitalId);
            totalAppointments = hospAppointments.size();
            recentAppointments = hospAppointments.stream().limit(5).collect(Collectors.toList());

            upcomingAppointments = hospAppointments.stream()
                    .filter(a -> a.getAppointmentDate().isAfter(LocalDateTime.now()) && 
                            (a.getStatus() == AppointmentStatus.SCHEDULED || a.getStatus() == AppointmentStatus.PENDING || a.getStatus() == AppointmentStatus.APPROVED))
                    .count();
            completedAppointments = hospAppointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                    .count();
            cancelledAppointments = hospAppointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED || a.getStatus() == AppointmentStatus.REJECTED)
                    .count();
            todayAppointments = hospAppointments.stream()
                    .filter(a -> a.getAppointmentDate().toLocalDate().isEqual(today))
                    .count();

            totalPrescriptions = prescriptionRepository.findByHospitalIdOrderByPrescriptionDateDesc(hospitalId).size();

            // Distinct patients treated at this hospital
            totalPatients = hospAppointments.stream()
                    .map(a -> a.getPatient().getId())
                    .distinct()
                    .count();

            recentRecords = medicalRecordRepository.findByDoctorHospitalIdOrderByVisitDateDesc(hospitalId).stream()
                    .limit(5)
                    .collect(Collectors.toList());

        } else if (role == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user ID: " + userId));

            List<Appointment> docAppointments = appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctor.getId());
            totalAppointments = docAppointments.size();
            recentAppointments = docAppointments.stream().limit(5).collect(Collectors.toList());
            
            upcomingAppointments = docAppointments.stream()
                    .filter(a -> a.getAppointmentDate().isAfter(LocalDateTime.now()) && 
                            (a.getStatus() == AppointmentStatus.SCHEDULED || a.getStatus() == AppointmentStatus.PENDING || a.getStatus() == AppointmentStatus.APPROVED))
                    .count();
            completedAppointments = docAppointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                    .count();
            cancelledAppointments = docAppointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED || a.getStatus() == AppointmentStatus.REJECTED)
                    .count();
            todayAppointments = docAppointments.stream()
                    .filter(a -> a.getAppointmentDate().toLocalDate().isEqual(today))
                    .count();

            totalPrescriptions = prescriptionRepository.findByDoctorUserIdOrderByPrescriptionDateDesc(userId).size();

            // Distinct patients treated by this doctor
            totalPatients = docAppointments.stream()
                    .map(a -> a.getPatient().getId())
                    .distinct()
                    .count();

            totalDoctors = doctorRepository.count(); // Show system doctor count

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
                    .filter(a -> a.getAppointmentDate().isAfter(LocalDateTime.now()) && 
                            (a.getStatus() == AppointmentStatus.SCHEDULED || a.getStatus() == AppointmentStatus.PENDING || a.getStatus() == AppointmentStatus.APPROVED))
                    .count();
            completedAppointments = patAppointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                    .count();
            cancelledAppointments = patAppointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED || a.getStatus() == AppointmentStatus.REJECTED)
                    .count();
            todayAppointments = patAppointments.stream()
                    .filter(a -> a.getAppointmentDate().toLocalDate().isEqual(today))
                    .count();

            totalPrescriptions = prescriptionRepository.findByPatientUserIdOrderByPrescriptionDateDesc(userId).size();

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
                totalPrescriptions,
                todayAppointments,
                recentAppointments.stream().map(DtoMapper::toDto).collect(Collectors.toList()),
                recentRecords.stream().map(DtoMapper::toDto).collect(Collectors.toList())
        );
    }
}
