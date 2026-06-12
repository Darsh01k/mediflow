package com.mediflow.service;

import com.mediflow.dto.AppointmentDto;
import com.mediflow.dto.AppointmentRequestDto;
import com.mediflow.entity.*;
import com.mediflow.exception.BadRequestException;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.AppointmentRepository;
import com.mediflow.repository.DoctorRepository;
import com.mediflow.repository.PatientRepository;
import com.mediflow.repository.UserRepository;
import com.mediflow.utils.DtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public List<AppointmentDto> getAllAppointments() {
        return appointmentRepository.findAllByOrderByAppointmentDateDesc().stream()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<AppointmentDto> getAppointmentsForUser(Long userId, Role role) {
        if (role == Role.PLATFORM_ADMIN) {
            return getAllAppointments();
        } else if (role == Role.HOSPITAL_ADMIN) {
            User admin = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Admin user not found with ID: " + userId));
            if (admin.getHospital() == null) {
                throw new BadRequestException("Hospital admin is not associated with any hospital");
            }
            return appointmentRepository.findByDoctorHospitalIdOrderByAppointmentDateDesc(admin.getHospital().getId()).stream()
                    .map(DtoMapper::toDto)
                    .collect(Collectors.toList());
        } else if (role == Role.DOCTOR) {
            return appointmentRepository.findByDoctorUserIdOrderByAppointmentDateDesc(userId).stream()
                    .map(DtoMapper::toDto)
                    .collect(Collectors.toList());
        } else if (role == Role.PATIENT) {
            return appointmentRepository.findByPatientUserIdOrderByAppointmentDateDesc(userId).stream()
                    .map(DtoMapper::toDto)
                    .collect(Collectors.toList());
        }
        throw new BadRequestException("Invalid role provided for loading appointments");
    }

    public AppointmentDto getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return DtoMapper.toDto(appointment);
    }

    @Transactional
    public AppointmentDto bookAppointment(AppointmentRequestDto request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId()));

        if (request.getAppointmentDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot book an appointment in the past");
        }

        Appointment appointment = new Appointment(
                patient,
                doctor,
                request.getAppointmentDate(),
                AppointmentStatus.PENDING,
                request.getReason(),
                request.getNotes()
        );

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return DtoMapper.toDto(savedAppointment);
    }

    @Transactional
    public AppointmentDto rescheduleAppointment(Long id, LocalDateTime newDate) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        if (newDate.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot reschedule to a past date");
        }

        if (appointment.getStatus() != AppointmentStatus.PENDING && appointment.getStatus() != AppointmentStatus.APPROVED && appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new BadRequestException("Only pending or approved appointments can be rescheduled");
        }

        appointment.setAppointmentDate(newDate);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return DtoMapper.toDto(updatedAppointment);
    }

    @Transactional
    public AppointmentDto updateStatus(Long id, AppointmentStatus status, String notes) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        AppointmentStatus oldStatus = appointment.getStatus();
        appointment.setStatus(status);
        if (notes != null && !notes.isBlank()) {
            appointment.setNotes(notes);
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Notify patient on approval/rejection
        if (status == AppointmentStatus.APPROVED && oldStatus != AppointmentStatus.APPROVED) {
            String message = String.format("Your appointment with Dr. %s %s on %s has been APPROVED.",
                    appointment.getDoctor().getUser().getFirstName(),
                    appointment.getDoctor().getUser().getLastName(),
                    appointment.getAppointmentDate().toString().replace("T", " "));
            notificationService.createNotification(appointment.getPatient().getUser(), message);
        } else if (status == AppointmentStatus.REJECTED && oldStatus != AppointmentStatus.REJECTED) {
            String message = String.format("Your appointment with Dr. %s %s on %s has been REJECTED.",
                    appointment.getDoctor().getUser().getFirstName(),
                    appointment.getDoctor().getUser().getLastName(),
                    appointment.getAppointmentDate().toString().replace("T", " "));
            notificationService.createNotification(appointment.getPatient().getUser(), message);
        }

        return DtoMapper.toDto(updatedAppointment);
    }
}
