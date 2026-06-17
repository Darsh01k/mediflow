package com.mediflow.utils;

import com.mediflow.dto.*;
import com.mediflow.entity.*;

public class DtoMapper {

    public static UserDto toDto(User user) {
        if (user == null) return null;
        UserDto dto = new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getFirstName(),
                user.getLastName(),
                user.getAvatarId(),
                toDto(user.getHospital())
        );
        dto.setCity(user.getCity());
        dto.setState(user.getState());
        dto.setCountry(user.getCountry());
        dto.setProvider(user.getProvider());
        dto.setGoogleId(user.getGoogleId());
        return dto;
    }

    public static HospitalDto toDto(Hospital hospital) {
        if (hospital == null) return null;
        HospitalDto dto = new HospitalDto(
                hospital.getId(),
                hospital.getName(),
                hospital.getEmail(),
                hospital.getPhone(),
                hospital.getAddress(),
                hospital.getCity(),
                hospital.getState(),
                hospital.getPincode(),
                hospital.getLatitude(),
                hospital.getLongitude(),
                hospital.getLicenseNumber(),
                hospital.getDescription(),
                hospital.getLogoAvatar(),
                hospital.getCreatedAt()
        );
        dto.setHospitalType(hospital.getHospitalType());
        dto.setFacilities(hospital.getFacilities());
        dto.setNumberOfBeds(hospital.getNumberOfBeds());
        dto.setEmergencyServicesAvailable(
                hospital.getEmergencyServicesAvailable() != null ? 
                hospital.getEmergencyServicesAvailable() : false
        );
        dto.setWebsite(hospital.getWebsite());
        return dto;
    }

    public static PatientDto toDto(Patient patient) {
        if (patient == null) return null;
        return new PatientDto(
                patient.getId(),
                toDto(patient.getUser()),
                patient.getDateOfBirth(),
                patient.getGender(),
                patient.getPhone(),
                patient.getAddress(),
                patient.getEmergencyContact(),
                patient.getBloodType(),
                patient.getMedicalNotes(),
                patient.getCreatedAt()
        );
    }

    public static DoctorDto toDto(Doctor doctor) {
        if (doctor == null) return null;
        return new DoctorDto(
                doctor.getId(),
                toDto(doctor.getUser()),
                doctor.getSpecialization(),
                doctor.getLicenseNumber(),
                doctor.getConsultationFee(),
                doctor.getBio(),
                doctor.getPhone(),
                doctor.getQualification(),
                doctor.getExperience(),
                doctor.getLanguages(),
                doctor.getAvailability(),
                doctor.getStatus(),
                toDto(doctor.getHospital()),
                doctor.getCreatedAt()
        );
    }

    public static AppointmentDto toDto(Appointment appointment) {
        if (appointment == null) return null;
        return new AppointmentDto(
                appointment.getId(),
                toDto(appointment.getPatient()),
                toDto(appointment.getDoctor()),
                appointment.getAppointmentDate(),
                appointment.getStatus(),
                appointment.getReason(),
                appointment.getNotes(),
                appointment.getCreatedAt(),
                appointment.getUpdatedAt()
        );
    }

    public static MedicalRecordDto toDto(MedicalRecord record) {
        if (record == null) return null;
        return new MedicalRecordDto(
                record.getId(),
                toDto(record.getPatient()),
                toDto(record.getDoctor()),
                record.getDiagnosis(),
                record.getPrescription(),
                record.getTreatmentNotes(),
                record.getVisitDate(),
                record.getCreatedAt()
        );
    }

    public static PrescriptionDto toDto(Prescription prescription) {
        if (prescription == null) return null;
        return new PrescriptionDto(
                prescription.getId(),
                toDto(prescription.getPatient()),
                toDto(prescription.getDoctor()),
                toDto(prescription.getHospital()),
                prescription.getPrescriptionDate(),
                prescription.getMedicinesJson(),
                prescription.getDosage(),
                prescription.getInstructions(),
                prescription.getNotes(),
                prescription.getCreatedAt()
        );
    }

    public static NotificationDto toDto(Notification notification) {
        if (notification == null) return null;
        return new NotificationDto(
                notification.getId(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
